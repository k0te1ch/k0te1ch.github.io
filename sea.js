(() => {
  const canvas = document.getElementById('sea');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ramp = ' ··∙:;+=≈~*%#@';
  const NA = 10, NT = 5;
  const ripples = [];
  const pointer = { x: -999, y: -999, on: 0 };
  const lutBand = new Float32Array(512), lutCos = new Float32Array(512);
  for (let i = 0; i < 512; i++) {
    const d = (i / 511) * 280 - 140;
    lutBand[i] = Math.exp(-Math.pow(d / 46, 2));
    lutCos[i] = Math.cos(d / 9);
  }

  let scale = 1, CW = 12, CH = 20, w = 0, h = 0, dpr = 1, cols = 0, rows = 0, last = 0;
  let base = [124, 58, 237], hi = [196, 181, 253];
  let atlas = null, rip, glw, S, Q, sCol, rowT, frames = 0, cost = 0;

  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',');

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    const rgb = (v) => { const x = v.trim().replace('#', ''); return x.length === 6 ? [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)) : null; };
    base = rgb(css.getPropertyValue('--acc')) || base;
    hi = rgb(css.getPropertyValue('--acct')) || hi;
    buildAtlas();
  }

  function buildAtlas() {
    const sw = Math.ceil(CW * dpr), sh = Math.ceil(CH * dpr);
    atlas = document.createElement('canvas');
    atlas.width = sw * NA * NT; atlas.height = sh * ramp.length;
    const a = atlas.getContext('2d');
    a.font = `${(CH - 6) * dpr}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
    a.textBaseline = 'top';
    for (let ch = 2; ch < ramp.length; ch++) {
      for (let t = 0; t < NT; t++) {
        for (let al = 0; al < NA; al++) {
          a.fillStyle = `rgba(${mix(base, hi, t / (NT - 1))},${((al + 1) / NA * 0.95).toFixed(3)})`;
          a.fillText(ramp[ch], (t * NA + al) * sw, ch * sh);
        }
      }
    }
    atlas.sw = sw; atlas.sh = sh;
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    CW = 12 * scale; CH = 20 * scale;
    canvas.width = Math.ceil(w * dpr); canvas.height = Math.ceil(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CW); rows = Math.ceil(h / CH);
    const n = cols * rows;
    rip = new Float32Array(n); glw = new Float32Array(n); S = new Float32Array(n); Q = new Float32Array(n);
    sCol = new Float32Array(cols * 6); rowT = new Float32Array(rows * 6);
    buildAtlas();
  }

  function stamp(x, y, front, amp, life, k) {
    const reach = front + 140;
    const c0 = Math.max(0, Math.floor((x - reach) / CW)), c1 = Math.min(cols - 1, Math.ceil((x + reach) / CW));
    const r0 = Math.max(0, Math.floor((y - reach) / CH)), r1 = Math.min(rows - 1, Math.ceil((y + reach) / CH));
    for (let r = r0; r <= r1; r++) {
      const dy = r * CH + CH / 2 - y;
      for (let c = c0; c <= c1; c++) {
        const dx = c * CW + CW / 2 - x;
        const rel = Math.sqrt(dx * dx + dy * dy) - front;
        if (rel < -140 || rel > 140) continue;
        const li = ((rel + 140) / 280 * 511) | 0;
        const kk = lutBand[li] * life;
        const i = r * cols + c;
        rip[i] += kk * 1.5 * lutCos[li] * amp;
        glw[i] += kk * k;
        S[i] += kk; Q[i] += kk * kk;
      }
    }
  }

  function draw(now) {
    const t0 = performance.now();
    const t = now * (calm ? 0.00018 : 0.00055);
    for (let c = 0; c < cols; c++) {
      const a1 = c * 0.065 + t * 2.4 + Math.sin(c * 0.05 - t * 1.4) * 1.2;
      const a2 = c * 0.021, a3 = c * 0.049 + t * 1.3, o = c * 6;
      sCol[o] = Math.sin(a1); sCol[o + 1] = Math.cos(a1);
      sCol[o + 2] = Math.sin(a2); sCol[o + 3] = Math.cos(a2);
      sCol[o + 4] = Math.sin(a3); sCol[o + 5] = Math.cos(a3);
    }
    for (let r = 0; r < rows; r++) {
      const A = Math.sin(r * 0.13 + t * 2.0) * 1.8, b2 = r * 0.19 - t * 1.7, b3 = r * 0.07, o = r * 6;
      rowT[o] = Math.cos(A); rowT[o + 1] = Math.sin(A);
      rowT[o + 2] = Math.sin(b2); rowT[o + 3] = Math.cos(b2);
      rowT[o + 4] = Math.sin(b3); rowT[o + 5] = Math.cos(b3);
    }

    const hasFx = ripples.length > 0 || pointer.on > 0.02;
    if (hasFx) { rip.fill(0); glw.fill(0); S.fill(0); Q.fill(0); }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i], age = (now - rp.t0) / 1000;
      if (age > 2.6) { ripples.splice(i, 1); continue; }
      stamp(rp.x, rp.y, age * 360, 1, Math.exp(-age * 1.15), 1);
    }
    pointer.on *= 0.97;
    if (pointer.on > 0.02) {
      const R = 180, c0 = Math.max(0, Math.floor((pointer.x - R) / CW)), c1 = Math.min(cols - 1, Math.ceil((pointer.x + R) / CW));
      const r0 = Math.max(0, Math.floor((pointer.y - R) / CH)), r1 = Math.min(rows - 1, Math.ceil((pointer.y + R) / CH));
      for (let r = r0; r <= r1; r++) {
        const dy = r * CH + CH / 2 - pointer.y;
        for (let c = c0; c <= c1; c++) {
          const dx = c * CW + CW / 2 - pointer.x;
          const k = Math.exp(-(dx * dx + dy * dy) / 9000) * pointer.on, i = r * cols + c;
          rip[i] += k * 0.9; glw[i] += k * 0.6;
        }
      }
    }

    ctx.clearRect(0, 0, w, h);
    const sw = atlas.sw, sh = atlas.sh, nR = ramp.length - 1;
    for (let r = 0; r < rows; r++) {
      const fade = 0.35 + Math.pow(1 - r / rows, 0.8) * 0.65, ro = r * 6;
      const cA = rowT[ro], sA = rowT[ro + 1], sr2 = rowT[ro + 2], cr2 = rowT[ro + 3], sr3 = rowT[ro + 4], cr3 = rowT[ro + 5];
      for (let c = 0; c < cols; c++) {
        const o = c * 6;
        let v = 0.55 * (sCol[o] * cA + sCol[o + 1] * sA)
          + 0.3 * (sr2 * sCol[o + 3] + cr2 * sCol[o + 2])
          + 0.35 * (sr3 * sCol[o + 5] + cr3 * sCol[o + 4]);
        let glow = 0;
        if (hasFx) {
          const i = r * cols + c, s = S[i];
          const hit = s > 0.001 ? (s * s - Q[i]) * 0.5 : 0;
          v += rip[i] + hit * 1.8;
          glow = glw[i] + hit * 2.4;
        }
        const lvl = Math.max(0, Math.min(1, (v + 1.2) / 2.4));
        const shaped = lvl * lvl * (3 - 2 * lvl);
        const idx = Math.min(nR, (shaped * ramp.length) | 0);
        if (idx < 2) continue;
        const a = Math.min(0.95, (0.10 + shaped * 0.62) * fade + glow * 0.55);
        if (a < 0.06) continue;
        const al = Math.min(NA - 1, (a / 0.95 * NA) | 0);
        const tn = Math.min(NT - 1, ((shaped * 0.55 + glow * 0.9) * (NT - 1) + 0.5) | 0);
        ctx.drawImage(atlas, (tn * NA + al) * sw, idx * sh, sw, sh, c * CW, r * CH, CW, CH);
      }
    }

    cost = cost * 0.9 + (performance.now() - t0) * 0.1;
    if (++frames % 90 === 0) {
      if (cost > 9 && scale < 2) { scale += 0.25; resize(); }
      else if (cost < 2.5 && scale > 1 && frames % 360 === 0) { scale -= 0.25; resize(); }
    }
  }

  function frame(now) {
    if (now - last > 30) { last = now; draw(now); }
    if (!document.hidden) requestAnimationFrame(frame);
  }

  addEventListener('pointerdown', (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() });
    if (ripples.length > 7) ripples.shift();
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = Math.min(1, pointer.on + 0.25);
  }, { passive: true });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', readColors);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });

  resize();
  readColors();
  requestAnimationFrame(frame);
})();
