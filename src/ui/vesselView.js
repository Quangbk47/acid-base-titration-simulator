import { buildVesselModel } from './vesselModel.js';

// Load WebGL only when this viewport is visible; a failed renderer cannot stop UI.
export function initVesselView({ root = document, loadScene = () => import('./vesselScene.js') } = {}) {
  const stage = root.querySelector('[data-vessel-3d]');
  if (!stage) return { update() {}, dispose() {} };
  const viewport = stage.querySelector('[data-vessel-viewport]');
  const notice = stage.querySelector('[data-vessel-notice]');
  const reset = stage.querySelector('[data-camera-reset]');
  let latestState = null;
  let scene = null;
  let loading = false;
  let disposed = false;
  let visible = false;
  const fallback = (message) => {
    stage.dataset.renderer = 'fallback';
    if (notice) notice.textContent = message;
    if (reset) reset.disabled = true;
  };
  const load = async () => {
    if (loading || disposed || scene) return;
    loading = true;
    try {
      const module = await loadScene();
      if (disposed) return;
      scene = module.createVesselScene({ viewport, onError: () => fallback('3D không khả dụng. Hình minh họa và các chức năng mô phỏng vẫn hoạt động.') });
      if (scene.failed) return;
      scene.update(latestState, { animate: false });
      scene.setVisible(visible);
      stage.dataset.renderer = 'ready';
      if (notice) notice.textContent = '';
      if (reset) reset.disabled = false;
    } catch (error) {
      console.warn('Vessel 3D unavailable:', error);
      fallback('Không tải được 3D. Hình minh họa và các chức năng mô phỏng vẫn hoạt động.');
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) load();
    scene?.setVisible(visible);
  }, { rootMargin: '80px' });
  observer.observe(viewport);
  const resetCamera = () => scene?.resetCamera();
  reset?.addEventListener('click', resetCamera);
  return {
    update(state) {
      latestState = state;
      const model = buildVesselModel(state);
      const text = (selector, value) => { const output = stage.querySelector(selector); if (output) output.textContent = value; };
      text('[data-vessel-buret]', `${model.remainingMl.toFixed(2).replace('.', ',')} mL`);
      text('[data-vessel-total]', state ? `${model.totalMl.toFixed(2).replace('.', ',')} mL` : '—');
      text('[data-vessel-ph]', model.pH === null ? '—' : model.pH.toFixed(2).replace('.', ','));
      scene?.update(state);
    },
    dispose() { disposed = true; observer.disconnect(); reset?.removeEventListener('click', resetCamera); scene?.dispose(); },
  };
}
