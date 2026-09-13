import {
  createInputError,
  isFiniteNumber,
  lToMl,
  STANDARD_KW,
  isSupportedTemperatureK,
} from './units.js';
import { calculateEquivalenceMolTolerance, calculateMilestones, classifyStage } from './milestones.js';

const MODEL_VERSION = 'weak-base-strong-acid-v1';
const DOMINANT_REACTION = 'NH₃ + H⁺ → NH₄⁺';
const MAX_ITERATIONS = 180;
const LOG_TOLERANCE = 1e-12;
const RESIDUAL_TOLERANCE = 1e-14;

const invalid = (code, message, fields = {}) => ({ error: createInputError(code, message, fields) });

const validateInput = (input) => {
  if (!input || typeof input !== 'object') return invalid('INVALID_INPUT', 'Input phải là một object.');
  const { Cb, Vb, Ca, Va, Kb, temperature } = input;
  const fields = {};
  for (const [name, value] of Object.entries({ Cb, Vb, Ca, Va, Kb, temperature })) {
    if (!isFiniteNumber(value)) fields[name] = `${name} phải là số hữu hạn.`;
  }
  if (Cb <= 0) fields.Cb = 'Cb phải lớn hơn 0 M.';
  if (Vb <= 0) fields.Vb = 'Vb phải lớn hơn 0 L.';
  if (Ca <= 0) fields.Ca = 'Ca phải lớn hơn 0 M.';
  if (Va < 0) fields.Va = 'Va không được âm.';
  if (!(Kb > 0 && Kb < 1)) fields.Kb = 'Kb phải lớn hơn 0 và nhỏ hơn 1.';
  if (!isSupportedTemperatureK(temperature)) fields.temperature = 'Phase 4 chỉ hỗ trợ 298.15 K (25 °C).';
  if (Object.keys(fields).length) return invalid('OUT_OF_RANGE', 'Input nằm ngoài miền hợp lệ.', fields);
  const totalVolumeL = Va + Vb;
  const baseMoles = Cb * Vb;
  const acidMoles = Ca * Va;
  if (!(totalVolumeL > 0) || !isFiniteNumber(totalVolumeL)) return invalid('ZERO_TOTAL_VOLUME', 'Tổng thể tích phải lớn hơn 0.');
  if (!(baseMoles > 0) || !isFiniteNumber(baseMoles) || !isFiniteNumber(acidMoles)) return invalid('MOLE_CALCULATION_OUT_OF_RANGE', 'Input tạo số mol không hữu hạn.');
  return { value: { Cb, Vb, Ca, Va, Kb, temperature, totalVolumeL, baseMoles, acidMoles } };
};

const solveHydrogen = ({ ammoniaConcentration, chlorideConcentration, Ka }) => {
  const chargeBalance = (logH) => {
    const h = 10 ** logH;
    const ammonium = ammoniaConcentration * h / (Ka + h);
    return h + ammonium - STANDARD_KW / h - chlorideConcentration;
  };
  let low = -14;
  let high = 0;
  let residual = Number.POSITIVE_INFINITY;
  let logH = -7;
  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    logH = (low + high) / 2;
    residual = chargeBalance(logH);
    if (Math.abs(residual) <= RESIDUAL_TOLERANCE || high - low <= LOG_TOLERANCE) return { h: 10 ** logH, residual, iterations: iteration, converged: true };
    if (residual > 0) high = logH;
    else low = logH;
  }
  return { h: 10 ** logH, residual, iterations: MAX_ITERATIONS, converged: false };
};

export const solveWeakBaseStrongAcid = (input) => {
  const validation = validateInput(input);
  if (validation.error) return validation;
  const { Cb, Vb, Ca, Va, Kb, temperature, totalVolumeL, baseMoles, acidMoles } = validation.value;
  const Ka = STANDARD_KW / Kb;
  const ammoniaConcentration = baseMoles / totalVolumeL;
  const chlorideConcentration = acidMoles / totalVolumeL;
  const solved = solveHydrogen({ ammoniaConcentration, chlorideConcentration, Ka });
  if (!solved.converged) return invalid('SOLVER_NOT_CONVERGED', 'Không hội tụ cân bằng điện tích.', { residual: solved.residual });
  const h = solved.h;
  const oh = STANDARD_KW / h;
  const ammonium = ammoniaConcentration * h / (Ka + h);
  const ammonia = ammoniaConcentration - ammonium;
  const pH = -Math.log10(h);
  const pOH = -Math.log10(oh);
  const toleranceMol = calculateEquivalenceMolTolerance(baseMoles, acidMoles);
  const equivalenceMl = lToMl(baseMoles / Ca);
  const stage = classifyStage({ addedVolumeMl: lToMl(Va), equivalenceMl, acidMoles: baseMoles, baseMoles: acidMoles, toleranceMol });
  const milestones = calculateMilestones({ Ca: Cb, Va: Vb, Cb: Ca });
  if (milestones.error) return milestones;
  const residualBase = Math.max(0, baseMoles - acidMoles);
  const residualAcid = Math.max(0, acidMoles - baseMoles);
  const excess = residualBase > toleranceMol
    ? { species: 'NH₃', moles: residualBase, concentration: residualBase / totalVolumeL }
    : residualAcid > toleranceMol
      ? { species: 'H⁺', moles: residualAcid, concentration: residualAcid / totalVolumeL }
      : { species: null, moles: 0, concentration: 0 };
  return {
    model: 'weak-base-strong-acid', modelVersion: MODEL_VERSION, temperatureK: temperature, kw: STANDARD_KW, Kb, pKb: -Math.log10(Kb), pH, pOH,
    Veq: equivalenceMl, totalVolumeL, totalVolumeMl: lToMl(totalVolumeL),
    moles: { ammoniaInitial: baseMoles, hclAdded: acidMoles, residualNH3: residualBase, residualH: residualAcid }, excess,
    concentrations: { HPlus: h, OHMinus: oh, NH3: ammonia, NH4Plus: ammonium, ClMinus: chlorideConcentration },
    species: [
      { id: 'H⁺', moles: h * totalVolumeL, concentration: h },
      { id: 'OH⁻', moles: oh * totalVolumeL, concentration: oh },
      { id: 'NH₃', moles: ammonia * totalVolumeL, concentration: ammonia },
      { id: 'NH₄⁺', moles: ammonium * totalVolumeL, concentration: ammonium },
      { id: 'Cl⁻', moles: acidMoles, concentration: chlorideConcentration },
    ],
    stage, dominantReaction: DOMINANT_REACTION, milestones,
    diagnostics: { solver: MODEL_VERSION, converged: true, residual: solved.residual, iterations: solved.iterations },
  };
};

export { DOMINANT_REACTION, MODEL_VERSION };
