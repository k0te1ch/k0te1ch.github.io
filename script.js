(() => {
  const body = document.querySelector('.term .body');
  if (!body || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue.trim() && !n.parentElement.closest('.cursor')
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const items = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    items.push({ node: n, full: n.nodeValue, fast: !!n.parentElement.closest('h1, li, .muted') });
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frames = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];

  function spinner() {
    const line = document.createElement('p');
    line.className = 'spin';
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = '<span class="g"></span> <span class="shim">Shipping…</span> <span class="muted"></span>';
    const last = body.querySelector('p.gap:last-child');
    body.insertBefore(line, last);
    const g = line.querySelector('.g');
    const meta = line.querySelector('.muted');
    const start = Date.now();
    let i = 0;
    setInterval(() => {
      g.textContent = frames[i++ % frames.length];
      meta.textContent = `(${Math.floor((Date.now() - start) / 1000)}s · esc to interrupt)`;
    }, 120);
  }

  async function run() {
    body.style.minHeight = body.offsetHeight + 'px';
    items.forEach((it) => { it.node.nodeValue = ''; });
    for (const it of items) {
      if (it.full.trim() === '$' || it.full.trim() === '→') { it.node.nodeValue = it.full; await wait(it.full === '$' ? 350 : 60); continue; }
      for (let i = 1; i <= it.full.length; i++) {
        it.node.nodeValue = it.full.slice(0, i);
        await wait(it.fast ? 9 : 45);
      }
    }
    spinner();
  }
  run();
})();
