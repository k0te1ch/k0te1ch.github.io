(() => {
  const canvas = document.getElementById('sea');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const layers = [
    { amp: 26, len: 520, speed: 0.00030, base: 0.62, alpha: 0.10 },
    { amp: 22, len: 380, speed: -0.00042, base: 0.70, alpha: 0.14 },
    { amp: 18, len: 300, speed: 0.00055, base: 0.78, alpha: 0.18 },
    { amp: 14, len: 220, speed: -0.00070, base: 0.86, alpha: 0.24 },
    { amp: 10, len: 170, speed: 0.00090, base: 0.94, alpha: 0.32 },
  ];
  let w = 0, h = 0, dpr = 1, color = '99,102,241';

  function readColor() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim().replace('#', '');
    if (hex.length === 6) color = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    layers.forEach((l, n) => {
      const g = ctx.createLinearGradient(0, h * (l.base - 0.12), 0, h);
      g.addColorStop(0, `rgba(${color},${l.alpha})`);
      g.addColorStop(1, `rgba(${color},${l.alpha * 0.15})`);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const y = h * l.base
          + Math.sin(x / l.len * 2 * Math.PI + t * l.speed * 6 + n) * l.amp
          + Math.sin(x / (l.len * 0.43) * 2 * Math.PI - t * l.speed * 4) * l.amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    });
  }
  function frame(t) {
    draw(t);
    if (!document.hidden) requestAnimationFrame(frame);
  }

  readColor();
  resize();
  addEventListener('resize', resize);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { readColor(); draw(performance.now()); });
  if (!still) {
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
  }
})();
