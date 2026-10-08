import { derivePhenolphthaleinState } from './indicatorView.js';

const positive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Presentation only: volumes and color come from the existing simulation/indicator.
// A fixed 250 mL flask is enlarged for unusually large input volumes.
export function buildVesselModel(state) {
  const initialMl = Number.isFinite(state?.initialBuretVolumeMl) && state.initialBuretVolumeMl >= 0 ? state.initialBuretVolumeMl : 50;
  const dispensedMl = Math.max(0, (state?.addedVolumeMl ?? 0) - (state?.initialAddedVolumeMl ?? 0));
  const remainingMl = Math.max(0, initialMl - dispensedMl);
  const totalMl = positive(state?.result?.totalVolumeMl, positive(state?.chemistryInput?.Va, 0.025) * 1000 + (state?.addedVolumeMl ?? 0));
  const capacityMl = Math.max(250, totalMl / 0.85);
  const indicator = derivePhenolphthaleinState(state?.result);
  const alpha = Number(indicator.color.match(/,\s*([\d.]+)\)$/)?.[1] ?? 0);
  return {
    initialMl, remainingMl, totalMl, capacityMl,
    buretFraction: clamp(remainingMl / Math.max(50, initialMl), 0, 1),
    flaskFraction: clamp(totalMl / capacityMl, 0, 0.85),
    indicator: indicator.state,
    pinkStrength: alpha,
    dropCount: state?.dropCount ?? 0,
    status: state?.status ?? 'idle',
    pH: state?.result?.pH ?? null,
  };
}

// Volume integral of a conical body with rounded base, inverted by bisection.
// This is vessel geometry, never a chemistry calculation.
export const FLASK_BOTTOM = 0.18;
export const FLASK_BODY_HEIGHT = 1.12;
export const flaskRadiusAt = (height) => 0.68 - 0.45 * clamp(height / FLASK_BODY_HEIGHT, 0, 1);
const volumeAt = (height) => {
  const slope = -0.45 / FLASK_BODY_HEIGHT;
  return 0.68 ** 2 * height + 0.68 * slope * height ** 2 + slope ** 2 * height ** 3 / 3;
};
export function flaskFillHeight(fraction) {
  const target = volumeAt(FLASK_BODY_HEIGHT) * clamp(fraction, 0, 1);
  let low = 0;
  let high = FLASK_BODY_HEIGHT;
  for (let i = 0; i < 32; i += 1) {
    const mid = (low + high) / 2;
    if (volumeAt(mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
