import {
  createInputError,
  isFiniteNumber,
  lToMl,
  STANDARD_KW,
  isSupportedTemperatureK,
} from './units.js';
import { calculateEquivalenceMolTolerance, classifyStage } from './milestones.js';

const MODEL_VERSION = 'strong-acid-weak-base-v1';
const DOMINANT_REACTION = 'NH3 + H+ → NH4+';
const LOG_H_MIN = -16;
const LOG_H_MAX = 1;
const MAX_ITERATIONS = 200;
const LOG_TOLERANCE = 1e-12;
const RESIDUAL_TOLERANCE = 1e-12;

const invalid = (code, message, fields = {}) => ({ error: createInputError(code, message, fields) });

const validateInput = (input) => {
  if (!input || typeof input !== 'object') return invalid('INVALID_INPUT', 'Input must be an object.');
  const { Ca, Va, Cb, Vb, Kb, temperature } = input;
  const fields = {};
  for (const [name, value] of Object.entries({ Ca, Va, Cb, Vb, Kb, temperature })) {
    if (!isFiniteNumber(value)) fields[name] = `${name} must be finite.`;
  }
  if (Ca <= 0) fields.Ca = 'Ca (HCl concentration) must be greater than 0 M.';
  if (Va < 0) fields.Va = 'Va (HCl volume) cannot be negative.';
  if (Cb <= 0) fields.Cb = 'Cb (NH3 concentration) must be greater than 0 M.';
  if (Vb <= 0) fields.Vb = 'Vb (NH3 volume) must be greater than 0 L.';
  if (!(Kb > 0 && Kb < 1)) fields.Kb = 'Kb must be in the interval (0, 1).';
  if (!isSupportedTemperatureK(temperature)) fields.temperature = 'Only 298.15 K (25 °C) is supported.';
  if (Object.keys(fields).length > 0) return invalid('OUT_OF_RANGE', 'Input is outside the supported domain.', fields);

  const totalVolumeL = Va + Vb;
  const acidMoles = Ca * Va;
  const baseMoles = Cb * Vb;
  if (!(totalVolumeL > 0) || !isFiniteNumber(totalVolumeL)) {
    return invalid('ZERO_TOTAL_VOLUME', 'Total volume must be greater than 0 L.');
  }
  if (![acidMoles, baseMoles].every(isFiniteNumber) || !(baseMoles > 0)) {
    return invalid('MOLE_CALCULATION_OUT_OF_RANGE', 'Input produced invalid mole values.');
  }
  return { value: { Ca, Va, Cb, Vb, Kb, temperature, totalVolumeL, acidMoles, baseMoles } };
};

const solveHydrogen = ({ totalAmmoniaConcentration, chlorideConcentration, Kb }) => {
  const chargeBalance = (logH) => {
    const h = 10 ** logH;
    const ammonium = (totalAmmoniaConcentration * Kb) / (Kb + STANDARD_KW / h);
    return h + ammonium - STANDARD_KW / h - chlorideConcentration;
  };
  let low = LOG_H_MIN;
  let high = LOG_H_MAX;
  let logH = (low + high) / 2;
  let residual = Number.POSITIVE_INFINITY;
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

export const solveStrongAcidWeakBase = (input) => {
  const validation = validateInput(input);
  if (validation.error) return validation;
  const { Ca, Va, Cb, Vb, Kb, temperature, totalVolumeL, acidMoles, baseMoles } = validation.value;
  const totalAmmoniaConcentration = baseMoles / totalVolumeL;
  const chlorideConcentration = acidMoles / totalVolumeL;
  const solved = solveHydrogen({ totalAmmoniaConcentration, chlorideConcentration, Kb });
  if (!solved.converged) {
    return invalid('SOLVER_NOT_CONVERGED', 'Charge-balance solver did not converge.', { residual: solved.residual });
  }

  const h = solved.h;
  const oh = STANDARD_KW / h;
  const ammoniumConcentration = (totalAmmoniaConcentration * Kb) / (Kb + STANDARD_KW / h);
  const ammoniaConcentration = totalAmmoniaConcentration - ammoniumConcentration;
  const equivalenceMl = lToMl(baseMoles / Ca);
  const toleranceMol = calculateEquivalenceMolTolerance(acidMoles, baseMoles);
  const stage = classifyStage({
    addedVolumeMl: lToMl(Va),
    equivalenceMl,
    // classifyStage is named for the HCl-NaOH orientation. Swap its mole
    // arguments because the titrand here is the weak base and the titrant is acid.
    acidMoles: baseMoles,
    baseMoles: acidMoles,
    toleranceMol,
  });
  const excessH = Math.max(0, acidMoles - baseMoles);
  const residualNH3 = Math.max(0, baseMoles - acidMoles);
  const stoichiometricNH4 = Math.min(acidMoles, baseMoles);

  return {
    model: 'strong-acid-weak-base',
    modelVersion: MODEL_VERSION,
    temperatureK: temperature,
    kw: STANDARD_KW,
    Kb,
    pKb: -Math.log10(Kb),
    pH: -Math.log10(h),
    pOH: -Math.log10(oh),
    Veq: equivalenceMl,
    totalVolumeL,
    totalVolumeMl: lToMl(totalVolumeL),
    moles: {
      ammoniaInitial: baseMoles,
      hclAdded: acidMoles,
      residualNH3,
      stoichiometricNH4,
      residualH: excessH,
    },
    excess: residualNH3 > toleranceMol
      ? { species: 'NH3', moles: residualNH3, concentration: residualNH3 / totalVolumeL }
      : excessH > toleranceMol
        ? { species: 'H+', moles: excessH, concentration: excessH / totalVolumeL }
        : { species: null, moles: 0, concentration: 0 },
    concentrations: {
      HPlus: h,
      OHMinus: oh,
      ClMinus: chlorideConcentration,
      NH3: ammoniaConcentration,
      NH4Plus: ammoniumConcentration,
    },
    species: [
      { id: 'H+', moles: h * totalVolumeL, concentration: h },
      { id: 'OH-', moles: oh * totalVolumeL, concentration: oh },
      { id: 'Cl-', moles: acidMoles, concentration: chlorideConcentration },
      { id: 'NH3', moles: ammoniaConcentration * totalVolumeL, concentration: ammoniaConcentration },
      { id: 'NH4+', moles: ammoniumConcentration * totalVolumeL, concentration: ammoniumConcentration },
    ],
    stage,
    dominantReaction: DOMINANT_REACTION,
    milestones: { Veq: equivalenceMl, halfEqMl: equivalenceMl / 2, equivalenceMl, endpointMl: null },
    diagnostics: { solver: MODEL_VERSION, converged: true, residual: solved.residual, iterations: solved.iterations },
  };
};

export { DOMINANT_REACTION, MODEL_VERSION };
