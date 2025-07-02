// 🌗 Theme Toggle Elements
const sun = document.getElementById("Sun");
const moon = document.getElementById("Moon");
const body = document.body;

// 👥 Auth Container
const authWrapper = document.querySelector(".container.auth-wrapper");

// 📦 Loading + Error Elements
const loading = document.getElementById("loading");
const Err = document.getElementById("Err");

// 🔘 Form Toggle Buttons
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const mobileLogin = document.getElementById("mobileLogin");
const mobileSignup = document.getElementById("mobileSignup");
//forgot link
const forgotLink = document.getElementById("forgot");

const buttons = [
  document.getElementsByClassName("sign-btn")[0],
  document.getElementsByClassName("sign-btn")[1],
];
let captchaToken = "";

forgotLink.addEventListener("click", (e) => {
  window.location.assign();
});

// 🌊 Slide Panel Toggle Logic
function handleSlideToggle(addClass) {
  authWrapper.classList.add("disable-interactions");
  if (addClass) {
    authWrapper.classList.add("right-panel-active");
  } else {
    authWrapper.classList.remove("right-panel-active");
  }
  setTimeout(() => {
    authWrapper.classList.remove("disable-interactions");
  }, 650);
}

// 🌅 Restore Saved Theme
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";

  body.classList.toggle("dark-mode", isDark);
  sun.style.display = isDark ? "none" : "inline-block";
  moon.style.display = isDark ? "inline-block" : "none";

  loading?.classList.add("hide");
  Err?.classList.add("none");
});

// ☀️ Theme Switchers
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

// 👁️ Toggle Password Visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});
// 👥 Auth Slide Toggle on DOM Load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signUp")?.addEventListener("click", () => {
    authWrapper.classList.add("right-panel-active");
  });
  document.getElementById("signIn")?.addEventListener("click", () => {
    authWrapper.classList.remove("right-panel-active");
  });

  document.getElementById("mobileSignup")?.addEventListener("click", () => {
    authWrapper.classList.add("right-panel-active");
  });

  document.getElementById("mobileLogin")?.addEventListener("click", () => {
    authWrapper.classList.remove("right-panel-active");
  });
});

buttons.forEach((btn) => {
  btn?.addEventListener("click", (e) => {
    if (captchaToken === "") {
      e.preventDefault();
      showError("Solve the captcha first");
    }
  });
});

function onCaptchaSolved(token) {
  captchaToken = token;
  buttons.forEach((btn) => {
    btn.classList.remove("disable");
  });
  Err.classList.add("none");
  Err.innerText = "";
  return token;
}

// 🧠 Enable Button if Inputs Filled
document.querySelectorAll("form input").forEach((input) => {
  input.addEventListener("input", () => {
    const form = input.closest("form");
    const email = form.querySelector("input[type='email']");
    const pass = form.querySelector("input[type='password']");

    if (email?.value.trim() && pass?.value.trim()) {
      buttons.forEach((btn) => {
        btn.classList.remove("disable");
      });
      Err.classList.add("none");
      Err.innerText = "";
    }
  });
});
let isStickyError = false;

function showError(message, duration = 4000, sticky = false) {
  isStickyError = sticky;

  Err.classList.remove("none");
  Err.style.opacity = 1;
  Err.style.animation = "none";
  void Err.offsetHeight;
  Err.style.animation = `fadeInSlide ${duration}ms ease-in-out forwards`;
  Err.innerText = message;

  if (Err.hideTimeout) clearTimeout(Err.hideTimeout);

  if (!sticky) {
    Err.hideTimeout = setTimeout(() => {
      Err.style.opacity = 0;
      Err.classList.add("none");
      Err.innerText = "";
    }, duration);
  }
}
document.querySelectorAll("form input").forEach((input) => {
  input.addEventListener("input", () => {
    if (!isStickyError) {
      Err.classList.add("none");
      Err.innerText = "";
      Err.style.opacity = 0;
    }
  });
});
console.log("hcaptcha is:", hcaptcha); // should not be undefined

document.querySelectorAll("form").forEach((formEl) => {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const signUpInput = document.getElementsByClassName("signupInput");
    const loginInput = document.getElementsByClassName("loginInput");
    const formData = new FormData(formEl);
    const email = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();
    const username = formData.get("username")?.trim();
    const token = captchaToken;
    const btn = formEl.querySelector("button[type='submit']");

    if (!email || !password) {
      showError("Fill email and password", 3000);
      return;
    }

    if (!token || btn?.classList.contains("disable")) {
      showError("Solve the captcha first!", 3000);
      return;
    }

    const type = authWrapper.classList.contains("right-panel-active")
      ? "signup"
      : "login";

    const payload = {
      email,
      password,
      username,
      captchaToken: token,
      type,
    };

    try {
      loading.classList.remove("hide");
      loading.classList.add("loading");
      const res = await fetch(`${CONFIG.API_URL}/gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.err) {
        hcaptcha.reset(0);
        captchaToken = "";
        buttons.forEach((btn) => btn.classList.add("disable"));
        console.log(result)
        showError(result.err, 8000, true);
        switch (type) {
          case "signup":
            Array.from(signUpInput).forEach((elm) => {
              elm.nextElementSibling.classList.add("redLabel");
              elm.classList.add("shakeInput");
            });
            break;
          case "login":
            Array.from(loginInput).forEach((elm) => {
              elm.nextElementSibling.classList.add("redLabel");
              elm.classList.add("shakeInput");
            });
            break;

          default:
            break;
        }
      }
      if (res.ok && result.redirectTo) {
        loading.classList.remove("hide");
        loading.classList.add("loading");
        window.location.assign(result.redirectTo);
      }
    } catch (err) {
      hcaptcha.reset(0);
      console.log(err);
      console.error("❌ Form Error:", err);
    } finally {
      loading.classList.remove("loading");
      loading.classList.add("hide");
    }
  });
});
