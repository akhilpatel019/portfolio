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

  /* ---------- 3. Hero title letters (subtle hover) ---------- */
  function splitLetters(el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split('').forEach(ch => {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'play-letter';
          s.textContent = ch;
          frag.appendChild(s);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') splitLetters(node);
    });
  }
  const heroTitle = $('.hero-title');
  if (heroTitle && !reducedMotion) splitLetters(heroTitle);

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

  /* ---------- 9. Project stacking cards (scroll scrub) ---------- */
  const workGrid = $('.work-grid');
  if (workGrid && !reducedMotion && window.innerWidth > 768) {
    workGrid.classList.add('stack-mode');
    const cards = $$('.project-card', workGrid);
    function updateStack() {
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const next = cards[i + 1];
        const nr = next.getBoundingClientRect();
        const vh = window.innerHeight;
        // as next card approaches, scale current down slightly
        const prog = Math.min(1, Math.max(0, (vh - nr.top) / vh));
        card.style.transform = `scale(${1 - prog * 0.05})`;
        card.style.filter = `brightness(${1 - prog * 0.12})`;
      });
    }
    window.addEventListener('scroll', updateStack, { passive: true });
    updateStack();
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
