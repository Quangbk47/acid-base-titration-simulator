export const DROP_SIZES_ML = Object.freeze([0.05, 0.1]);

export const createSimulationState = (initial = {}) => ({
  screen: 'idle', addedVolumeMl: 0, dropSizeMl: initial.dropSizeMl ?? 0.1,
  speed: initial.speed ?? 'medium', history: [], current: null, timerId: null,
  indicatorEffect: null,
});

export const addDropState = (state, solved) => ({
  ...state, screen: 'ready', addedVolumeMl: solved.volumeMl,
  current: solved, history: [...state.history, solved],
});

export const resetSimulationState = (state) => ({
  ...createSimulationState({ dropSizeMl: state.dropSizeMl, speed: state.speed }), screen: 'ready',
});

export const isRunning = (state) => state.screen === 'running' && state.timerId !== null;

