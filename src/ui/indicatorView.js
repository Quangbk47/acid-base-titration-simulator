export const derivePhenolphthaleinState = (result) => {
  if (!result) return { state: 'idle', color: 'transparent', transient: false };
  if (result.stage === 'at-equivalence' || result.stage === 'near-equivalence') return { state: 'equivalence', color: 'transparent', transient: false };
  if (result.excess?.species === 'OH⁻' || result.pH >= 10) return { state: 'base-excess', color: '#f38bb6', transient: false };
  return { state: 'acidic', color: 'transparent', transient: true };
};

const transientTimers = new WeakMap();
export const renderIndicatorView = (root, result, { transient = false } = {}) => {
  const solution = root?.querySelector('[data-indicator-solution]');
  const label = root?.querySelector('[data-indicator-state]');
  if (!solution) return;
  const indicator = derivePhenolphthaleinState(result);
  solution.dataset.indicator = indicator.state;
  solution.style.setProperty('--indicator-color', indicator.color);
  const prior = transientTimers.get(solution);
  if (prior) clearTimeout(prior);
  solution.classList.toggle('indicator-transient', Boolean(transient));
  if (transient) transientTimers.set(solution, setTimeout(() => { solution.classList.remove('indicator-transient'); transientTimers.delete(solution); }, 500));
  if (label) label.textContent = indicator.state === 'base-excess' ? 'Hồng bền (dư OH⁻)' : indicator.state === 'equivalence' ? 'Không màu · tương đương' : indicator.state === 'acidic' ? 'Không màu · trước tương đương' : 'Chưa có dữ liệu';
};
