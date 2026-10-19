(() => {
  const canvas = document.getElementById('sea');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ramp = ' ·.:-=+*≈~%#';
  const CW = 11, CH = 18;
  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, rgb = '99,102,241', last = 0;

  function readColor() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim().replace('#', '');
    if (hex.length === 6) rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${CH - 4}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
    ctx.textBaseline = 'top';
    cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
    draw(performance.now());
  }
  function draw(now) {
    const t = now * (calm ? 0.00028 : 0.0008);
    ctx.clearRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) {
      const fade = Math.pow(1 - r / rows, 0.9);
      if (fade < 0.04) break;
      for (let c = 0; c < cols; c++) {
        const v = Math.sin(c * 0.09 + t * 2.1 + Math.sin(r * 0.15 + t) * 1.6)
          + Math.sin(r * 0.22 - t * 1.5 + c * 0.03)
          + Math.sin((c + r * 1.6) * 0.05 + t * 1.2);
        const lvl = (v + 3) / 6;
        const i = Math.floor(lvl * lvl * (ramp.length - 1) * 1.15);
        if (i < 2) continue;
        ctx.fillStyle = `rgba(${rgb},${Math.min(0.9, (0.14 + lvl * 0.9) * fade)})`;
        ctx.fillText(ramp[Math.min(i, ramp.length - 1)], c * CW, r * CH);
      }
    }
  }
  function frame(now) {
    if (now - last > 40) { last = now; draw(now); }
    if (!document.hidden) requestAnimationFrame(frame);
  }

  readColor();
  resize();
  addEventListener('resize', resize);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { readColor(); draw(performance.now()); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
