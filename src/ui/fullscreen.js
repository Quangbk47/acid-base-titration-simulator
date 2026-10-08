export function initFullscreen(stage, doc = globalThis.document) {
  const button = stage?.querySelector('[data-vessel-fullscreen]');
  if (!button || !doc) return { dispose() {} };
  let fallback = false; let previousOverflow = '';
  const active = () => doc.fullscreenElement === stage || fallback;
  const update = () => { button.textContent = active() ? 'Thoát toàn màn hình' : 'Toàn màn hình'; button.setAttribute('aria-pressed', String(active())); };
  const exitFallback = () => { fallback = false; stage.classList.remove('vessel-expanded'); doc.body.style.overflow = previousOverflow; update(); };
  const toggle = async () => {
    if (fallback) return exitFallback();
    if (doc.fullscreenElement === stage) { await doc.exitFullscreen(); return; }
    try { if (!stage.requestFullscreen) throw new Error('Unavailable'); await stage.requestFullscreen(); }
    catch { previousOverflow = doc.body.style.overflow; fallback = true; stage.classList.add('vessel-expanded'); doc.body.style.overflow = 'hidden'; }
    update();
  };
  const keydown = (event) => {
    if (event.key !== 'Escape') return;
    if (fallback) exitFallback();
    else if (doc.fullscreenElement === stage) doc.exitFullscreen().catch(() => {});
  };
  button.addEventListener('click', toggle); doc.addEventListener('fullscreenchange', update); doc.addEventListener('keydown', keydown); update();
  return { dispose() { button.removeEventListener('click', toggle); doc.removeEventListener('fullscreenchange', update); doc.removeEventListener('keydown', keydown); if (fallback) exitFallback(); } };
}
