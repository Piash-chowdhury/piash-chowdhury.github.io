/* Hero illustration: a stylized estuary with particles riding a simple tide.
   Not model output. Flow = river discharge + sinusoidal tide, a parabolic cross-channel
   profile, faster where the channel narrows, plus random-walk diffusion.
   Click the water (or press "Release dye") to drop a rhodamine plume. */
(function () {
  'use strict';
  var cv = document.getElementById('river');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var tideEl = document.getElementById('tide');
  var dyeBtn = document.getElementById('dyeBtn');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1, bg = null;
  var amb = [], dye = [];
  var t = 0, last = 0, raf = 0, onScreen = true, phase = null;
  var PERIOD = 1300;          // frames per tidal cycle (about 22 s at 60 fps)
  var MAX_DYE = 1400;

  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function dark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* channel geometry, x normalised 0 (upstream) .. 1 (ocean) */
  function cy(nx) { return H * (0.5 + 0.13 * Math.sin(nx * 5.2 + 0.9) + 0.05 * Math.sin(nx * 11.3 + 1.9)); }
  function hw(nx) {
    var w = H * (0.075 + 0.11 * nx * nx);
    if (nx > 0.78) w += H * 12 * (nx - 0.78) * (nx - 0.78);   // the mouth flares out to the sea
    return w;
  }
  function tideU() { return 0.35 + 1.1 * Math.sin((2 * Math.PI * t) / PERIOD); } // + is seaward

  function inWater(x, y) {
    var nx = x / W, h = hw(nx);
    return Math.abs(y - cy(nx)) < h;
  }

  function buildBackground() {
    bg = document.createElement('canvas');
    bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr);
    var g = bg.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var d = dark();
    g.fillStyle = cssVar('--marsh') || '#A9B88F';
    g.fillRect(0, 0, W, H);

    // marsh texture: short grass strokes
    g.strokeStyle = d ? 'rgba(0,0,0,.18)' : 'rgba(60,80,40,.18)';
    g.lineWidth = 1;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < W * H / 260; i++) {
      var gx = rnd() * W, gy = rnd() * H;
      g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + (rnd() - .5) * 3, gy - 3 - rnd() * 4); g.stroke();
    }

    // water body
    var step = 4, x;
    g.beginPath();
    for (x = 0; x <= W + step; x += step) { var n = Math.min(x / W, 1); g.lineTo(x, cy(n) - hw(n)); }
    for (x = W + step; x >= -step; x -= step) { var m = Math.max(Math.min(x / W, 1), 0); g.lineTo(x, cy(m) + hw(m)); }
    g.closePath();
    var grad = g.createLinearGradient(0, 0, W, 0);
    if (d) { grad.addColorStop(0, '#2B1B0E'); grad.addColorStop(0.55, '#1E3634'); grad.addColorStop(1, '#14304A'); }
    else { grad.addColorStop(0, '#5C3A1C'); grad.addColorStop(0.5, '#3F6460'); grad.addColorStop(1, '#2E5E7C'); }
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = d ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.35)';
    g.lineWidth = 1.2;
    g.stroke();

    // labels
    g.font = '600 12px "Instrument Sans", system-ui, sans-serif';
    g.fillStyle = d ? 'rgba(227,236,231,.75)' : 'rgba(20,35,31,.7)';
    g.fillText('Blackwater river', 14, H - 14);
    g.textAlign = 'right';
    g.fillText('Ocean', W - 14, 22);
  }

  function spawnAmbient(p) {
    var nx = Math.random(), h = hw(nx);
    p.x = nx * W;
    p.y = cy(nx) + (Math.random() * 2 - 1) * h * 0.95;
    p.age = 0; p.life = 250 + Math.random() * 650;   // recycle so the whole channel stays seeded
    return p;
  }

  function resize() {
    var r = cv.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildBackground();
    var n = Math.round(Math.min(420, W * 0.35));
    amb = [];
    for (var i = 0; i < n; i++) amb.push(spawnAmbient({}));
    dye = [];
  }

  function advect(p, U, k) {
    var nx = p.x / W;
    if (nx < 0 || nx > 1) return false;
    var c = cy(nx), h = hw(nx), dd = (p.y - c) / h;
    var e = 0.002, s = (cy(nx + e) - cy(nx - e)) / (2 * e * W);
    var len = Math.sqrt(1 + s * s);
    var narrow = Math.min(2.2, hw(0.3) / h);            // continuity: narrow = faster
    var speed = U * Math.max(0, 1 - dd * dd) * narrow * k * (W / 900);
    p.x += (speed / len) + (Math.random() - 0.5) * 0.6 * k;
    p.y += (speed * s / len) + (Math.random() - 0.5) * 0.6 * k;
    // reflect off the banks
    nx = p.x / W; c = cy(nx); h = hw(nx);
    if (p.y > c + h * 0.97) p.y = c + h * 0.97;
    if (p.y < c - h * 0.97) p.y = c - h * 0.97;
    return p.x >= 0 && p.x <= W;
  }

  function step(k) {
    t += k;
    var U = tideU();
    for (var i = 0; i < amb.length; i++) {
      amb[i].age += k;
      if (amb[i].age > amb[i].life) { spawnAmbient(amb[i]); continue; }
      if (!advect(amb[i], U, k)) {
        // re-enter at the boundary the flow is coming from
        var nx = U >= 0 ? 0.005 : 0.995, h = hw(nx);
        amb[i].x = nx * W; amb[i].y = cy(nx) + (Math.random() * 2 - 1) * h * 0.9;
      }
    }
    for (var j = dye.length - 1; j >= 0; j--) {
      var p = dye[j];
      p.age += k;
      // dye spreads a little faster than ambient particles (dispersion)
      p.x += (Math.random() - 0.5) * 0.9 * k; p.y += (Math.random() - 0.5) * 0.9 * k;
      if (!advect(p, U, k) || p.age > p.life) dye.splice(j, 1);
    }
    var ph = U >= 0 ? 'ebb' : 'flood';
    if (ph !== phase && tideEl) {
      phase = ph;
      tideEl.textContent = ph === 'ebb' ? 'Ebb tide, flowing out to sea' : 'Flood tide, pushing upstream';
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    ctx.fillStyle = dark() ? 'rgba(220,235,230,.55)' : 'rgba(255,255,255,.7)';
    for (var i = 0; i < amb.length; i++) ctx.fillRect(amb[i].x, amb[i].y, 1.6, 1.6);
    var col = cssVar('--dye') || '#C4185F';
    ctx.fillStyle = col;
    for (var j = 0; j < dye.length; j++) {
      var p = dye[j];
      ctx.globalAlpha = 0.75 * (1 - p.age / p.life);
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    var k = last ? Math.min(3, (now - last) / 16.67) : 1;
    last = now;
    step(k); draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (reduce || raf || !onScreen || document.hidden) return; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  function release(x, y) {
    if (!inWater(x, y)) { var nx = Math.min(Math.max(x / W, 0.02), 0.98); y = cy(nx); x = nx * W; }
    var n = 260;
    if (dye.length + n > MAX_DYE) dye.splice(0, dye.length + n - MAX_DYE);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * 7;
      dye.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, age: 0, life: 700 + Math.random() * 500 });
    }
    if (reduce) { for (var s = 0; s < 160; s++) step(1); draw(); }
  }

  cv.addEventListener('click', function (e) {
    var r = cv.getBoundingClientRect();
    release(e.clientX - r.left, e.clientY - r.top);
  });
  if (dyeBtn) dyeBtn.addEventListener('click', function () {
    var nx = 0.12 + Math.random() * 0.25;
    release(nx * W, cy(nx));
  });

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); draw(); }, 150);
  });
  new MutationObserver(function () { buildBackground(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; onScreen ? start() : stop(); }).observe(cv);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { buildBackground(); draw(); });

  resize();
  for (var w = 0; w < 120; w++) step(1);   // warm up so particles are spread along the channel
  draw();
  start();
})();
