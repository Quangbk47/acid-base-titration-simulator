export const derivePhenolphthaleinState = (result) => {
  if (!result) return { state: 'idle', color: 'transparent', transient: false };
  if (result.pH >= 8.2) {
    const intensity = result.pH < 10 ? Math.max(0.05, 0.62 * (result.pH - 8.2) / 1.8) : Math.min(1, 0.62 + ((result.pH - 10) / 4) * 0.38);
    return { state: 'base-excess', color: `rgba(243, 139, 182, ${intensity.toFixed(2)})`, transient: false };
  }
  if (result.stage === 'at-equivalence') return { state: 'equivalence', color: 'rgba(243, 139, 182, 0)', transient: false };
  return { state: 'acidic', color: 'rgba(243, 139, 182, 0)', transient: true };
};

const transientTimers = new WeakMap();
export const renderIndicatorView = (root, result, { transient = false, transientDelayMs = 0, transientStrength = 0.22, setTimeoutFn = globalThis.setTimeout, clearTimeoutFn = globalThis.clearTimeout } = {}) => {
  const solution = root?.querySelector('[data-indicator-solution]');
  const label = root?.querySelector('[data-indicator-state]');
  if (!solution) return;
  const indicator = derivePhenolphthaleinState(result);
  solution.dataset.indicator = indicator.state;
  solution.style.setProperty('--indicator-color', indicator.color);
  solution.style.setProperty('--transient-alpha', Math.min(0.58, transientStrength).toFixed(2));
  const prior = transientTimers.get(solution);
  if (prior !== undefined) clearTimeoutFn(prior);
  transientTimers.delete(solution);
  solution.classList.remove('indicator-transient');
  if (transient && indicator.state === 'acidic') {
    const showTransient = () => {
      solution.classList.toggle('indicator-transient', true);
      transientTimers.set(solution, setTimeoutFn(() => { solution.classList.remove('indicator-transient'); transientTimers.delete(solution); }, 500));
    };
    if (transientDelayMs > 0) transientTimers.set(solution, setTimeoutFn(showTransient, transientDelayMs));
    else showTransient();
  }
  if (label) label.textContent = indicator.state === 'base-excess' ? 'Hồng bền (dư OH⁻)' : indicator.state === 'equivalence' ? 'Không màu · tương đương' : indicator.state === 'acidic' ? 'Không màu · trước tương đương' : 'Chưa có dữ liệu';
};
