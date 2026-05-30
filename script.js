/**
 * ================================================================
 *  BHARATH & COMPANIES — Premium uPVC Website
 *  script.js — Ultra-Premium Animations & Interactions
 * ================================================================
 */

'use strict';

/* ───────────────────────────────────────────────────────────────
   1. GLOBAL STATE & UTILITIES
─────────────────────────────────────────────────────────────── */
const STATE = {
  scrollY: 0,
  lastScrollY: 0,
  scrollDir: 'down',
  viewportH: window.innerHeight,
  viewportW: window.innerWidth,
  isTouch: window.matchMedia('(pointer: coarse)').matches,
  rafId: null,
};

const raf = fn => requestAnimationFrame(fn);
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t) => a + (b - a) * t;
const map   = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

/* ───────────────────────────────────────────────────────────────
   2. SMOOTH SCROLL (native + offset for fixed header)
─────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 76; // navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile nav if open
      document.getElementById('navLinks')?.classList.remove('open');
      document.getElementById('navToggle')?.classList.remove('active');
    });
  });
}

/* ───────────────────────────────────────────────────────────────
   3. NAVBAR — scroll-aware, direction-aware
─────────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navbar) return;

  let hideTimer = null;

  function updateNavbar() {
    const y = window.pageYOffset;
    const dir = y > STATE.lastScrollY ? 'down' : 'up';

    // Scrolled class
    if (y > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on fast scroll down, reveal on scroll up
    if (dir === 'down' && y > 400 && y - STATE.lastScrollY > 4) {
      navbar.style.transform = 'translateY(-100%)';
    } else if (dir === 'up') {
      navbar.style.transform = 'translateY(0)';
    }

    STATE.lastScrollY = y;
  }

  navbar.style.transition = 'transform 0.42s cubic-bezier(0.22,0.61,0.36,1), background 0.35s, box-shadow 0.35s, padding 0.35s';

  window.addEventListener('scroll', updateNavbar, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', open);
    // Animate hamburger lines
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    const scrollMid = window.pageYOffset + STATE.viewportH / 3;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid && sec.offsetTop + sec.offsetHeight > scrollMid) {
        navAnchors.forEach(a => {
          a.classList.toggle('active-nav', a.getAttribute('href') === `#${sec.id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

/* ───────────────────────────────────────────────────────────────
   4. SCROLL REVEAL — IntersectionObserver with stagger
─────────────────────────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  });

  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });
}

/* ───────────────────────────────────────────────────────────────
   5. PARALLAX HERO — layered depth on scroll
─────────────────────────────────────────────────────────────── */
function initHeroParallax() {
  const heroImg     = document.querySelector('.hero-img');
  const heroContent = document.querySelector('.hero-content');
  const heroOverlay = document.querySelector('.hero-overlay');
  if (!heroImg || STATE.isTouch) return;

  function onScroll() {
    const y = window.pageYOffset;
    if (y > STATE.viewportH) return;
    const progress = y / STATE.viewportH;

    // Image drifts slower than scroll (parallax)
    heroImg.style.transform = `translateY(${y * 0.45}px) scale(1.06)`;

    // Content drifts up gently
    heroContent.style.transform = `translateY(${y * 0.22}px)`;
    heroContent.style.opacity   = `${1 - progress * 1.4}`;

    // Overlay deepens as you scroll
    heroOverlay.style.opacity = `${0.6 + progress * 0.4}`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ───────────────────────────────────────────────────────────────
   6. MAGNETIC CURSOR — premium desktop cursor effect
─────────────────────────────────────────────────────────────── */
function initMagneticCursor() {
  if (STATE.isTouch) return;

  // Create cursor elements
  const cursor = document.createElement('div');
  cursor.className = 'mag-cursor';
  cursor.innerHTML = '<div class="mag-inner"></div>';
  document.body.appendChild(cursor);

  const inner = cursor.querySelector('.mag-inner');

  // Inject cursor styles
  const style = document.createElement('style');
  style.textContent = `
    .mag-cursor {
      position: fixed;
      top: 0; left: 0;
      width: 38px; height: 38px;
      border: 1.5px solid rgba(47,163,184,0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%,-50%);
      transition: width 0.35s cubic-bezier(0.22,0.61,0.36,1),
                  height 0.35s cubic-bezier(0.22,0.61,0.36,1),
                  border-color 0.35s,
                  background 0.35s;
      mix-blend-mode: exclusion;
    }
    .mag-inner {
      position: absolute;
      top: 50%; left: 50%;
      width: 6px; height: 6px;
      background: var(--teal, #2FA3B8);
      border-radius: 50%;
      transform: translate(-50%,-50%);
      transition: width 0.25s, height 0.25s, background 0.25s;
    }
    .mag-cursor.hovering {
      width: 56px; height: 56px;
      border-color: rgba(47,163,184,0.8);
      background: rgba(47,163,184,0.06);
    }
    .mag-cursor.clicking .mag-inner {
      width: 14px; height: 14px;
    }
    .mag-cursor.on-dark {
      border-color: rgba(255,255,255,0.35);
    }
  `;
  document.head.appendChild(style);

  let cx = -100, cy = -100;
  let tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  });

  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));

  // Hover detection
  const hoverTargets = 'a, button, .product-card, .why-card, .gallery-item, .quality-card, input, select, textarea';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // RAF loop for smooth cursor trailing
  function animateCursor() {
    cx = lerp(cx, tx, 0.14);
    cy = lerp(cy, ty, 0.14);
    cursor.style.left = `${cx}px`;
    cursor.style.top  = `${cy}px`;
    raf(animateCursor);
  }
  raf(animateCursor);
}

/* ───────────────────────────────────────────────────────────────
   7. COUNTER ANIMATION — stats count up on entry
─────────────────────────────────────────────────────────────── */
function initCounters() {
  function countUp(el, target, suffix = '', duration = 1800) {
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
      const elapsed  = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      // Ease out expo
      const eased = 1 - Math.pow(2, -10 * progress);
      const value = eased * target;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) raf(() => update(performance.now()));
      else el.textContent = target + suffix;
    }
    raf(() => update(performance.now()));
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.dataset.count;
      if (!raw) return;
      const num    = parseFloat(raw);
      const suffix = el.dataset.suffix || '';
      countUp(el, num, suffix);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  // Auto-discover countable elements
  document.querySelectorAll('.pillar-num, .stat strong').forEach(el => {
    const text = el.textContent.trim();
    const match = text.match(/([\d.]+)([^0-9]*)/);
    if (!match) return;
    const num    = parseFloat(match[1]);
    const suffix = match[2] || '';
    el.dataset.count  = num;
    el.dataset.suffix = suffix;
    el.textContent    = '0' + suffix;
    observer.observe(el);
  });
}

/* ───────────────────────────────────────────────────────────────
   8. TILT EFFECT — 3D card tilt on hover (desktop only)
─────────────────────────────────────────────────────────────── */
function initTiltEffect() {
  if (STATE.isTouch) return;

  const cards = document.querySelectorAll('.product-card, .why-card, .quality-card');

  cards.forEach(card => {
    let animId = null;
    let currentRotX = 0, currentRotY = 0;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const targetRotX = -y * 10;
      const targetRotY =  x * 10;

      cancelAnimationFrame(animId);
      function animate() {
        currentRotX = lerp(currentRotX, targetRotX, 0.1);
        currentRotY = lerp(currentRotY, targetRotY, 0.1);
        card.style.transform =
          `perspective(900px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) translateZ(4px)`;
        animId = raf(animate);
      }
      animate();
    });

    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      function resetTilt() {
        currentRotX = lerp(currentRotX, 0, 0.1);
        currentRotY = lerp(currentRotY, 0, 0.1);
        card.style.transform =
          `perspective(900px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) translateZ(0px)`;
        if (Math.abs(currentRotX) > 0.05 || Math.abs(currentRotY) > 0.05) {
          animId = raf(resetTilt);
        } else {
          card.style.transform = '';
        }
      }
      resetTilt();
    });
  });
}

/* ───────────────────────────────────────────────────────────────
   9. PARTICLE FIELD — floating dots in hero (canvas-based)
─────────────────────────────────────────────────────────────── */
function initParticleField() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '1',
    opacity: '0.55',
  });
  hero.querySelector('.hero-bg').appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  let mouseX = -9999, mouseY = -9999;

  const PARTICLE_COUNT = STATE.isTouch ? 30 : 70;
  const TEAL = [47, 163, 184];

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x   = Math.random() * W;
      this.y   = initial ? Math.random() * H : H + 10;
      this.r   = Math.random() * 1.8 + 0.4;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = -(Math.random() * 0.6 + 0.2);
      this.a   = 0;
      this.ta  = Math.random() * 0.55 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 220 + 120;
    }
    update() {
      this.life++;
      if (this.life < 40)       this.a = lerp(this.a, this.ta, 0.06);
      if (this.life > this.maxLife - 40) this.a = lerp(this.a, 0, 0.07);

      // Repel from mouse
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        const force = (90 - dist) / 90 * 0.4;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      this.vx *= 0.97;
      this.vy *= 0.97;
      this.x  += this.vx;
      this.y  += this.vy;

      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${TEAL.join(',')}, ${this.a})`;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  // Draw connecting lines between nearby particles
  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${TEAL.join(',')}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    raf(loop);
  }

  // Mouse interaction
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  resize();
  createParticles();
  loop();
  window.addEventListener('resize', () => { resize(); createParticles(); });
}

/* ───────────────────────────────────────────────────────────────
   10. MORPHING GRADIENT OVERLAY — hero ambient light shift
─────────────────────────────────────────────────────────────── */
function initAmbientLight() {
  const overlay = document.querySelector('.hero-overlay');
  if (!overlay || STATE.isTouch) return;

  let angle = 0;
  function animate() {
    angle += 0.003;
    const x = 50 + Math.sin(angle)       * 12;
    const y = 50 + Math.cos(angle * 0.7) * 8;
    overlay.style.background =
      `radial-gradient(ellipse at ${x}% ${y}%, rgba(47,163,184,0.08) 0%, transparent 55%),
       linear-gradient(to bottom, rgba(10,28,53,0.45) 0%, rgba(10,28,53,0.78) 100%)`;
    raf(animate);
  }
  raf(animate);
}

/* ───────────────────────────────────────────────────────────────
   11. GALLERY LIGHTBOX — clean full-screen viewer
─────────────────────────────────────────────────────────────── */
function initLightbox() {
  const items  = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Build lightbox DOM
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lb-bg"></div>
    <button class="lb-close" aria-label="Close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <button class="lb-prev" aria-label="Previous">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    <button class="lb-next" aria-label="Next">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
    <div class="lb-img-wrap">
      <img class="lb-img" src="" alt="" />
      <div class="lb-caption"></div>
    </div>
  `;
  document.body.appendChild(lb);

  // Inject lightbox styles
  const lbStyle = document.createElement('style');
  lbStyle.textContent = `
    .lightbox {
      position: fixed; inset: 0; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.4s cubic-bezier(0.22,0.61,0.36,1);
    }
    .lightbox.open { opacity: 1; pointer-events: all; }
    .lb-bg {
      position: absolute; inset: 0;
      background: rgba(8,20,40,0.96);
      backdrop-filter: blur(20px);
    }
    .lb-img-wrap {
      position: relative; z-index: 1;
      max-width: min(90vw, 1100px);
      max-height: 90vh;
      display: flex; flex-direction: column;
      align-items: center;
      transform: scale(0.94);
      transition: transform 0.45s cubic-bezier(0.22,0.61,0.36,1);
    }
    .lightbox.open .lb-img-wrap { transform: scale(1); }
    .lb-img {
      max-width: 100%; max-height: 80vh;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5);
    }
    .lb-caption {
      margin-top: 16px;
      font-family: 'Outfit', sans-serif;
      font-size: 0.82rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
    }
    .lb-close, .lb-prev, .lb-next {
      position: absolute; z-index: 2;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      color: white; border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }
    .lb-close { top: 20px; right: 20px; width: 46px; height: 46px; }
    .lb-prev  { left: 20px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; }
    .lb-next  { right: 20px; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; }
    .lb-close:hover, .lb-prev:hover, .lb-next:hover { background: rgba(47,163,184,0.25); }
    .lb-prev:hover { transform: translateY(-50%) scale(1.08); }
    .lb-next:hover { transform: translateY(-50%) scale(1.08); }
    @media (max-width: 600px) {
      .lb-prev { left: 10px; } .lb-next { right: 10px; }
    }
  `;
  document.head.appendChild(lbStyle);

  const lbImg     = lb.querySelector('.lb-img');
  const lbCaption = lb.querySelector('.lb-caption');
  let current = 0;
  const images = [...items].map(item => ({
    src:     item.querySelector('img')?.src || '',
    alt:     item.querySelector('img')?.alt || '',
    caption: item.querySelector('.gallery-overlay span')?.textContent || '',
  }));

  function open(idx) {
    current = (idx + images.length) % images.length;
    lbImg.src     = images[current].src;
    lbImg.alt     = images[current].alt;
    lbCaption.textContent = images[current].caption;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-bg').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => open(current - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => open(current + 1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  open(current - 1);
    if (e.key === 'ArrowRight') open(current + 1);
  });
}

/* ───────────────────────────────────────────────────────────────
   12. CONTACT FORM — smart validation + success state
─────────────────────────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),    rule: v => v.trim().length >= 2,   msg: 'Please enter your full name.' },
    phone:   { el: form.querySelector('#phone'),   rule: v => /^[\d\s+\-()]{7,}$/.test(v), msg: 'Enter a valid phone number.' },
    product: { el: form.querySelector('#product'), rule: v => v !== '',               msg: 'Please select a product.' },
  };

  function showError(el, msg) {
    el.style.borderColor = '#e05b5b';
    el.style.boxShadow   = '0 0 0 3px rgba(224,91,91,0.12)';
    let err = el.parentElement.querySelector('.field-err');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-err';
      err.style.cssText = 'font-size:0.72rem;color:#e05b5b;margin-top:4px;display:block;';
      el.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }

  function clearError(el) {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
    const err = el.parentElement.querySelector('.field-err');
    if (err) err.remove();
  }

  // Live validation
  Object.values(fields).forEach(({ el, rule, msg }) => {
    el?.addEventListener('blur', () => {
      if (!rule(el.value)) showError(el, msg);
      else clearError(el);
    });
    el?.addEventListener('input', () => {
      if (rule(el.value)) clearError(el);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    Object.values(fields).forEach(({ el, rule, msg }) => {
      if (!el) return;
      if (!rule(el.value)) { showError(el, msg); valid = false; }
      else clearError(el);
    });
    if (!valid) return;

    // Simulate submission with loading state
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled    = true;
    btn.style.opacity = '0.75';

    setTimeout(() => {
      const card = form.closest('.contact-form-card');
      card.innerHTML = `
        <div class="form-success">
          <div class="check-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h4>Thank You!</h4>
          <p>We've received your enquiry and will get back to you within 2 business hours.</p>
          <br />
          <a href="tel:9585751941" class="btn-primary btn-sm" style="display:inline-flex;text-decoration:none;">
            Call us now: 9585751941
          </a>
        </div>`;
    }, 1600);
  });
}

/* ───────────────────────────────────────────────────────────────
   13. SECTION PROGRESS BAR — ultra-thin scroll indicator
─────────────────────────────────────────────────────────────── */
function initProgressBar() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'linear-gradient(to right, #2FA3B8, #3BBFD6)',
    zIndex:     '10001',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
    boxShadow:  '0 0 8px rgba(47,163,184,0.6)',
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = (window.pageYOffset / scrollable) * 100;
    bar.style.width  = `${clamp(progress, 0, 100)}%`;
  }, { passive: true });
}

/* ───────────────────────────────────────────────────────────────
   14. GLARE EFFECT — premium shine on product cards
─────────────────────────────────────────────────────────────── */
function initGlareEffect() {
  if (STATE.isTouch) return;

  document.querySelectorAll('.product-card').forEach(card => {
    const glare = document.createElement('div');
    glare.className = 'card-glare';
    Object.assign(glare.style, {
      position: 'absolute', inset: '0',
      borderRadius: 'inherit',
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)',
      pointerEvents: 'none',
      transition: 'background 0.15s',
      zIndex: '5',
    });
    card.style.position = 'relative';
    card.appendChild(glare);

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      glare.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.09) 0%, transparent 55%)`;
    });

    card.addEventListener('mouseleave', () => {
      glare.style.background =
        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)';
    });
  });
}

/* ───────────────────────────────────────────────────────────────
   15. FLOATING CALL BUTTON — pulse ring animation
─────────────────────────────────────────────────────────────── */
function initFloatingButton() {
  const btn = document.querySelector('.float-call');
  if (!btn) return;

  const ring = document.createElement('span');
  ring.className = 'float-ring';
  Object.assign(ring.style, {
    position: 'absolute', inset: '-6px',
    borderRadius: '50%',
    border: '2px solid rgba(47,163,184,0.5)',
    animation: 'floatRingPulse 2.4s ease-out infinite',
    pointerEvents: 'none',
  });
  btn.style.position = 'relative';
  btn.appendChild(ring);

  const ring2 = ring.cloneNode();
  ring2.style.animationDelay = '1.2s';
  btn.appendChild(ring2);

  const pStyle = document.createElement('style');
  pStyle.textContent = `
    @keyframes floatRingPulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0;   }
    }
  `;
  document.head.appendChild(pStyle);
}

/* ───────────────────────────────────────────────────────────────
   16. SECTION DIVIDER — animated geometric lines
─────────────────────────────────────────────────────────────── */
function injectDividers() {
  const style = document.createElement('style');
  style.textContent = `
    .section-divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(47,163,184,0.3), transparent);
      position: relative;
      overflow: visible;
    }
    .section-divider::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 6px; height: 6px;
      background: var(--teal, #2FA3B8);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(47,163,184,0.6);
    }
  `;
  document.head.appendChild(style);
}

/* ───────────────────────────────────────────────────────────────
   17. TEXTURE NOISE OVERLAY — subtle grain for premium feel
─────────────────────────────────────────────────────────────── */
function initNoiseTexture() {
  const canvas = document.createElement('canvas');
  canvas.width  = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(256, 256);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    imageData.data[i]     = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 12; // very subtle
  }
  ctx.putImageData(imageData, 0, 0);

  const noiseEl = document.createElement('div');
  Object.assign(noiseEl.style, {
    position: 'fixed',
    inset: '0',
    backgroundImage: `url(${canvas.toDataURL()})`,
    backgroundRepeat: 'repeat',
    pointerEvents: 'none',
    zIndex: '9998',
    opacity: '0.35',
    mixBlendMode: 'overlay',
  });
  document.body.appendChild(noiseEl);
}

/* ───────────────────────────────────────────────────────────────
   18. TYPED TEXT EFFECT — hero tagline cycling
─────────────────────────────────────────────────────────────── */
function initTypedEffect() {
  const phrases = [
    'Premium uPVC Windows & Doors',
    'Soundproof & Weather Resistant',
    'RoHS & EN 12606 Certified',
    'Trusted for 20+ Years',
  ];

  const container = document.createElement('div');
  container.className = 'typed-bar';
  Object.assign(container.style, {
    position: 'absolute',
    bottom: '100px',
    right: 'clamp(20px, 5vw, 60px)',
    zIndex: '2',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.75rem',
    fontWeight: '500',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: "'Outfit', sans-serif",
  });

  const labelEl = document.createElement('span');
  labelEl.textContent = '//';
  labelEl.style.color = 'rgba(47,163,184,0.7)';

  const textEl = document.createElement('span');
  textEl.className = 'typed-text';
  const cursor = document.createElement('span');
  Object.assign(cursor.style, {
    display: 'inline-block',
    width: '1.5px',
    height: '12px',
    background: 'rgba(47,163,184,0.7)',
    marginLeft: '3px',
    animation: 'blink 1s step-end infinite',
  });

  const blinkStyle = document.createElement('style');
  blinkStyle.textContent = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`;
  document.head.appendChild(blinkStyle);

  container.appendChild(labelEl);
  container.appendChild(textEl);
  container.appendChild(cursor);

  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.querySelector('.hero-content')?.appendChild(container);

  let phraseIdx = 0, charIdx = 0, deleting = false;
  const SPEED_TYPE = 55, SPEED_DEL = 30, PAUSE = 2200;

  function type() {
    const phrase = phrases[phraseIdx];
    if (!deleting && charIdx <= phrase.length) {
      textEl.textContent = phrase.substring(0, charIdx++);
      setTimeout(type, SPEED_TYPE);
    } else if (!deleting && charIdx > phrase.length) {
      deleting = true;
      setTimeout(type, PAUSE);
    } else if (deleting && charIdx >= 0) {
      textEl.textContent = phrase.substring(0, charIdx--);
      setTimeout(type, SPEED_DEL);
    } else {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(type, 300);
    }
  }
  setTimeout(type, 2000);
}

/* ───────────────────────────────────────────────────────────────
   19. SECTION ENTER TRANSITIONS — staggered content entrance
─────────────────────────────────────────────────────────────── */
function initSectionTransitions() {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const section = entry.target;
      const animatables = section.querySelectorAll(
        '.section-label, .section-title, .section-desc, .about-lead, .about-text, .about-pillars, .why-intro, .cert-row, .contact-desc, .contact-info'
      );
      animatables.forEach((el, i) => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.7s cubic-bezier(0.22,0.61,0.36,1) ${i * 0.12}s, transform 0.7s cubic-bezier(0.22,0.61,0.36,1) ${i * 0.12}s`;
        // Trigger in next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });
      sectionObserver.unobserve(section);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));
}

/* ───────────────────────────────────────────────────────────────
   20. RESIZE HANDLER
─────────────────────────────────────────────────────────────── */
function initResizeHandler() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      STATE.viewportH = window.innerHeight;
      STATE.viewportW = window.innerWidth;
    }, 150);
  });
}

/* ───────────────────────────────────────────────────────────────
   21. ACTIVE NAV STYLE
─────────────────────────────────────────────────────────────── */
function injectActiveNavStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active-nav {
      color: #fff !important;
      background: rgba(47,163,184,0.15) !important;
    }
  `;
  document.head.appendChild(style);
}

/* ───────────────────────────────────────────────────────────────
   22. BACK-TO-TOP — smooth return with progress indicator
─────────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 15l7-7 7 7"/></svg>`;
  btn.setAttribute('aria-label', 'Back to top');
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '100px',
    right: '28px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'rgba(15,39,68,0.85)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '998',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'opacity 0.3s, transform 0.3s, background 0.2s',
    backdropFilter: 'blur(10px)',
  });
  document.body.appendChild(btn);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(47,163,184,0.85)');
  btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(15,39,68,0.85)');

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 600) {
      btn.style.opacity   = '1';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity   = '0';
      btn.style.transform = 'translateY(10px)';
    }
  }, { passive: true });
}

/* ───────────────────────────────────────────────────────────────
   INIT — orchestrated startup
─────────────────────────────────────────────────────────────── */
function init() {
  // Immediate (no wait)
  initProgressBar();
  injectDividers();
  injectActiveNavStyle();
  initNoiseTexture();

  // DOM ready
  initSmoothScroll();
  initNavbar();
  initScrollReveal();
  initCounters();
  initLightbox();
  initContactForm();
  initResizeHandler();
  initSectionTransitions();
  initFloatingButton();
  initBackToTop();

  // RAF-based (deferred slightly for performance)
  requestAnimationFrame(() => {
    initHeroParallax();
    initAmbientLight();
    initParticleField();
    initMagneticCursor();
    initTiltEffect();
    initGlareEffect();
    initTypedEffect();
  });
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
