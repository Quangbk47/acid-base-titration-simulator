import {
  createInputError,
  isFiniteNumber,
  lToMl,
  STANDARD_KW,
  isSupportedTemperatureK,
} from './units.js';
import { calculateMilestones, calculateEquivalenceMolTolerance, classifyStage } from './milestones.js';

const MODEL_VERSION = 'weak-acid-strong-base-v1';
const DOMINANT_REACTION = 'HA + OH⁻ → A⁻ + H₂O';
const LOG_H_MIN = -14;
const LOG_H_MAX = 0;
const MAX_ITERATIONS = 160;
const LOG_TOLERANCE = 1e-12;
const RESIDUAL_TOLERANCE = 1e-14;

const invalid = (code, message, fields = {}) => ({ error: createInputError(code, message, fields) });

const validateInput = (input) => {
  if (!input || typeof input !== 'object') return invalid('INVALID_INPUT', 'Input phải là một object.');
  const { Ca, Va, Cb, Vb, Ka, temperature } = input;
  const fields = {};
  for (const [name, value] of Object.entries({ Ca, Va, Cb, Vb, Ka, temperature })) {
    if (!isFiniteNumber(value)) fields[name] = `${name} phải là số hữu hạn.`;
  }
  if (Ca <= 0) fields.Ca = 'Ca phải lớn hơn 0 M.';
  if (Va <= 0) fields.Va = 'Va phải lớn hơn 0 L.';
  if (Cb <= 0) fields.Cb = 'Cb phải lớn hơn 0 M.';
  if (Vb < 0) fields.Vb = 'Vb không được âm.';
  if (!(Ka > 0 && Ka < 1)) fields.Ka = 'Ka phải lớn hơn 0 và nhỏ hơn 1.';
  if (!isSupportedTemperatureK(temperature)) fields.temperature = 'Phase 3 chỉ hỗ trợ 298.15 K (25 °C).';
  if (Object.keys(fields).length) return invalid('OUT_OF_RANGE', 'Input nằm ngoài miền hợp lệ.', fields);
  const totalVolumeL = Va + Vb;
  const acidMoles = Ca * Va;
  const baseMoles = Cb * Vb;
  if (!(totalVolumeL > 0) || !isFiniteNumber(totalVolumeL)) return invalid('ZERO_TOTAL_VOLUME', 'Tổng thể tích phải lớn hơn 0.');
  if (!(acidMoles > 0) || !isFiniteNumber(acidMoles) || !isFiniteNumber(baseMoles)) {
    return invalid('MOLE_CALCULATION_OUT_OF_RANGE', 'Input tạo số mol không hữu hạn.');
  }
  return { value: { Ca, Va, Cb, Vb, Ka, temperature, totalVolumeL, acidMoles, baseMoles } };
};

const solveHydrogen = ({ acidConcentration, sodiumConcentration, Ka }) => {
  const chargeBalance = (logH) => {
    const h = 10 ** logH;
    return h + sodiumConcentration - STANDARD_KW / h - acidConcentration * Ka / (Ka + h);
  };
  let low = LOG_H_MIN;
  let high = LOG_H_MAX;
  let residual = Number.POSITIVE_INFINITY;
  let logH = (low + high) / 2;
  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    logH = (low + high) / 2;
    residual = chargeBalance(logH);
    if (Math.abs(residual) <= RESIDUAL_TOLERANCE || high - low <= LOG_TOLERANCE) {
      return { h: 10 ** logH, residual, iterations: iteration, converged: true };
    }
    if (residual > 0) high = logH;
    else low = logH;
  }
  return { h: 10 ** logH, residual, iterations: MAX_ITERATIONS, converged: false };
};

export const solveWeakAcidStrongBase = (input) => {
  const validation = validateInput(input);
  if (validation.error) return validation;
  const { Ca, Va, Cb, Vb, Ka, temperature, totalVolumeL, acidMoles, baseMoles } = validation.value;
  const acidConcentration = acidMoles / totalVolumeL;
  const sodiumConcentration = baseMoles / totalVolumeL;
  const solved = solveHydrogen({ acidConcentration, sodiumConcentration, Ka });
  if (!solved.converged) return invalid('SOLVER_NOT_CONVERGED', 'Không hội tụ cân bằng điện tích.', { residual: solved.residual });

  const h = solved.h;
  const oh = STANDARD_KW / h;
  const conjugateBaseConcentration = acidConcentration * Ka / (Ka + h);
  const acidConcentrationAtEquilibrium = acidConcentration - conjugateBaseConcentration;
  const pH = -Math.log10(h);
  const pOH = -Math.log10(oh);
  const toleranceMol = calculateEquivalenceMolTolerance(acidMoles, baseMoles);
  const equivalenceMl = lToMl(acidMoles / Cb);
  const stage = classifyStage({
    addedVolumeMl: lToMl(Vb),
    equivalenceMl,
    acidMoles,
    baseMoles,
    toleranceMol,
  });
  const milestones = calculateMilestones({ Ca, Va, Cb });
  if (milestones.error) return milestones;
  const residualH = Math.max(0, acidMoles - baseMoles);
  const residualOH = Math.max(0, baseMoles - acidMoles);
  const excess = residualH > toleranceMol
    ? { species: 'HA', moles: residualH, concentration: residualH / totalVolumeL }
    : residualOH > toleranceMol
      ? { species: 'OH⁻', moles: residualOH, concentration: residualOH / totalVolumeL }
      : { species: null, moles: 0, concentration: 0 };
  return {
    model: 'weak-acid-strong-base',
    modelVersion: MODEL_VERSION,
    temperatureK: temperature,
    kw: STANDARD_KW,
    Ka,
    pKa: -Math.log10(Ka),
    pH,
    pOH,
    Veq: equivalenceMl,
    totalVolumeL,
    totalVolumeMl: lToMl(totalVolumeL),
    moles: { acidInitial: acidMoles, naohAdded: baseMoles, residualHA: residualH, residualOH },
    excess,
    concentrations: { HPlus: h, OHMinus: oh, NaPlus: sodiumConcentration, AMinus: conjugateBaseConcentration, HA: acidConcentrationAtEquilibrium },
    species: [
      { id: 'H⁺', moles: h * totalVolumeL, concentration: h },
      { id: 'OH⁻', moles: oh * totalVolumeL, concentration: oh },
      { id: 'Na⁺', moles: baseMoles, concentration: sodiumConcentration },
      { id: 'HA', moles: acidConcentrationAtEquilibrium * totalVolumeL, concentration: acidConcentrationAtEquilibrium },
      { id: 'A⁻', moles: conjugateBaseConcentration * totalVolumeL, concentration: conjugateBaseConcentration },
    ],
    stage,
    dominantReaction: DOMINANT_REACTION,
    milestones,
    diagnostics: { solver: MODEL_VERSION, converged: true, residual: solved.residual, iterations: solved.iterations },
  };
};

export { DOMINANT_REACTION, MODEL_VERSION };
