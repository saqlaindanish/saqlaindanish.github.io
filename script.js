document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const moonIcon = document.getElementById("moonIcon");
  const sunIcon = document.getElementById("sunIcon");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const preloader = document.getElementById("preloader");
  const year = document.getElementById("year");
  const navLinks = [...document.querySelectorAll(".nav-link, .mobile-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("mostfa-theme");
    } catch {
      return null;
    }
  };

  const setStoredTheme = (theme) => {
    try {
      window.localStorage.setItem("mostfa-theme", theme);
    } catch {
      return null;
    }
  };

  const storedTheme = getStoredTheme();
  const startDark = storedTheme ? storedTheme === "dark" : true;

  const applyTheme = (isDark) => {
    html.classList.toggle("dark", isDark);
    setStoredTheme(isDark ? "dark" : "light");
    moonIcon.classList.toggle("hidden", !isDark);
    sunIcon.classList.toggle("hidden", isDark);
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  applyTheme(startDark);

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const hidePreloader = () => {
    preloader?.classList.add("preloader-hidden");
    setTimeout(() => preloader?.remove(), 750);
  };

  window.addEventListener("load", () => setTimeout(hidePreloader, 450));
  setTimeout(hidePreloader, 1800);

  themeToggle?.addEventListener("click", () => {
    applyTheme(!html.classList.contains("dark"));
    window.dispatchEvent(new CustomEvent("themechange"));
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden", isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu?.classList.add("hidden");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const updateActiveNav = () => {
    const current = sections.reduce((active, section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 130 && rect.bottom >= 130 ? section.id : active;
    }, sections[0]?.id || "");

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  updateActiveNav();
  window.addEventListener("scroll", updateActiveNav, { passive: true });

  const revealItems = document.querySelectorAll("[data-reveal]");
  const progressItems = document.querySelectorAll(".progress-item");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -70px 0px" });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
      revealObserver.observe(item);
    });

    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = entry.target.getAttribute("data-level") || "0";
          const bar = entry.target.querySelector(".progress-track span");
          if (bar) {
            bar.style.width = `${level}%`;
          }
          progressObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    progressItems.forEach((item) => progressObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    progressItems.forEach((item) => {
      const bar = item.querySelector(".progress-track span");
      if (bar) {
        bar.style.width = `${item.getAttribute("data-level") || 0}%`;
      }
    });
  }

  document.querySelectorAll(".ripple").forEach((element) => {
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      element.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion;

  if (canTilt) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -8;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });

    window.addEventListener("mousemove", (event) => {
      const x = event.clientX - window.innerWidth / 2;
      const y = event.clientY - window.innerHeight / 2;

      document.querySelectorAll("[data-parallax]").forEach((shape) => {
        const speed = Number(shape.getAttribute("data-speed") || 0.04);
        shape.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0)`;
      });
    }, { passive: true });
  }

  const contactForm = document.getElementById("contactForm");
  const toast = document.getElementById("toast");

  const setError = (name, message) => {
    const error = document.querySelector(`[data-error-for="${name}"]`);
    if (error) {
      error.textContent = message;
    }
  };

  const showToast = () => {
    if (!toast) {
      return;
    }

    toast.classList.remove("hidden");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3200);
  };

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    setError("name", "");
    setError("email", "");
    setError("message", "");

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      isValid = false;
    }

    if (!emailPattern.test(email)) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (message.length < 10) {
      setError("message", "Please write at least 10 characters.");
      isValid = false;
    }

    if (isValid) {
      contactForm.reset();
      showToast();
    }
  });

  const canvas = document.getElementById("heroCanvas");

  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrame;

    const palette = () => html.classList.contains("dark")
      ? ["rgba(6,182,212,0.75)", "rgba(99,102,241,0.65)", "rgba(20,184,166,0.55)"]
      : ["rgba(14,116,144,0.36)", "rgba(79,70,229,0.34)", "rgba(13,148,136,0.3)"];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.offsetWidth * ratio);
      canvas.height = Math.floor(canvas.offsetHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.min(72, Math.max(34, Math.floor(window.innerWidth / 20)));
      const colors = palette();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20 || particle.x > canvas.offsetWidth + 20) {
          particle.vx *= -1;
        }
        if (particle.y < -20 || particle.y > canvas.offsetHeight + 20) {
          particle.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const dx = particle.x - next.x;
          const dy = particle.y - next.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 118) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = html.classList.contains("dark")
              ? `rgba(125, 211, 252, ${0.14 * (1 - distance / 118)})`
              : `rgba(15, 23, 42, ${0.08 * (1 - distance / 118)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("themechange", resize);
    window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));
  }
});


// for donwloading resume

function openURL() {
  var url = "Saqlain_Danish_Resume.pdf";

  window.open(url, "_blank");
}

// sending emails using Web3Forms
const form = document.getElementById('contact-form');
const result = document.getElementById('result');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  result.innerHTML = "Sending...";

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    });

    const data = await response.json();

    if (response.status === 200) {
      result.innerHTML = "✅ Message sent successfully! I'll get back to you soon.";
      form.reset();
    } else {
      result.innerHTML = "❌ Something went wrong. Please try again.";
    }
  } catch (error) {
    result.innerHTML = "❌ Network error. Please try again later.";
  }

  // Clear the message after 5 seconds
  setTimeout(() => { result.innerHTML = ""; }, 5000);
});