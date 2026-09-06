export const phenolphthalein = Object.freeze({ transitionStart: 8.2, transitionEnd: 10 });

export const indicatorState = (result) => {
  if (!result) return { color: 'clear', label: 'Chưa quan sát' };
  if (result.pH < phenolphthalein.transitionStart) return { color: 'clear', label: 'Không màu' };
  if (result.pH < phenolphthalein.transitionEnd) return { color: 'pink-transition', label: 'Đang chuyển hồng' };
  return { color: 'pink', label: 'Hồng bền' };
};

export const renderIndicator = (result) => {
  const element = document.querySelector('[data-indicator]');
  if (!element) return;
  const state = indicatorState(result);
  element.textContent = `Phenolphthalein: ${state.label}`;
  element.dataset.color = state.color;
};

