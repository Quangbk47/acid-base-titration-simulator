import { solveStrongStrong, solveWeakAcidStrongBase, solveWeakBaseStrongAcid } from './index.js';
import { chemicalById, calciumSolubilityM } from '../data/chemicals.js';
import { pairForInput } from '../data/titrationPairs.js';

export const titrantKey = (input) => input.titrantVolumeKey ?? (input.Kb ? 'Va' : 'Vb');
export const withTitrantVolume = (input, volumeMl) => ({ ...input, [titrantKey(input)]: volumeMl / 1000 });
const error = (message) => ({ error: { code: 'PAIR_INPUT_ERROR', message } });

// Positive, monotonic electroneutrality residual; bisect logarithmic [H+].
const hydrogen = (residual) => {
  let low = -16; let high = 2;
  if (!(residual(10 ** low) < 0 && residual(10 ** high) > 0)) return null;
  for (let i = 0; i < 180; i++) {
    const mid = (low + high) / 2;
    if (residual(10 ** mid) > 0) high = mid; else low = mid;
    if (high - low < 1e-13) break;
  }
  return 10 ** ((low + high) / 2);
};

function solveExtended(input, pair) {
  const { Ca, Va, Cb, Vb, temperature } = input;
  if (![Ca, Va, Cb, Vb, temperature].every(Number.isFinite) || Ca <= 0 || Cb <= 0 || Va <= 0 || Vb < 0 || Math.abs(temperature - 298.15) > 1e-8) return error('Thông số không hợp lệ; mô hình chỉ hỗ trợ 25 °C.');
  if (pair.id === 'hcl-calcium') {
    if (Cb > calciumSolubilityM * (1 + 1e-12)) return error(`Ca(OH)₂ vượt độ tan lý tưởng ${calciumSolubilityM.toFixed(6)} M tại 25 °C.`);
    const result = solveStrongStrong({ ...input, Cb: 2 * Cb });
    if (result.error) return result;
    const calcium = Cb * Vb / (Va + Vb);
    const { NaPlus: ignored, ...concentrations } = result.concentrations;
    return { ...result, model: 'strong-acid-calcium-base', dominantReaction: pair.reaction, concentrations: { ...concentrations, Ca2Plus: calcium }, species: result.species.filter((s) => s.id !== 'Na⁺').concat({ id: 'Ca²⁺', moles: Cb * Vb, concentration: calcium }), moles: { acidInitial: Ca * Va, calciumAdded: Cb * Vb, hydroxideAdded: 2 * Cb * Vb } };
  }
  const totalVolumeL = Va + Vb; const acidTotal = Ca * Va / totalVolumeL; const baseTotal = Cb * Vb / totalVolumeL;
  if (![totalVolumeL, acidTotal, baseTotal].every(Number.isFinite) || acidTotal <= 0) return error('Thông số vượt miền số hữu hạn.');
  const kw = 1e-14; const oxalic = pair.id === 'oxalic-naoh';
  const { Ka1, Ka2 } = chemicalById('oxalic'); const Ka = kw / chemicalById('ammonia').Kb;
  const distribution = (h) => { const den = h * h + Ka1 * h + Ka1 * Ka2; return [h * h / den, Ka1 * h / den, Ka1 * Ka2 / den]; };
  const residual = oxalic ? (h) => { const a = distribution(h); return h + baseTotal - kw / h - acidTotal * (a[1] + 2 * a[2]); } : (h) => h + baseTotal * h / (Ka + h) - kw / h - acidTotal;
  const h = hydrogen(residual);
  if (!h || !Number.isFinite(residual(h)) || Math.abs(residual(h)) > 1e-11 * Math.max(1, acidTotal, baseTotal)) return error('Cân bằng điện tích không hội tụ.');
  const oh = kw / h; const Veq = pair.ratio * Ca * Va / Cb * 1000; const added = Vb * 1000;
  const equivalentVolumesMl = oxalic ? [Veq / 2, Veq] : [Veq];
  const nearVolume = (volume) => Math.abs(added - volume) <= 1e-9 * Math.max(added, volume, Number.MIN_VALUE);
  const stage = nearVolume(Veq) ? 'at-equivalence' : oxalic && nearVolume(Veq / 2) ? 'at-first-equivalence' : added < Veq ? 'before-equivalence' : 'after-equivalence';
  const species = [{ id: 'H⁺', concentration: h }, { id: 'OH⁻', concentration: oh }];
  if (oxalic) { const a = distribution(h); species.push(...['H₂C₂O₄', 'HC₂O₄⁻', 'C₂O₄²⁻'].map((id, i) => ({ id, concentration: acidTotal * a[i] })), { id: 'Na⁺', concentration: baseTotal }); }
  else { const ammonium = baseTotal * h / (Ka + h); species.push({ id: 'NH₃', concentration: baseTotal - ammonium }, { id: 'NH₄⁺', concentration: ammonium }, { id: 'Cl⁻', concentration: acidTotal }); }
  const delta = pair.ratio * Ca * Va - Cb * Vb;
  const amount = Math.abs(delta) <= 1e-10 * Math.max(pair.ratio * Ca * Va, Cb * Vb, Number.MIN_VALUE) ? 0 : Math.abs(delta);
  return { model: oxalic ? 'diprotic-acid-strong-base' : 'strong-acid-weak-base', modelVersion: 'charge-balance-v1', temperatureK: temperature, kw, pH: -Math.log10(h), pOH: -Math.log10(oh), Veq, equivalentVolumesMl, totalVolumeL, totalVolumeMl: totalVolumeL * 1000, stage, dominantReaction: pair.reaction, moles: { acidInitial: Ca * Va, baseAdded: Cb * Vb }, excess: { species: amount ? (oxalic ? (delta > 0 ? 'Đương lượng axit còn chuẩn độ' : 'OH⁻') : (delta > 0 ? 'H⁺' : 'NH₃')) : null, moles: amount, concentration: amount / totalVolumeL }, species: species.map((s) => ({ ...s, moles: s.concentration * totalVolumeL })), concentrations: { HPlus: h, OHMinus: oh }, milestones: { halfEqMl: Veq / 2, equivalenceMl: Veq, endpointMl: null, equivalentVolumesMl }, diagnostics: { converged: true, residual: residual(h), solver: 'charge-balance-v1' } };
}

export function phenolphthaleinThresholdMl(input, maxVolumeMl) {
  // A threshold crossing is an indicator model, never an equivalence assertion.
  if (pairForInput(input).base === 'ammonia') return null;
  const before = solvePair(withTitrantVolume(input, 0));
  const after = solvePair(withTitrantVolume(input, maxVolumeMl));
  if (before.error || after.error || before.pH >= 8.2 || after.pH < 8.2) return null;
  let low = 0; let high = maxVolumeMl;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2; const result = solvePair(withTitrantVolume(input, mid));
    if (result.error) return null;
    if (result.pH < 8.2) low = mid; else high = mid;
  }
  return (low + high) / 2;
}

export function solvePair(input) {
  const pair = pairForInput(input);
  if (['hcl-nh3', 'oxalic-naoh', 'hcl-calcium'].includes(pair.id)) return solveExtended(input, pair);
  return (input.Kb ? solveWeakBaseStrongAcid : input.Ka ? solveWeakAcidStrongBase : solveStrongStrong)(input);
}
export const solverForInput = () => solvePair;
