(() => {
  const canvas = document.getElementById('sea');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ramp = ' ··∙:;+=≈~*%#@';
  const CW = 12, CH = 20;
  const ripples = [];
  const pointer = { x: -999, y: -999, on: 0 };
  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, last = 0;
  let base = [124, 58, 237], hi = [196, 181, 253];

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    const rgb = (v) => { const x = v.trim().replace('#', ''); return x.length === 6 ? [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)) : null; };
    base = rgb(css.getPropertyValue('--acc')) || base;
    hi = rgb(css.getPropertyValue('--acct')) || hi;
  }
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',');

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${CH - 6}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
    ctx.textBaseline = 'top';
    cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
  }

  function draw(now) {
    const t = now * (calm ? 0.00018 : 0.00055);
    ctx.clearRect(0, 0, w, h);
    for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > 2600) ripples.splice(i, 1);
    pointer.on *= 0.97;

    for (let r = 0; r < rows; r++) {
      const y = r * CH + CH / 2;
      const fade = Math.pow(1 - r / rows, 0.8);
      for (let c = 0; c < cols; c++) {
        const x = c * CW + CW / 2;
        const warp = Math.sin(r * 0.13 + t * 2.0) * 1.8 + Math.sin(c * 0.05 - t * 1.4) * 1.2;
        let v = Math.sin(c * 0.065 + t * 2.4 + warp) * 0.55
          + Math.sin(r * 0.19 - t * 1.7 + c * 0.021) * 0.3
          + Math.sin((c * 0.7 + r) * 0.07 + t * 1.3) * 0.35;
        let glow = 0;

        for (const rp of ripples) {
          const age = (now - rp.t0) / 1000;
          const d = Math.hypot(x - rp.x, y - rp.y);
          const front = age * 360;
          const band = Math.exp(-Math.pow((d - front) / 46, 2));
          const life = Math.exp(-age * 1.15);
          const k = band * life;
          v += k * 1.5 * Math.cos((d - front) / 9);
          glow += k;
        }
        if (pointer.on > 0.02) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          const k = Math.exp(-(d * d) / 9000) * pointer.on;
          v += k * 0.9;
          glow += k * 0.6;
        }

        const lvl = Math.max(0, Math.min(1, (v + 1.2) / 2.4));
        const shaped = lvl * lvl * (3 - 2 * lvl);
        const idx = Math.min(ramp.length - 1, Math.floor(shaped * ramp.length));
        if (idx < 2) continue;
        const a = Math.min(0.95, (0.10 + shaped * 0.62) * (0.35 + fade * 0.65) + glow * 0.55);
        const tint = Math.min(1, shaped * 0.55 + glow * 0.9);
        ctx.fillStyle = `rgba(${mix(base, hi, tint)},${a.toFixed(3)})`;
        ctx.fillText(ramp[idx], c * CW, r * CH);
      }
    }
  }

  function frame(now) {
    if (now - last > 33) { last = now; draw(now); }
    if (!document.hidden) requestAnimationFrame(frame);
  }

  addEventListener('pointerdown', (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    if (ripples.length > 8) ripples.shift();
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = Math.min(1, pointer.on + 0.25);
  }, { passive: true });
  addEventListener('resize', resize);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', readColors);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });

  readColors();
  resize();
  requestAnimationFrame(frame);
})();
