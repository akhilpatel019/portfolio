/* ============================================================
   PLAYGROUND.JS — Makes visitors unable to stop playing
   Confetti • Bubble Pop • Physics Canvas • Reaction Game
   Runaway Button • Magnetic Buttons • Achievements • Party Mode
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ============ 1. CONFETTI ENGINE ============ */
  const cCanvas = document.createElement('canvas');
  cCanvas.id = 'confetti-canvas';
  document.body.appendChild(cCanvas);
  const cCtx = cCanvas.getContext('2d');
  let confetti = [];
  const CONFETTI_COLORS = ['#d54f2a', '#ff8a3d', '#ff4d8d', '#ffc93d', '#00c2a8', '#7c5cff', '#ffffff'];

  function sizeConfettiCanvas() {
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
  }
  sizeConfettiCanvas();
  window.addEventListener('resize', sizeConfettiCanvas, { passive: true });

  function burst(x, y, count, power) {
    if (reducedMotion) return;
    power = power || 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(2, 9) * power;
      confetti.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(2, 5),
        size: rand(4, 9),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.25, 0.25),
        life: 1,
        decay: rand(0.008, 0.02),
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
  }
  function confettiRain(count) {
    if (reducedMotion) return;
    for (let i = 0; i < (count || 120); i++) {
      confetti.push({
        x: rand(0, window.innerWidth),
        y: rand(-window.innerHeight * 0.4, -10),
        vx: rand(-1.5, 1.5),
        vy: rand(2, 5),
        size: rand(4, 9),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        life: 1,
        decay: rand(0.002, 0.005),
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
  }
  function confettiLoop() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    confetti = confetti.filter(p => p.life > 0 && p.y < window.innerHeight + 30);
    confetti.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.99;
      p.rot += p.vr; p.life -= p.decay;
      cCtx.save();
      cCtx.globalAlpha = Math.max(0, p.life);
      cCtx.translate(p.x, p.y);
      cCtx.rotate(p.rot);
      cCtx.fillStyle = p.color;
      if (p.shape === 'rect') cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      else { cCtx.beginPath(); cCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2); cCtx.fill(); }
      cCtx.restore();
    });
    requestAnimationFrame(confettiLoop);
  }
  requestAnimationFrame(confettiLoop);

  /* ============ 2. ACHIEVEMENT TOASTS ============ */
  const toastBox = document.createElement('div');
  toastBox.className = 'toast-container';
  document.body.appendChild(toastBox);
  const unlocked = new Set(JSON.parse(localStorage.getItem('ap_achievements') || '[]'));

  function unlock(id, icon, title, desc) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    localStorage.setItem('ap_achievements', JSON.stringify(Array.from(unlocked)));
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div class="toast-icon"><i class="ri-${icon}"></i></div><div><h4>${title}</h4><p>${desc}</p></div>`;
    toastBox.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, 4200);
  }
  function toast(icon, title, desc) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div class="toast-icon"><i class="ri-${icon}"></i></div><div><h4>${title}</h4><p>${desc}</p></div>`;
    toastBox.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, 3800);
  }

  /* ============ 3. SCROLL PROGRESS ============ */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.prepend(progress);
  let scrollDepthHit = { 50: false, 100: false };
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
    if (pct > 50 && !scrollDepthHit[50]) { scrollDepthHit[50] = true; unlock('scroll50', 'rocket-line', 'Halfway there!', 'You scrolled past 50%. Keep going — there is more to play with.'); }
    if (pct > 96 && !scrollDepthHit[100]) { scrollDepthHit[100] = true; unlock('scroll100', 'flag-line', 'You reached the bottom!', 'Explorer badge earned. Now go back up and play the games.'); }
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ============ 4. CURSOR TRAIL + CLICK RING ============ */
  if (finePointer && !reducedMotion) {
    const trailColors = ['#d54f2a', '#ff8a3d', '#ff4d8d', '#ffc93d'];
    let lastTrail = 0;
    window.addEventListener('pointermove', (e) => {
      const now = Date.now();
      if (now - lastTrail < 55) return;
      lastTrail = now;
      const d = document.createElement('div');
      d.className = 'trail-dot';
      const size = rand(4, 8);
      d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;background:${trailColors[Math.floor(Math.random() * trailColors.length)]}`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 720);
    }, { passive: true });
  }
  let clickCount = 0;
  window.addEventListener('pointerdown', (e) => {
    clickCount++;
    if (clickCount === 25) unlock('click25', 'cursor-line', 'Click master!', '25 clicks and counting. This page loves you.');
    if (clickCount === 60) unlock('click60', 'hand-heart-line', 'Unstoppable!', '60 clicks! Okay, you officially cannot stop playing.');
    if (!reducedMotion) {
      const r = document.createElement('div');
      r.className = 'click-ring';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 580);
      burst(e.clientX, e.clientY, 6, 0.5);
    }
  }, { passive: true });

  /* ============ 5. MAGNETIC BUTTONS + RIPPLE ============ */
  if (finePointer && !reducedMotion) {
    $$('.hero-btn, .hero-cv-btn, .cta-link, .desktop-menu a, .play-btn, .surprise-btn, .shuffle-btn').forEach(el => {
      el.classList.add('magnetic', 'ripple-host');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      el.addEventListener('click', (e) => {
        const r = el.getBoundingClientRect();
        const rip = document.createElement('span');
        rip.className = 'ripple';
        const size = Math.max(r.width, r.height) * 2;
        rip.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:${size}px;height:${size}px`;
        el.appendChild(rip);
        setTimeout(() => rip.remove(), 620);
      });
    });
  }

  /* ============ 6. HERO GREETING (time-based) ============ */
  const greetingEl = $('.hero-greeting-text');
  if (greetingEl) {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    greetingEl.textContent = `${g}, visitor — welcome to my world`;
  }

  /* ============ 7. HERO TITLE LETTERS ============ */
  function splitLetters(el) {
    const nodes = Array.from(el.childNodes);
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split('').forEach(ch => {
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'play-letter';
          s.textContent = ch;
          s.addEventListener('click', () => {
            s.classList.remove('jump'); void s.offsetWidth; s.classList.add('jump');
            const r = s.getBoundingClientRect();
            burst(r.left + r.width / 2, r.top + r.height / 2, 10, 0.7);
          });
          frag.appendChild(s);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        splitLetters(node);
      }
    });
  }
  const heroTitle = $('.hero-title');
  if (heroTitle && !reducedMotion) splitLetters(heroTitle);

  /* ============ 8. BUBBLE POP GAME ============ */
  const bubbleZone = $('#heroBubbles');
  const scoreEl = $('#bubbleScoreVal');
  const scorePill = $('#bubbleScore');
  const SKILLS = ['HTML', 'CSS', 'JS', 'WP', 'Shopify', 'PHP', 'Divi', 'UI'];
  const BUBBLE_COLORS = [
    'linear-gradient(135deg,#d54f2a,#ff8a3d)',
    'linear-gradient(135deg,#ff4d8d,#ff8a3d)',
    'linear-gradient(135deg,#7c5cff,#ff4d8d)',
    'linear-gradient(135deg,#00c2a8,#7c5cff)',
    'linear-gradient(135deg,#ffc93d,#ff8a3d)'
  ];
  let bubbleScore = 0;
  let bubblesPopped = 0;

  function spawnBubble() {
    if (!bubbleZone) return;
    if (bubbleZone.children.length >= 7) return;
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = rand(52, 84);
    b.style.width = size + 'px'; b.style.height = size + 'px';
    b.style.left = rand(4, 88) + '%';
    b.style.top = rand(8, 82) + '%';
    b.style.background = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    b.style.fontSize = size > 70 ? '.78rem' : '.62rem';
    b.style.setProperty('--float-x', rand(-30, 30) + 'px');
    b.style.setProperty('--float-y', rand(-45, -15) + 'px');
    b.style.setProperty('--float-dur', rand(6, 11) + 's');
    b.textContent = SKILLS[Math.floor(Math.random() * SKILLS.length)];
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      b.classList.add('popped');
      const r = b.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 16, 0.9);
      bubbleScore += 10; bubblesPopped++;
      if (scoreEl) scoreEl.textContent = bubbleScore;
      if (scorePill) { scorePill.classList.remove('pop-anim'); void scorePill.offsetWidth; scorePill.classList.add('pop-anim'); }
      if (bubblesPopped === 5) unlock('pop5', 'bubble-line', 'Bubble popper!', 'You popped 5 bubbles. 5 more to unlock a secret.');
      if (bubblesPopped === 10) { unlock('pop10', 'trophy-line', 'Bubble champion!', '10 bubbles popped! Secret unlocked — confetti for you!'); confettiRain(150); }
      if (bubblesPopped === 20) unlock('pop20', 'medal-line', 'Bubble legend!', '20 bubbles! Nobody pops bubbles like you.');
      setTimeout(() => { b.remove(); spawnBubble(); }, 360);
    });
    bubbleZone.appendChild(b);
  }
  if (bubbleZone) {
    for (let i = 0; i < 5; i++) setTimeout(spawnBubble, i * 350);
    setInterval(() => { if (bubbleZone.children.length < 5) spawnBubble(); }, 4000);
  }

  /* ============ 9. ROTATING BADGE ============ */
  const badge = $('#rotatingBadge');
  if (badge) badge.addEventListener('click', (e) => {
    const r = badge.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 30, 1.2);
    unlock('badge', 'sparkle-line', 'You found the badge!', 'Clicking spinning badges is a valid hobby.');
  });

  /* ============ 10. PHYSICS PLAYGROUND CANVAS ============ */
  const playCanvas = $('#play-canvas');
  if (playCanvas) {
    const ctx = playCanvas.getContext('2d');
    let W, H;
    function resizePlay() {
      const r = playCanvas.getBoundingClientRect();
      W = playCanvas.width = r.width * (window.devicePixelRatio || 1);
      H = playCanvas.height = r.height * (window.devicePixelRatio || 1);
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    }
    resizePlay();
    window.addEventListener('resize', resizePlay, { passive: true });

    let balls = [];
    let gravity = 0.35;
    let hue = 0;
    let drawing = false;
    const gravitySlider = $('#gravitySlider');
    const ballCountEl = $('#ballCount');
    const gravityVal = $('#gravityVal');

    function addBall(x, y) {
      if (balls.length > 220) balls.shift();
      balls.push({
        x, y,
        vx: rand(-3, 3), vy: rand(-4, 1),
        r: rand(8, 22),
        color: `hsl(${(hue += 14) % 360}, 85%, 60%)`,
        squash: 0
      });
      if (ballCountEl) ballCountEl.textContent = balls.length;
    }
    function spawnBurst(x, y, n) { for (let i = 0; i < n; i++) addBall(x + rand(-14, 14), y + rand(-14, 14)); }

    function playPointerPos(e) {
      const r = playCanvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    playCanvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      const p = playPointerPos(e);
      spawnBurst(p.x, p.y, 6);
      playCanvas.setPointerCapture(e.pointerId);
    });
    playCanvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = playPointerPos(e);
      addBall(p.x, p.y);
    });
    const stopDraw = () => { drawing = false; };
    playCanvas.addEventListener('pointerup', stopDraw);
    playCanvas.addEventListener('pointercancel', stopDraw);
    playCanvas.addEventListener('pointerleave', stopDraw);

    // Seed some balls so it looks alive immediately
    const r0 = playCanvas.getBoundingClientRect();
    for (let i = 0; i < 18; i++) addBall(rand(40, r0.width - 40), rand(30, 120));

    let playVisible = true;
    new IntersectionObserver((en) => { playVisible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(playCanvas);

    function playLoop() {
      requestAnimationFrame(playLoop);
      if (!playVisible) return;
      const w = playCanvas.width / (window.devicePixelRatio || 1);
      const h = playCanvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      // subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      balls.forEach(b => {
        b.vy += gravity;
        b.x += b.vx; b.y += b.vy;
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.88; }
        if (b.x + b.r > w) { b.x = w - b.r; b.vx *= -0.88; }
        if (b.y - b.r < 0) { b.y = b.r; b.vy *= -0.88; }
        if (b.y + b.r > h) { b.y = h - b.r; b.vy *= -0.82; b.vx *= 0.98; }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();
      });
    }
    requestAnimationFrame(playLoop);

    if (gravitySlider) gravitySlider.addEventListener('input', () => {
      gravity = parseFloat(gravitySlider.value);
      if (gravityVal) gravityVal.textContent = gravity.toFixed(2);
    });
    const rainBtn = $('#ballRainBtn');
    if (rainBtn) rainBtn.addEventListener('click', () => {
      const w = playCanvas.width / (window.devicePixelRatio || 1);
      for (let i = 0; i < 30; i++) addBall(rand(20, w - 20), rand(-40, 20));
      unlock('ballrain', 'rainy-line', 'Ball rain!', '30 balls rained from the sky. Satisfying, right?');
    });
    const clearBtn = $('#ballClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      balls = [];
      if (ballCountEl) ballCountEl.textContent = '0';
      toast('eraser-line', 'Canvas cleared', 'Fresh canvas. Click or drag to make new art.');
    });
    const shakeBtn = $('#ballShakeBtn');
    if (shakeBtn) shakeBtn.addEventListener('click', () => {
      balls.forEach(b => { b.vx += rand(-8, 8); b.vy += rand(-12, -4); });
      unlock('shake', 'shake-line', 'Shake it!', 'You shook the whole playground.');
    });
  }

  /* ============ 11. REACTION GAME ============ */
  const reactBox = $('#reactionBox');
  const reactDot = $('#reactionDot');
  const reactMsg = $('#reactionMsg');
  const reactStart = $('#reactionStart');
  const reactScoreEl = $('#reactionScore');
  const reactTimeEl = $('#reactionTime');
  let reactScore = 0, reactTimer = null, reactLeft = 15, reactOn = false;
  let bestScore = parseInt(localStorage.getItem('ap_reaction_best') || '0', 10);
  if (reactScoreEl) reactScoreEl.textContent = '0';

  function moveDot() {
    if (!reactBox || !reactDot) return;
    const bw = reactBox.clientWidth - 60, bh = reactBox.clientHeight - 60;
    reactDot.style.left = rand(4, Math.max(10, bw)) + 'px';
    reactDot.style.top = rand(4, Math.max(10, bh)) + 'px';
    reactDot.style.display = 'block';
  }
  function endReaction() {
    reactOn = false;
    clearInterval(reactTimer);
    if (reactDot) reactDot.style.display = 'none';
    if (reactMsg) { reactMsg.style.display = 'flex'; reactMsg.textContent = `Time! You caught ${reactScore}. Press start to beat your best (${bestScore}).`; }
    if (reactScore > bestScore) {
      bestScore = reactScore;
      localStorage.setItem('ap_reaction_best', String(bestScore));
      unlock('reactionbest', 'target-line', 'New personal best!', `Reaction game best is now ${bestScore}. Sharp reflexes!`);
    }
    if (reactScore >= 10) { confettiRain(80); unlock('reaction10', 'crosshair-line', 'Lightning hands!', '10 catches in 15 seconds. Incredible!'); }
  }
  if (reactStart) reactStart.addEventListener('click', () => {
    reactScore = 0; reactLeft = 15; reactOn = true;
    if (reactScoreEl) reactScoreEl.textContent = '0';
    if (reactTimeEl) reactTimeEl.textContent = '15';
    if (reactMsg) reactMsg.style.display = 'none';
    moveDot();
    clearInterval(reactTimer);
    reactTimer = setInterval(() => {
      reactLeft--;
      if (reactTimeEl) reactTimeEl.textContent = String(reactLeft);
      if (reactLeft <= 0) endReaction();
    }, 1000);
  });
  if (reactDot) reactDot.addEventListener('pointerdown', (e) => {
    if (!reactOn) return;
    e.preventDefault();
    reactScore++;
    if (reactScoreEl) reactScoreEl.textContent = String(reactScore);
    const r = reactDot.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 8, 0.6);
    moveDot();
  });

  /* ============ 12. RUNAWAY BUTTON ============ */
  const runBtn = $('#runawayBtn');
  const runMsg = $('#runawayMsg');
  const runZone = $('#runawayZone');
  let dodges = 0;
  function dodge() {
    if (!runBtn || !runZone) return;
    dodges++;
    const zw = runZone.clientWidth - runBtn.offsetWidth - 16;
    const zh = runZone.clientHeight - runBtn.offsetHeight - 16;
    runBtn.style.left = rand(8, Math.max(10, zw)) + 'px';
    runBtn.style.top = rand(8, Math.max(10, zh)) + 'px';
    runBtn.style.transform = 'none';
    if (runMsg) runMsg.textContent = dodges < 3 ? 'Too slow! Try again.' : dodges < 6 ? 'Almost got it... not quite!' : 'Okay okay, you win! Click me now.';
    if (dodges === 6) {
      const r = runBtn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 40, 1.2);
      unlock('runaway', 'footprint-line', 'You caught the button!', 'It dodged 6 times, then surrendered. Persistence pays.');
    }
  }
  if (runBtn) {
    runBtn.addEventListener('mouseenter', () => { if (dodges < 6) dodge(); });
    runBtn.addEventListener('touchstart', (e) => { if (dodges < 6) { e.preventDefault(); dodge(); } }, { passive: false });
    runBtn.addEventListener('click', () => {
      if (dodges < 6) { dodge(); return; }
      const r = runBtn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 50, 1.4);
      confettiRain(60);
      toast('hand-heart-line', 'You did it!', 'The runaway button has been caught. Legend status: confirmed.');
      dodges = 0;
      if (runMsg) runMsg.textContent = 'Reset! Catch me again if you can.';
      runBtn.style.left = '50%'; runBtn.style.top = '50%'; runBtn.style.transform = 'translate(-50%,-50%)';
    });
  }

  /* ============ 13. SKILLS: reveal mastery + shuffle ============ */
  const MASTERY = { 'HTML5': 92, 'CSS3': 90, 'JavaScript': 85, 'Bootstrap': 88, 'WordPress': 90, 'Elementor': 86, 'Divi': 80, 'PHP — Basic': 60, 'Shopify': 82, 'Shopify Theme Development': 65, 'Liquid': 62 };
  $$('.skill-item').forEach(item => {
    const h = $('h4', item);
    const name = h ? h.textContent.trim() : '';
    const pct = MASTERY[name] || Math.floor(rand(65, 92));
    item.style.setProperty('--mastery', pct + '%');
    if (!$('.skill-mastery', item)) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="skill-mastery"><div class="skill-mastery-fill"></div></div><div class="skill-pct">${pct}% mastery — click again to hide</div>`;
      const info = $('.skill-info', item);
      if (info) info.appendChild(wrap);
    }
    item.addEventListener('click', () => {
      item.classList.toggle('revealed');
      if (item.classList.contains('revealed')) {
        const r = item.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + 30, 8, 0.5);
        unlock('skillreveal', 'bar-chart-line', 'Skill explorer!', 'You checked a skill level. Click cards to reveal mastery.');
      }
    });
  });
  const shuffleBtn = $('#shuffleSkills');
  if (shuffleBtn) shuffleBtn.addEventListener('click', () => {
    const grid = $('.skills-grid');
    if (!grid) return;
    const items = $$('.skill-item', grid);
    items.forEach(i => i.classList.add('shuffling'));
    setTimeout(() => {
      items.sort(() => Math.random() - 0.5).forEach(i => grid.appendChild(i));
      items.forEach(i => i.classList.remove('shuffling'));
    }, 400);
    unlock('shuffle', 'shuffle-line', 'Shuffled!', 'Skills in random order. Chaos is fun.');
  });

  /* ============ 14. PROJECT SURPRISE ============ */
  const surpriseBtn = $('#surpriseProject');
  if (surpriseBtn) surpriseBtn.addEventListener('click', () => {
    const cards = $$('.project-card');
    if (!cards.length) return;
    cards.forEach(c => c.classList.remove('spotlight'));
    const pick = cards[Math.floor(Math.random() * cards.length)];
    pick.classList.add('spotlight');
    pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const r = pick.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 80, 30, 1.1);
    unlock('surprise', 'dice-line', 'Surprise pick!', 'Random project spotlight. Roll again for another.');
    setTimeout(() => pick.classList.remove('spotlight'), 5000);
  });

  /* ============ 15. COPY EMAIL ============ */
  const copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    const email = 'akhilpatel99097@gmail.com';
    try { await navigator.clipboard.writeText(email); } catch (e) { /* clipboard unavailable */ }
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
    const r = copyBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 16, 0.8);
    toast('mail-check-line', 'Email copied!', 'Paste it anywhere — I reply fast.');
    setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = '<i class="ri-file-copy-line"></i> Copy email'; }, 2200);
  });

  /* ============ 16. PARTY MODE + KONAMI + LOGO EASTER EGG ============ */
  let partyTimer = null;
  function toggleParty(force) {
    const on = typeof force === 'boolean' ? force : !document.body.classList.contains('party-mode');
    document.body.classList.toggle('party-mode', on);
    if (on) {
      confettiRain(180);
      unlock('party', 'party-line', 'PARTY MODE!', 'Rainbow mode activated. Everything is better in rainbow.');
      clearInterval(partyTimer);
      partyTimer = setInterval(() => confettiRain(25), 900);
    } else {
      clearInterval(partyTimer);
      toast('moon-line', 'Party over', 'Back to normal. The fun was real though.');
    }
  }
  const partyBtn = $('#partyBtn');
  if (partyBtn) partyBtn.addEventListener('click', () => toggleParty());

  // Konami code
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIdx = 0;
  window.addEventListener('keydown', (e) => {
    konamiIdx = (e.key === KONAMI[konamiIdx]) ? konamiIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (konamiIdx === KONAMI.length) { konamiIdx = 0; toggleParty(true); }
  });
  // Logo click x5
  const logo = $('.header-logo');
  let logoClicks = 0;
  if (logo) logo.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 5) { toggleParty(true); logoClicks = 0; }
    else if (logoClicks > 1) toast('sparkle-line', `${logoClicks}/5 clicks`, 'Keep clicking the logo...');
  });

  /* ============ 17. PLAY DOCK ============ */
  const dockBtn = $('#playDockBtn');
  const dockMenu = $('#playMenu');
  if (dockBtn && dockMenu) {
    dockBtn.addEventListener('click', () => dockMenu.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.play-dock')) dockMenu.classList.remove('open');
    });
  }
  const dockConfetti = $('#dockConfetti');
  if (dockConfetti) dockConfetti.addEventListener('click', () => { confettiRain(160); unlock('dockconfetti', 'confetti-line', 'Confetti rain!', 'You ordered confetti from the play dock.'); });
  const dockBubbles = $('#dockBubbles');
  if (dockBubbles) dockBubbles.addEventListener('click', () => {
    for (let i = 0; i < 6; i++) setTimeout(spawnBubble, i * 150);
    toast('bubble-line', 'Bubble bonus!', 'Extra bubbles incoming. Pop them all.');
  });
  const dockScroll = $('#dockScroll');
  if (dockScroll) dockScroll.addEventListener('click', () => {
    const pg = $('#playground');
    if (pg) pg.scrollIntoView({ behavior: 'smooth' });
  });

  /* ============ 18. TIME-ON-PAGE TOASTS ============ */
  setTimeout(() => unlock('stay30', 'time-line', 'Still here?', '30 seconds in and you are still playing. I respect that.'), 30000);
  setTimeout(() => unlock('stay90', 'timer-line', '90 seconds!', 'A minute and a half of play. You are officially a fan.'), 90000);

  /* ============ 19. HERO IMAGE PARALLAX TILT ============ */
  const heroImgWrap = $('.hero-image-wrapper');
  if (heroImgWrap && finePointer && !reducedMotion) {
    const heroSec = $('.hero-section');
    heroSec.addEventListener('mousemove', (e) => {
      const r = heroSec.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroImgWrap.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroSec.addEventListener('mouseleave', () => { heroImgWrap.style.transform = ''; });
  }

  /* ============ 20. WELCOME ============ */
  setTimeout(() => {
    if (!unlocked.has('welcome')) {
      unlocked.add('welcome');
      localStorage.setItem('ap_achievements', JSON.stringify(Array.from(unlocked)));
      toast('hand-wave-line', 'Welcome to the playground!', 'Pop the bubbles in the hero, then scroll to the Playground section. Try everything.');
    }
  }, 4500);
})();
