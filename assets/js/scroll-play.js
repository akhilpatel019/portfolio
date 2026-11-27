/* ============================================================
   SCROLL PLAY — Professional scroll-driven interactions
   Reveals • Word scrub • Counters • Parallax • Stacking cards
   Timeline progress • Skill bars • Magnetic • Scramble titles
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0. Interactive ink on paper ---------- */
  // A small, original canvas interaction: pointer movement stirs warm pigment
  // across the hero like ink in water. It is decorative, bounded, and optional.
  const inkHost = $('.hero-left');
  if (inkHost && !reducedMotion) {
    const ink = document.createElement('canvas');
    ink.className = 'hero-ink-canvas';
    ink.setAttribute('aria-hidden', 'true');
    inkHost.appendChild(ink);
    const ctx = ink.getContext('2d');
    let inkW = 0, inkH = 0, inkDpr = 1, inkFrame = 0, lastPoint = null;
    const drops = [];
    const palette = ['#d95736', '#ef8a5d', '#f5c58c', '#fff0d5'];

    function resizeInk() {
      const r = inkHost.getBoundingClientRect();
      inkDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      inkW = r.width; inkH = r.height;
      ink.width = Math.round(inkW * inkDpr);
      ink.height = Math.round(inkH * inkDpr);
      ink.style.width = inkW + 'px'; ink.style.height = inkH + 'px';
      ctx.setTransform(inkDpr, 0, 0, inkDpr, 0, 0);
    }
    function addDrop(x, y, dx, dy, scale) {
      if (drops.length > 90) drops.splice(0, drops.length - 90);
      const angle = Math.atan2(dy, dx) + (Math.random() - .5) * 2.3;
      const speed = (0.25 + Math.random() * 1.1) * scale;
      const life = 90 + Math.random() * 65;
      drops.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: (3 + Math.random() * 13) * scale, life, maxLife: life,
        color: palette[Math.floor(Math.random() * palette.length)], spin: Math.random() * 6.28 });
    }
    function stir(e) {
      const r = ink.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (lastPoint) {
        const dx = p.x - lastPoint.x, dy = p.y - lastPoint.y;
        const distance = Math.hypot(dx, dy);
        const count = Math.min(5, Math.ceil(distance / 18));
        for (let i = 0; i < count; i++) {
          const t = (i + 1) / Math.max(1, count);
          addDrop(lastPoint.x + dx * t, lastPoint.y + dy * t, dx, dy, .65 + Math.random() * .55);
        }
      }
      lastPoint = p;
      requestInkFrame();
    }
    function dropInk(e) {
      const r = ink.getBoundingClientRect();
      for (let i = 0; i < 16; i++) addDrop(e.clientX - r.left, e.clientY - r.top, Math.random() - .5, Math.random() - .5, 1.2);
      requestInkFrame();
    }
    function paintInk() {
      ctx.clearRect(0, 0, inkW, inkH);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.x += d.vx; d.y += d.vy; d.vx *= .975; d.vy *= .975;
        d.life -= 1;
        const fade = Math.min(1, d.life / 22) * Math.min(1, (d.maxLife - d.life) / 5);
        if (d.life <= 0 || fade <= 0) { if (d.life <= 0) drops.splice(i, 1); continue; }
        const radius = d.r * (1 + (1 - d.life / d.maxLife) * .5);
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius);
        g.addColorStop(0, d.color + 'cc');
        g.addColorStop(.42, d.color + '70');
        g.addColorStop(1, d.color + '00');
        ctx.globalAlpha = fade;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(d.x, d.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      if (drops.length) inkFrame = requestAnimationFrame(paintInk);
      else inkFrame = 0;
    }
    function requestInkFrame() { if (!inkFrame) inkFrame = requestAnimationFrame(paintInk); }
    resizeInk();
    window.addEventListener('resize', resizeInk, { passive: true });
    inkHost.addEventListener('pointermove', stir, { passive: true });
    inkHost.addEventListener('pointerleave', () => { lastPoint = null; }, { passive: true });
    inkHost.addEventListener('pointerdown', dropInk, { passive: true });
  }

  /* ---------- 1. Scroll progress bar ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.prepend(progress);
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- 2. Time-based greeting ---------- */
  const greetingEl = $('.hero-greeting-text');
  if (greetingEl) {
    const h = new Date().getHours();
    greetingEl.textContent = (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ' — welcome to my world';
  }

  /* ---------- 4. Scroll reveals (staggered) ---------- */
  const revealEls = $$('.service-item, .skill-item, .timeline-item, .project-card, .contact-card, .stat-item');
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 5. Word-by-word scrub reveal (About bio) ---------- */
  const scrubTargets = $$('.about-bio p');
  scrubTargets.forEach(p => {
    const words = p.textContent.trim().split(/\s+/);
    p.classList.add('word-scrub');
    p.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  });
  function updateScrub() {
    scrubTargets.forEach(p => {
      const rect = p.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when element bottom hits viewport bottom, 1 when top hits 35% viewport
      const start = vh * 0.95, end = vh * 0.35;
      const prog = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const words = $$('.w', p);
      const litCount = Math.floor(prog * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
    });
  }
  window.addEventListener('scroll', updateScrub, { passive: true });
  updateScrub();

  /* ---------- 6. Counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1400, t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  $$('.stat-num').forEach(el => counterObserver.observe(el));

  /* ---------- 7. Skill bars (inject + animate on scroll) ---------- */
  const MASTERY = { 'HTML5': 92, 'CSS3': 90, 'JavaScript': 85, 'Bootstrap': 88, 'WordPress': 90, 'Elementor': 86, 'Divi': 80, 'PHP — Basic': 60, 'Shopify': 82, 'Shopify Theme Development': 65, 'Liquid': 62 };
  $$('.skill-item').forEach(item => {
    const h = $('h4', item);
    const pct = MASTERY[h ? h.textContent.trim() : ''] || 80;
    item.style.setProperty('--mastery', pct + '%');
    const info = $('.skill-info', item);
    if (info && !$('.skill-bar', item)) {
      const bar = document.createElement('div');
      bar.className = 'skill-bar';
      bar.innerHTML = '<div class="skill-bar-fill"></div>';
      info.appendChild(bar);
    }
  });

  /* ---------- 8. Timeline progress line ---------- */
  const timeline = $('.timeline');
  if (timeline) {
    const line = document.createElement('div');
    line.className = 'timeline-progress';
    timeline.appendChild(line);
    const items = $$('.timeline-item', timeline);
    function updateTimeline() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(1, Math.max(0, (vh * 0.65 - rect.top) / rect.height));
      line.style.height = (prog * rect.height) + 'px';
      items.forEach(item => {
        const r = item.getBoundingClientRect();
        item.classList.toggle('passed', r.top < vh * 0.65);
      });
    }
    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  /* ---------- 9. Project numbers + image parallax ---------- */
  $$('.project-card').forEach((card, i) => {
    if (!$('.project-num', card)) {
      const n = document.createElement('span');
      n.className = 'project-num';
      n.textContent = String(i + 1).padStart(2, '0');
      const imgWrap = $('.project-image', card);
      if (imgWrap) imgWrap.appendChild(n);
    }
  });
  const projectImgs = $$('.project-image img');
  function updateProjectParallax() {
    if (reducedMotion) return;
    projectImgs.forEach(img => {
      const wrap = img.parentElement;
      const r = wrap.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const off = (r.top + r.height / 2 - window.innerHeight / 2) * 0.06;
      img.style.transform = `translateY(${off}px) scale(1.12)`;
    });
  }
  window.addEventListener('scroll', updateProjectParallax, { passive: true });
  updateProjectParallax();

  /* ---------- 9b. Craft statement word scrub ---------- */
  const craftEl = $('#craftStatement');
  if (craftEl) {
    const words = craftEl.textContent.trim().split(/\s+/);
    craftEl.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    function updateCraft() {
      const rect = craftEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.55)));
      const ws = $$('.w', craftEl);
      const lit = Math.floor(prog * ws.length);
      ws.forEach((w, i) => w.classList.toggle('lit', i < lit));
    }
    window.addEventListener('scroll', updateCraft, { passive: true });
    updateCraft();
  }

  /* ---------- 10. Parallax: hero + watermarks + footer giant ---------- */
  const heroContent = $('.hero-content');
  const heroImgWrap = $('.hero-image-wrapper');
  const watermarks = $$('.about-watermark');
  const footerGiant = $('.footer-giant-logo');
  let ticking = false;
  function onScrollParallax() {
    if (reducedMotion) return;
    const y = window.scrollY;
    if (heroContent && y < window.innerHeight) {
      heroContent.style.transform = `translateY(${y * 0.18}px)`;
      heroContent.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.85));
    }
    if (heroImgWrap && y < window.innerHeight) {
      heroImgWrap.style.transform = `translateY(${y * 0.08}px)`;
    }
    watermarks.forEach(w => {
      const r = w.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * 0.06;
        w.style.transform = `translate(-50%, calc(-50% + ${off}px))`;
      }
    });
    if (footerGiant) {
      const r = footerGiant.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        const off = (r.top + r.height / 2 - window.innerHeight / 2) * 0.08;
        footerGiant.style.transform = `translateY(${off}px)`;
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScrollParallax); ticking = true; }
  }, { passive: true });
  onScrollParallax();

  /* ---------- 11. Section title scramble on enter ---------- */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el) {
    const original = el.textContent;
    let frame = 0;
    const total = 18;
    function step() {
      frame++;
      const reveal = Math.floor((frame / total) * original.length);
      let out = '';
      for (let i = 0; i < original.length; i++) {
        out += i < reveal || original[i] === ' ' || original[i] === '.' ? original[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(step);
      else el.textContent = original;
    }
    requestAnimationFrame(step);
  }
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { scramble(entry.target); titleObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  if (!reducedMotion) $$('.about-title').forEach(t => titleObserver.observe(t));

  /* ---------- 12. Magnetic buttons ---------- */
  if (finePointer && !reducedMotion) {
    $$('.hero-btn, .hero-cv-btn, .cta-link, .desktop-menu a, .copy-btn').forEach(el => {
      el.classList.add('magnetic');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 13. Copy email ---------- */
  const copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('akhilpatel99097@gmail.com'); } catch (e) { /* noop */ }
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
    setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = '<i class="ri-file-copy-line"></i> Copy email'; }, 2200);
  });

  /* ---------- 14. Hero image subtle tilt ---------- */
  if (heroImgWrap && finePointer && !reducedMotion) {
    const heroSec = $('.hero-section');
    heroSec.addEventListener('mousemove', (e) => {
      const r = heroSec.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroImgWrap.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(${window.scrollY * 0.08}px)`;
    });
  }
})();
