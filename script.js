const sun = document.getElementById("Sun");
const moon = document.getElementById("Moon");
const body = document.body;

const authWrapper = document.querySelector(".container.auth-wrapper");
const loading = document.getElementById("loading");
const Err = document.getElementById("Err");

const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const mobileLogin = document.getElementById("mobileLogin");
const mobileSignup = document.getElementById("mobileSignup");
const forgotLink = document.getElementById("forgot");
const submitButtons = document.querySelectorAll(".sign-btn");

let captchaToken = "";
let captchaWidgets = {};

function onCaptchaSolved(token) {
  captchaToken = token;
  Err.classList.add("none");
  submitButtons.forEach(b => b.classList.remove("disable"));
}

function resetCaptcha(type) {
  if (captchaWidgets[type]) {
    hcaptcha.reset(captchaWidgets[type]);
    captchaToken = "";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Theme Setup
  const isDark = localStorage.getItem("theme") === "dark";
  body.classList.toggle("dark-mode", isDark);
  sun.style.display = isDark ? "none" : "inline-block";
  moon.style.display = isDark ? "inline-block" : "none";

  loading.classList.add("hide");
  Err.classList.add("none");

  // Pre-render both hCaptchas
  captchaWidgets.login = hcaptcha.render("login-captcha", {
    sitekey: "fe6efd1a-9376-4e3a-8380-4b74578ed896",
    callback: onCaptchaSolved
  });

  captchaWidgets.signup = hcaptcha.render("signup-captcha", {
    sitekey: "fe6efd1a-9376-4e3a-8380-4b74578ed896",
    callback: onCaptchaSolved
  });

  // Toggle handlers
  function switchToSignup() {
    authWrapper.classList.add("right-panel-active");
    resetCaptcha("signup");
  }

  function switchToLogin() {
    authWrapper.classList.remove("right-panel-active");
    resetCaptcha("login");
  }

  signUpBtn?.addEventListener("click", switchToSignup);
  mobileSignup?.addEventListener("click", switchToSignup);

  signInBtn?.addEventListener("click", switchToLogin);
  mobileLogin?.addEventListener("click", switchToLogin);
});

// Theme toggle
sun?.addEventListener("click", () => {
  body.classList.add("dark-mode");
  sun.style.display = "none";
  moon.style.display = "inline-block";
  localStorage.setItem("theme", "dark");
});

moon?.addEventListener("click", () => {
  body.classList.remove("dark-mode");
  moon.style.display = "none";
  sun.style.display = "inline-block";
  localStorage.setItem("theme", "light");
});

// Password Toggle
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const inp = document.getElementById(icon.dataset.target);
    if (!inp) return;
    inp.type = inp.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye-slash");
  });
});

// Error system
let hideTimer;
function showError(msg, duration = 3000, sticky = false) {
  Err.textContent = msg;
  Err.classList.remove("none");
  clearTimeout(hideTimer);

  if (!sticky) {
    hideTimer = setTimeout(() => {
      Err.classList.add("none");
      Err.textContent = "";
    }, duration);
  }
}

// Forgot link
forgotLink?.addEventListener("click", () => {
  window.location.href = "https://buttnetworks.com/forgot";
});

// Validate before submit
submitButtons.forEach(btn => {
  btn.addEventListener("click", e => {
    if (!captchaToken) {
      e.preventDefault();
      showError("Solve the captcha first!");
    }
  });
});

// Form submission
document.querySelectorAll("form").forEach(formEl => {
  formEl.addEventListener("submit", async e => {
    e.preventDefault();

    const data = new FormData(formEl);
    const email = data.get("email")?.trim();
    const password = data.get("password")?.trim();
    const username = data.get("username")?.trim();
    const isSignup = authWrapper.classList.contains("right-panel-active");

    if (!email || !password) return showError("Fill email & password");

    if (!captchaToken) return showError("Solve captcha first!");

    const payload = {
      email,
      password,
      username,
      captchaToken,
      type: isSignup ? "signup" : "login"
    };

    try {
      loading.classList.remove("hide");
      loading.classList.add("loading");

      const res = await fetch(`${CONFIG.API_URL}/gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      captchaToken = "";

      resetCaptcha(isSignup ? "signup" : "login");

      if (result.err) {
        showError(result.err, 5000, true);
      } else if (res.ok && result.redirectTo) {
        window.location.assign(result.redirectTo);
      }
    } catch (err) {
      console.error(err);
      showError("Network error, try again.");
    } finally {
      loading.classList.add("hide");
      loading.classList.remove("loading");
    }
  });
});
