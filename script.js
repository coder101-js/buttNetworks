// 🌗 Theme Toggle Elements
const sun = document.getElementById("Sun");
const moon = document.getElementById("Moon");
const body = document.body;

// 👥 Auth Container & UI Elements
const authWrapper = document.querySelector(".container.auth-wrapper");
const loading     = document.getElementById("loading");
const Err         = document.getElementById("Err");
const forgotLink  = document.getElementById("forgot");

// 🔘 Buttons & Captcha State
const signUpBtn   = document.getElementById("signUp");
const signInBtn   = document.getElementById("signIn");
const mobileLogin = document.getElementById("mobileLogin");
const mobileSignup= document.getElementById("mobileSignup");
const buttons     = [
  document.getElementsByClassName("sign-btn")[0],
  document.getElementsByClassName("sign-btn")[1],
];
let captchaToken  = "";
let captchaMap    = {}; // will hold { login: widgetId, signup: widgetId }

// 🛠 Utility: showError
let isStickyError = false;
function showError(message, duration = 4000, sticky = false) {
  isStickyError = sticky;
  Err.classList.remove("none");
  Err.style.opacity    = 1;
  Err.style.animation  = "none";
  void Err.offsetHeight;
  Err.style.animation  = `fadeInSlide ${duration}ms ease-in-out forwards`;
  Err.innerText        = message;

  if (Err.hideTimeout) clearTimeout(Err.hideTimeout);
  if (!sticky) {
    Err.hideTimeout = setTimeout(() => {
      Err.style.opacity = 0;
      Err.classList.add("none");
      Err.innerText = "";
    }, duration);
  }
}

// 👁️ Toggle Password Visibility
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    if (!input) return;
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

// 💡 onCaptchaSolved callback (called by hCaptcha)
function onCaptchaSolved(token) {
  captchaToken = token;
  buttons.forEach(btn => btn.classList.remove("disable"));
  Err.classList.add("none");
  Err.innerText = "";
}

// 🚀 DOMContentLoaded: setup theme, captchaMap, panel toggles, input watchers
window.addEventListener("DOMContentLoaded", () => {
  // — Restore Saved Theme
  const savedTheme = localStorage.getItem("theme");
  const isDark     = savedTheme === "dark";
  body.classList.toggle("dark-mode", isDark);
  sun.style.display  = isDark ? "none" : "inline-block";
  moon.style.display = isDark ? "inline-block" : "none";

  // — Hide loading + error initially
  loading?.classList.add("hide");
  Err?.classList.add("none");

  // — Build captchaMap from rendered widgets
  const widgets = hcaptcha.getWidgets(); // auto-rendered IDs
  if (widgets.length === 1) {
    captchaMap = { login: widgets[0], signup: widgets[0] };
  } else {
    captchaMap = { signup: widgets[0], login: widgets[1] };
  }
  console.log("🔍 captchaMap:", captchaMap);

  // — Panel toggle buttons
  signUpBtn?.addEventListener("click", () => authWrapper.classList.add("right-panel-active"));
  signInBtn?.addEventListener("click", () => authWrapper.classList.remove("right-panel-active"));
  mobileSignup?.addEventListener("click", () => authWrapper.classList.add("right-panel-active"));
  mobileLogin?.addEventListener("click", () => authWrapper.classList.remove("right-panel-active"));
});

// ☀️ Theme Switchers
sun?.addEventListener("click", () => {
  body.classList.add("dark-mode");
  sun.style.display  = "none";
  moon.style.display = "inline-block";
  localStorage.setItem("theme", "dark");
});
moon?.addEventListener("click", () => {
  body.classList.remove("dark-mode");
  moon.style.display = "none";
  sun.style.display  = "inline-block";
  localStorage.setItem("theme", "light");
});

// 🔗 Forgot link
forgotLink?.addEventListener("click", e => {
  e.preventDefault();
  window.location.assign("https://buttnetworks.com/forgot");
});

// 🧠 Enable submit buttons when inputs filled
document.querySelectorAll("form input").forEach(input => {
  input.addEventListener("input", () => {
    if (!isStickyError) {
      Err.classList.add("none");
      Err.style.opacity = 0;
      Err.innerText = "";
    }
    const form  = input.closest("form");
    const email = form.querySelector("input[type='email']");
    const pass  = form.querySelector("input[type='password']");
    if (email.value.trim() && pass.value.trim()) {
      buttons.forEach(btn => btn.classList.remove("disable"));
    }
  });
});

// 🚨 Prevent click if captcha not solved
buttons.forEach(btn => {
  btn?.addEventListener("click", e => {
    if (!captchaToken) {
      e.preventDefault();
      showError("Solve the captcha first", 3000);
    }
  });
});

// 🔄 Form submit handler
document.querySelectorAll("form").forEach(formEl => {
  formEl.addEventListener("submit", async e => {
    e.preventDefault();

    // — gather
    const formData = new FormData(formEl);
    const email    = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();
    const username = formData.get("username")?.trim();
    const btn      = formEl.querySelector("button[type='submit']");
    const token    = captchaToken;

    // — basic validations
    if (!email || !password) {
      showError("Fill email and password", 3000);
      return;
    }
    if (!token || btn.classList.contains("disable")) {
      showError("Solve the captcha first!", 3000);
      return;
    }

    // — determine type
    const type = authWrapper.classList.contains("right-panel-active")
      ? "signup"
      : "login";

    // — payload
    const payload = { email, password, username, captchaToken: token, type };

    try {
      loading.classList.remove("hide");
      loading.classList.add("loading");

      const res    = await fetch(`${CONFIG.API_URL}/gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.err) {
        // reset only the active widget
        const wid = captchaMap[type];
        if (wid !== undefined) hcaptcha.reset(wid);
        captchaToken = "";
        buttons.forEach(b => b.classList.add("disable"));
        showError(result.err, 8000, true);

        // shake inputs
        const inputs = type === "signup"
          ? document.getElementsByClassName("signupInput")
          : document.getElementsByClassName("loginInput");
        Array.from(inputs).forEach(elm => {
          elm.nextElementSibling.classList.add("redLabel");
          elm.classList.add("shakeInput");
        });
        return;
      }

      // success → redirect
      if (res.ok && result.redirectTo) {
        window.location.assign(result.redirectTo);
      }
    } catch (err) {
      // fallback reset
      const wid = captchaMap[type] ?? captchaMap.login;
      if (wid !== undefined) hcaptcha.reset(wid);
      console.error("❌ Form Error:", err);
    } finally {
      loading.classList.remove("loading");
      loading.classList.add("hide");
    }
  });
});
