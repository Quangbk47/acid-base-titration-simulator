import { calculateMilestones, classifyStage } from './milestones.js';
import { createInputError, isFiniteNumber, lToMl, STANDARD_KW, STANDARD_TEMPERATURE_K } from './units.js';

export const WEAK_ACID_STRONG_BASE_MODEL_VERSION = 'weak-acid-strong-base-v1';
const MAX_ITERATIONS = 200;
const LOG_H_MIN = -14;
const LOG_H_MAX = 0;

const validate = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: createInputError('INVALID_INPUT', 'Input phải là một object.') };
  const { Ca, Va, Cb, Vb, Ka, temperature } = input;
  const fields = {};
  for (const [key, value] of Object.entries({ Ca, Va, Cb, Vb, Ka, temperature })) if (!isFiniteNumber(value)) fields[key] = `${key} phải là số hữu hạn.`;
  if (Object.keys(fields).length) return { error: createInputError('NON_FINITE_INPUT', 'Input chứa giá trị không hữu hạn.', fields) };
  if (Ca <= 0) fields.Ca = 'Ca phải lớn hơn 0 M.';
  if (Va <= 0) fields.Va = 'Va phải lớn hơn 0 L.';
  if (Cb <= 0) fields.Cb = 'Cb phải lớn hơn 0 M.';
  if (Vb < 0) fields.Vb = 'Vb không được âm.';
  if (!(Ka > 0 && Ka < 1)) fields.Ka = 'Ka phải thỏa mãn 0 < Ka < 1.';
  if (Math.abs(temperature - STANDARD_TEMPERATURE_K) > 1e-9) fields.temperature = 'Model chỉ hỗ trợ 298.15 K (25 °C).';
  return Object.keys(fields).length ? { error: createInputError('OUT_OF_RANGE', 'Input nằm ngoài miền hợp lệ.', fields) } : { value: { Ca, Va, Cb, Vb, Ka } };
};

const chargeBalance = (h, sodium, total, ka) => h + sodium - STANDARD_KW / h - total * ka / (ka + h);

export const solveWeakAcidStrongBase = (input) => {
  const checked = validate(input);
  if (checked.error) return { error: checked.error };
  const { Ca, Va, Cb, Vb, Ka } = checked.value;
  const totalVolumeL = Va + Vb;
  const acidMoles = Ca * Va;
  const baseMoles = Cb * Vb;
  const total = acidMoles / totalVolumeL;
  const sodium = baseMoles / totalVolumeL;
  let low = LOG_H_MIN; let high = LOG_H_MAX;
  let iterations = 0; let h = 10 ** ((low + high) / 2); let residual = chargeBalance(h, sodium, total, Ka);
  while (iterations < MAX_ITERATIONS && Math.abs(residual) > 1e-13) {
    const mid = (low + high) / 2;
    h = 10 ** mid; residual = chargeBalance(h, sodium, total, Ka);
    if (residual > 0) high = mid; else low = mid;
    iterations += 1;
  }
  if (!Number.isFinite(h) || !Number.isFinite(residual) || Math.abs(residual) > 1e-10) return { error: createInputError('SOLVER_NOT_CONVERGED', 'Solver cân bằng điện tích không hội tụ.', { residual, iterations }) };
  const oh = STANDARD_KW / h;
  const ha = total * h / (Ka + h);
  const a = total * Ka / (Ka + h);
  const equivalenceMl = lToMl(acidMoles / Cb);
  const toleranceMol = Math.max(acidMoles, baseMoles) * 1e-12;
  const stage = classifyStage({ addedVolumeMl: lToMl(Vb), equivalenceMl, acidMoles, baseMoles, toleranceMol });
  const milestones = { ...calculateMilestones({ Ca, Va, Cb }), endpointMl: null };
  const delta = acidMoles - baseMoles;
  const excess = Math.abs(delta) <= toleranceMol ? { species: null, moles: 0, concentration: 0 } : delta > 0 ? { species: 'CH₃COOH', moles: delta, concentration: delta / totalVolumeL } : { species: 'OH⁻', moles: -delta, concentration: -delta / totalVolumeL };
  return {
    model: 'weak-acid-strong-base', modelVersion: WEAK_ACID_STRONG_BASE_MODEL_VERSION, temperatureK: STANDARD_TEMPERATURE_K, kw: STANDARD_KW, Ka,
    pH: -Math.log10(h), pOH: -Math.log10(oh), totalVolumeL, totalVolumeMl: lToMl(totalVolumeL), Veq: equivalenceMl,
    moles: { ch3coohInitial: acidMoles, naohAdded: baseMoles, neutralized: Math.min(acidMoles, baseMoles) },
    concentrations: { HPlus: h, OHMinus: oh, CH3COOH: ha, CH3COO: a, NaPlus: sodium },
    species: [
      { id: 'H⁺', moles: h * totalVolumeL, concentration: h }, { id: 'OH⁻', moles: oh * totalVolumeL, concentration: oh },
      { id: 'CH₃COOH', moles: ha * totalVolumeL, concentration: ha }, { id: 'CH₃COO⁻', moles: a * totalVolumeL, concentration: a }, { id: 'Na⁺', moles: baseMoles, concentration: sodium },
    ],
    excess, stage, dominantReaction: 'CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O', milestones,
    diagnostics: { solver: WEAK_ACID_STRONG_BASE_MODEL_VERSION, converged: true, residual: Math.abs(residual), iterations },
  };
};
