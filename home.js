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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

const submitContactForm = async () => {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submit");
  const loader = document.getElementById("loader");
  // Toggle visibility
  submitBtn.style.display = "none";
  loader.classList.remove("hidden");
  
  const fields = ["Name", "Email", "Phone", "Message"]; // ✅ define this early
  
  const name = document.getElementById("Name").value.trim();
  const email = document.getElementById("Email").value.trim();
  const phone = document.getElementById("Phone").value.trim();
  const message = document.getElementById("Message").value.trim();

  // basic validation — don’t ghost required fields 😤
  if (!name || !email || !phone || !message) {
    return false;
  }

  const data = { name, email, phone, message };
  const body = {
    data,
    type: "contact/form",
  };

  try {
    const res = await fetch(`https://api.buttnetworks.com/gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // ✅ clear inputs
      fields.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      const msg = document.getElementById("contactStatus");
      msg.classList.remove("none");
      msg.classList.add("show");
      msg.textContent = "Message sent successfully! ✅";
      loader.classList.add("hidden");
      
      
      // After submission
      loader.classList.add("hidden");
      submitBtn.style.display = "block";

      // Optionally reset form
      form.reset();
      setTimeout(() => {
        msg.classList.add("none");
        msg.classList.remove("show");
        msg.textContent = "";
      }, 7000);
    }
  } catch (error) {
    loader.classList.add("hidden");
    submitBtn.style.display = "block";
    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    
    const msg = document.getElementById("contactStatus");
    msg.classList.remove("none");
    msg.classList.add("show-err");
    msg.textContent = "Error while sending form 😢";

    setTimeout(() => {
      msg.classList.add("none");
      msg.classList.remove("show-err");
      msg.textContent = "";
    }, 7000);

    console.error("🚨 Error:", error);
  }
};

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault(); // 👈 stops the form from reloading the page
  await submitContactForm(); // your async logic
});
