import { derivePhenolphthaleinState } from './indicatorView.js';

const positive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Presentation only: volumes and color come from the existing simulation/indicator.
// A fixed 250 mL flask is enlarged for unusually large input volumes.
export function buildVesselModel(state, { sampleMl = 25, buretMl = 50, indicatorName = 'none' } = {}) {
  const initialMl = Number.isFinite(state?.initialBuretVolumeMl) && state.initialBuretVolumeMl >= 0 ? state.initialBuretVolumeMl : Number.isFinite(buretMl) && buretMl >= 0 ? buretMl : 50;
  const dispensedMl = Math.max(0, (state?.addedVolumeMl ?? 0) - (state?.initialAddedVolumeMl ?? 0));
  const remainingMl = Math.max(0, initialMl - dispensedMl);
  const totalMl = positive(state?.result?.totalVolumeMl, positive(state?.chemistryInput?.[state?.titrantVolumeKey === 'Va' ? 'Vb' : 'Va'], positive(sampleMl, 25) / 1000) * 1000 + (state?.addedVolumeMl ?? 0));
  const capacityMl = Math.max(250, totalMl / 0.85);
  const indicator = indicatorName === 'phenolphthalein' ? derivePhenolphthaleinState(state?.result) : { state: 'none', color: 'transparent' };
  const alpha = Number(indicator.color.match(/,\s*([\d.]+)\)$/)?.[1] ?? 0);
  return {
    initialMl, remainingMl, totalMl, capacityMl, sampleVolumeMl: totalMl - (state?.addedVolumeMl ?? 0), addedMl: state?.addedVolumeMl ?? 0, indicatorName,
    buretFraction: clamp(remainingMl / Math.max(50, initialMl), 0, 1),
    flaskFraction: clamp(totalMl / capacityMl, 0, 0.85),
    indicator: indicator.state,
    pinkStrength: alpha,
    dropCount: state?.dropCount ?? 0,
    status: state?.status ?? 'idle',
    pH: state?.result?.pH ?? null,
  };
}

// Shared scene coordinates: all heights are world units, not laboratory lengths.
export const VESSEL_LAYOUT = Object.freeze({ axisX: 0.35, rodX: -1.12, rodZ: -0.45, baseWidth: 1.0, baseDepth: 0.9, rimY: 1.75, tipY: 2.05, buretBottom: 3.0, buretTop: 5.3, buretInnerRadius: 0.125, buretLiquidRadius: 0.113 });
// Tiny separation avoids z-fighting with the inner glass floor, without a floating pool.
export const FLASK_BOTTOM = 0.212;
export const FLASK_BODY_HEIGHT = 1.3 - FLASK_BOTTOM;
export const LIQUID_CLEARANCE = 0.014;
export const FLASK_INNER_PROFILE = Object.freeze([[0.60, 0.21], [0.64, 0.24], [0.65, 0.28], [0.63, 0.34], [0.22, 1.3], [0.19, 1.4], [0.19, 1.75]].map(Object.freeze));
export const FLASK_GLASS_PROFILE = Object.freeze([[0, 0.17], [0.6, 0.17], [0.68, 0.21], [0.71, 0.28], [0.69, 0.35], [0.26, 1.3], [0.23, 1.4], [0.23, 1.73], [0.25, 1.75], [0.19, 1.75], ...FLASK_INNER_PROFILE.slice(0, -1).reverse(), [0, 0.21]].map(Object.freeze));
export function flaskInnerRadiusAt(worldY) {
  for (let i = 1; i < FLASK_INNER_PROFILE.length; i++) {
    const [r0, y0] = FLASK_INNER_PROFILE[i - 1]; const [r1, y1] = FLASK_INNER_PROFILE[i];
    if (worldY <= y1) return r0 + (r1 - r0) * clamp((worldY - y0) / (y1 - y0), 0, 1);
  }
  return FLASK_INNER_PROFILE.at(-1)[0];
}
export const flaskRadiusAt = (height) => flaskInnerRadiusAt(FLASK_BOTTOM + clamp(height, 0, FLASK_BODY_HEIGHT)) - LIQUID_CLEARANCE;
export const flaskLiquidProfile = (height) => {
  const h = clamp(height, 0, FLASK_BODY_HEIGHT);
  return [[0, FLASK_BOTTOM], [flaskRadiusAt(0), FLASK_BOTTOM], ...FLASK_INNER_PROFILE.filter(([, y]) => y > FLASK_BOTTOM && y < FLASK_BOTTOM + h).map(([r, y]) => [r - LIQUID_CLEARANCE, y]), [flaskRadiusAt(h), FLASK_BOTTOM + h]];
};
export function flaskVolumeAt(height) {
  // Exact piecewise-frustum integral (π cancels when calculating fill fractions).
  const profile = flaskLiquidProfile(height).slice(1);
  let volume = 0;
  for (let i = 1; i < profile.length; i++) { const [r0, y0] = profile[i - 1]; const [r1, y1] = profile[i]; volume += (y1 - y0) * (r0 * r0 + r0 * r1 + r1 * r1) / 3; }
  return volume;
}
export function flaskFillHeight(fraction) {
  const target = flaskVolumeAt(FLASK_BODY_HEIGHT) * clamp(fraction, 0, 1);
  let low = 0;
  let high = FLASK_BODY_HEIGHT;
  for (let i = 0; i < 32; i += 1) {
    const mid = (low + high) / 2;
    if (flaskVolumeAt(mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

// Loading/restoring a snapshot or changing pH alone must never manufacture a drop.
export const hasDispensedDrop = (previous, next) => next.dropCount === previous.dropCount + 1 && next.addedMl > previous.addedMl && next.remainingMl < previous.remainingMl;
