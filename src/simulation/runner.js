import { SIMULATION_SPEEDS } from './state.js';

export const createSimulationRunner = ({ onStep, onStateChange = () => {}, setTimeoutFn = globalThis.setTimeout, clearTimeoutFn = globalThis.clearTimeout, speed = 'normal' } = {}) => {
  if (typeof onStep !== 'function') throw new TypeError('onStep phải là function.');
  let timer = null;
  let currentSpeed = speed in SIMULATION_SPEEDS ? speed : 'normal';
  let running = false;
  let generation = 0;

  const schedule = () => {
    if (!running || timer !== null) return;
    const scheduledGeneration = generation;
    timer = setTimeoutFn(() => {
      if (!running || scheduledGeneration !== generation) return;
      timer = null;
      const next = onStep();
      if (next === false) {
        running = false;
        onStateChange('ready');
        return;
      }
      onStateChange('running');
      schedule();
    }, SIMULATION_SPEEDS[currentSpeed]);
  };
  const start = () => { running = true; onStateChange('running'); schedule(); };
  const pause = () => { generation += 1; running = false; if (timer !== null) { clearTimeoutFn(timer); timer = null; } onStateChange('paused'); };
  const reset = () => { pause(); onStateChange('ready'); };
  const setSpeed = (nextSpeed) => { if (!(nextSpeed in SIMULATION_SPEEDS)) return false; currentSpeed = nextSpeed; if (running) { generation += 1; if (timer !== null) clearTimeoutFn(timer); timer = null; schedule(); } return true; };
  const dispose = () => { generation += 1; running = false; if (timer !== null) clearTimeoutFn(timer); timer = null; };
  return Object.freeze({ start, pause, reset, setSpeed, dispose, get running() { return running; }, get speed() { return currentSpeed; } });
};
