
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Preloader
  setTimeout(() => {
    const pre = $('#preloader');
    pre?.classList.add('opacity-0');
    pre?.classList.add('transition-opacity');
    pre?.classList.add('duration-500');
    setTimeout(() => pre?.remove(), 520);
  }, 650);

  // Theme
  initTheme();
  $('#theme-toggle')?.addEventListener('click', toggleTheme);

  // Mobile menu
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  menuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
  }));

  // Smooth scroll handled via CSS; ensure closing mobile menu and focusing target
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }
    });
  });

  // Intersection Observer for reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Progress bars animate when in view
        if (entry.target.matches('#about, #skills, #projects, #journey, #contact') || entry.target.closest('#about')) {
          animateProgressBars();
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  $$('[data-reveal], section').forEach(el => io.observe(el));

  // Progress bars
  function animateProgressBars() {
    $$('.bar').forEach(bar => {
      const val = +bar.dataset.progress || 0;
      requestAnimationFrame(() => {
        bar.style.width = `${val}%`;
      });
    });
  }

  // Scroll spy
  const navLinks = $$('.nav-link');
  const sections = ['home','about','skills','projects','journey','contact'].map(id => document.getElementById(id)).filter(Boolean);
  const spy = () => {
    const y = window.scrollY + 120; // offset for navbar
    let current = sections[0]?.id || '';
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === `#${current}`) a.classList.add('active');
      else a.classList.remove('active');
    });
  };
  spy();
  window.addEventListener('scroll', throttle(spy, 100));

  // Tilt effect
  const tiltCards = $$('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -8;
      const ry = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(700px) rotateX(0) rotateY(0) translateZ(0)`;
    });
  });

  // Parallax shapes
  const parallaxEls = $$('[data-parallax]');
  window.addEventListener('mousemove', throttle((e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    parallaxEls.forEach(el => {
      const sp = parseFloat(el.dataset.speed || '0.05');
      el.style.transform = `translate(${dx * 20 * sp}px, ${dy * 20 * sp}px)`;
    });
  }, 16));

  // Button ripple
  $$('.ripple').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      btn.style.setProperty('--x', `${x}px`);
      btn.style.setProperty('--y', `${y}px`);
      btn.classList.add('is-animating');
      setTimeout(() => btn.classList.remove('is-animating'), 250);
    });
  });

  // Contact form (demo)
  const form = $('#contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    clearErrors();
    let valid = true;

    if (!name) { setError('name', 'Please enter your name.'); valid = false; }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setError('email', 'Please enter a valid email.'); valid = false; }
    if (!message || message.length < 10) { setError('message', 'Message should be at least 10 characters.'); valid = false; }

    if (!valid) return;

    // Simulate sending
    form.querySelector('button[type="submit"]').disabled = true;
    showToast('Message sent! I’ll reply soon.');
    setTimeout(() => {
      form.reset();
      form.querySelector('button[type="submit"]').disabled = false;
    }, 800);
  });

  function setError(field, msg) {
    const p = document.querySelector(`[data-error-for="${field}"]`);
    p.textContent = msg;
  }

  function clearErrors() { $$('.error-msg').forEach(e => e.textContent = ''); }

  // Toast
  function showToast(msg) {
    const toast = $('#toast');
    $('#toast-msg').textContent = msg;
    toast.classList.remove('hidden');
    toast.style.opacity = 0;
    toast.style.transform = 'translate(-50%, 10px)';
    requestAnimationFrame(() => {
      toast.style.transition = 'all .35s ease';
      toast.style.opacity = 1;
      toast.style.transform = 'translate(-50%, 0px)';
    });
    setTimeout(() => {
      toast.style.opacity = 0;
      toast.style.transform = 'translate(-50%, 10px)';
      setTimeout(() => toast.classList.add('hidden'), 350);
    }, 2400);
  }

  // Particles in hero
  initParticles('#hero-canvas');
});

// Theme handling
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const html = document.documentElement;
  if (saved === 'light') html.classList.remove('dark');
  else if (saved === 'dark') html.classList.add('dark');
  else html.classList.add('dark'); // default dark

  syncThemeIcon();
}

function toggleTheme() {
  const html = document.documentElement;
  html.classList.add('theme-transition');
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  syncThemeIcon();
  setTimeout(() => html.classList.remove('theme-transition'), 400);
}

function syncThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const sun = document.getElementById('icon-sun');
  const moon = document.getElementById('icon-moon');
  if (isDark) {
    sun?.classList.remove('hidden'); moon?.classList.add('hidden');
  } else {
    sun?.classList.add('hidden'); moon?.classList.remove('hidden');
  }
}

// Particles
function initParticles(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let w, h, dpr, particles;
  const COUNT = 70;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth = canvas.parentElement.clientWidth;
    h = canvas.clientHeight = Math.max(500, canvas.parentElement.clientHeight);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles) create();
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function create() {
    particles = new Array(COUNT).fill(0).map(() => ({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.3, 0.3), vy: rand(-0.25, 0.25),
      r: rand(1, 2.6),
      a: rand(0.2, 0.6)
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;

      // glow circles
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      const dark = document.documentElement.classList.contains('dark');
      const c1 = dark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.28)';
      const c2 = dark ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.2)';
      grad.addColorStop(0, c1);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.fillStyle = `rgba(148,163,184,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // subtle linking
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(99,102,241, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

// Throttle
function throttle(fn, wait) {
  let t = 0, lastArgs = null;
  return function throttled(...args) {
    const now = Date.now();
    if (now - t >= wait) {
      t = now; fn.apply(this, args);
    } else {
      lastArgs = args;
      clearTimeout(throttled._id);
      throttled._id = setTimeout(() => { t = Date.now(); fn.apply(this, lastArgs); }, wait - (now - t));
    }
  };
}