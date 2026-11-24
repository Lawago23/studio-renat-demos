/* Smooth inertial scroll (desktop wheel), progress rail, pinned process, zoom lock */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const doc = document.documentElement;
  const pad = n => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const maxY = () => Math.max(0, doc.scrollHeight - innerHeight);

  /* --- zoom lock (iOS Safari ignores user-scalable) --- */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(e => document.addEventListener(e, ev => ev.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', ev => { if (ev.touches.length > 1 || (ev.scale && ev.scale !== 1)) ev.preventDefault(); }, { passive: false });
  let lastTap = 0;
  document.addEventListener('touchend', ev => { const t = Date.now(); if (t - lastTap < 320) ev.preventDefault(); lastTap = t; }, { passive: false });
  addEventListener('wheel', ev => { if (ev.ctrlKey) ev.preventDefault(); }, { passive: false });
  addEventListener('keydown', ev => { if ((ev.ctrlKey || ev.metaKey) && ['+', '-', '=', '0'].includes(ev.key)) ev.preventDefault(); });

  /* --- smooth wheel scroll --- */
  let target = scrollY, cur = scrollY, raf = 0, smooth = fine && !reduce;
  const tick = () => {
    cur += (target - cur) * 0.115;
    if (Math.abs(target - cur) < 0.4) cur = target;
    scrollTo(0, cur);
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
  if (smooth) {
    addEventListener('wheel', ev => {
      if (ev.ctrlKey || ev.defaultPrevented) return;
      let el = ev.target;
      while (el && el !== document.body) { // let inner scrollables work
        const o = getComputedStyle(el).overflowY;
        if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }
      ev.preventDefault();
      const d = ev.deltaMode === 1 ? ev.deltaY * 32 : ev.deltaMode === 2 ? ev.deltaY * innerHeight : ev.deltaY;
      target = clamp(target + d, 0, maxY());
      run();
    }, { passive: false });
    addEventListener('scroll', () => { if (!raf) { target = cur = scrollY; } }, { passive: true });
    addEventListener('keydown', () => setTimeout(() => { if (!raf) target = cur = scrollY; }, 0));
  }
  window.__scrollToEl = (el, center) => {
    const r = el.getBoundingClientRect();
    const y = clamp(scrollY + r.top - (center ? (innerHeight - r.height) / 2 : 0), 0, maxY());
    if (smooth) { target = y; run(); } else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    ev.preventDefault();
    const hdr = document.getElementById('siteHeader');
    const y = clamp(scrollY + el.getBoundingClientRect().top - (hdr ? hdr.offsetHeight : 0) + 1, 0, maxY());
    if (smooth) { target = y; run(); } else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* --- progress rail + pinned process --- */
  const fill = document.getElementById('srFill'), num = document.getElementById('srNum'), left = document.getElementById('srLeft');
  const secs = [...document.querySelectorAll('main section, section.hero-section')].filter((s, i, a) => a.indexOf(s) === i);
  const vp = document.getElementById('processViewport'), track = document.getElementById('processTrack');
  const ppFill = document.getElementById('ppFill'), ppNum = document.getElementById('ppNum');
  const steps = track ? track.children.length : 4;

  const update = () => {
    const m = maxY(), p = m ? clamp(scrollY / m, 0, 1) : 0;
    if (fill) fill.style.transform = `scaleY(${p})`;
    if (left) left.textContent = Math.round((1 - p) * 100) + '%';
    if (num && secs.length) {
      let idx = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) idx = i; });
      num.innerHTML = `${pad(idx + 1)} <small>/ ${pad(secs.length)}</small>`;
    }
    if (vp && track) {
      const r = vp.getBoundingClientRect(), total = vp.offsetHeight - innerHeight;
      const q = clamp(-r.top / (total || 1), 0, 1);
      const shift = Math.max(0, track.scrollWidth - innerWidth);
      track.style.transform = `translate3d(${-q * shift}px,0,0)`;
      if (ppFill) ppFill.style.transform = `scaleX(${0.08 + q * 0.92})`;
      if (ppNum) ppNum.innerHTML = `${pad(Math.min(steps, Math.floor(q * steps * 0.999) + 1))} <small>/ ${pad(steps)}</small>`;
    }
  };
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { target = cur = scrollY; update(); });
  addEventListener('load', update);
  update();
})();
