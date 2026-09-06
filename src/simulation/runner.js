export const speedDelayMs = Object.freeze({ slow: 900, medium: 500, fast: 180 });

export const createRunner = ({ onStep, onState }) => {
  let timerId = null;
  const stop = () => { if (timerId !== null) clearInterval(timerId); timerId = null; return timerId; };
  const start = (delayMs) => { stop(); timerId = setInterval(onStep, delayMs); onState(timerId); return timerId; };
  return Object.freeze({ start, stop, get timerId() { return timerId; } });
};

