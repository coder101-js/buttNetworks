document.addEventListener("DOMContentLoaded", () => {
  const sun = document.getElementById("Sun");
  const moon = document.getElementById("Moon");
  const body = document.body;
  const navLinks = document.getElementById("navLinks");
  const menuIcon = document.getElementById("menuIcon");

  // 🌙 Theme Switcher
  function setTheme(mode) {
    const isDark = mode === "dark";
    body.classList.toggle("dark-mode", isDark); // this line is 🔥
    localStorage.setItem("mode", mode);
    sun.style.display = isDark ? "none" : "inline-block";
    moon.style.display = isDark ? "inline-block" : "none";
  }

  // 💾 On load: read saved mode or system preference
  const savedMode = localStorage.getItem("mode");
  if (savedMode === "dark") {
    setTheme("dark");
  } else {
    setTheme("light");
  }

  // 🌓 Clicking the icons
  sun.addEventListener("click", () => setTheme("dark"));
  moon.addEventListener("click", () => setTheme("light"));

  // 🍔 Responsive Navbar Toggle
  menuIcon.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        navLinks.classList.remove("active");
      }
    });
  });

  // 🧭 Smooth Scrolling Utility
  function smoothScrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" ,block:'start'});
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const target = link.getAttribute("href").slice(1);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo(target);
    });
  });

  // 🎯 Button triggers
  document.getElementById("Intro-btn")?.addEventListener("click", () => {
    smoothScrollTo("deals");
  });
  ["Contact-btn1", "Contact-btn2", "Contact-btn3", "Contact-btn4"].forEach(
    (id) => {
      document
        .getElementById(id)
        ?.addEventListener("click", () => smoothScrollTo("contact"));
    }
  );
});
