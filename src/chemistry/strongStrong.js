import { createInputError, isFiniteNumber, STANDARD_KW, validateStrongStrongInput } from './units.js';
import { calculateMilestones, classifyStage, EQUIVALENCE_MOL_TOLERANCE } from './milestones.js';

const MODEL_VERSION = 'strong-strong-v1';
const DOMINANT_REACTION = 'H⁺ + OH⁻ → H₂O';

const containsNonFiniteNumber = (value) => {
  if (typeof value === 'number') return !Number.isFinite(value);
  if (Array.isArray(value)) return value.some(containsNonFiniteNumber);
  if (value && typeof value === 'object') return Object.values(value).some(containsNonFiniteNumber);
  return false;
};

const finiteResultOrError = (result) =>
  containsNonFiniteNumber(result)
    ? { error: createInputError('NON_FINITE_RESULT', 'Solver tạo ra giá trị không hữu hạn.', {}) }
    : result;

const speciesEntry = (id, moles, concentration) => ({ id, moles, concentration });

export const solveStrongStrong = (input) => {
  const validation = validateStrongStrongInput(input);
  if (!validation.ok) return { error: validation.error };

  const { Ca, VaL, Cb, Vb, VbL, totalVolumeL, temperatureK } = validation.value;
  const acidMoles = Ca * VaL;
  const baseMoles = Cb * VbL;
  const rawDeltaMoles = acidMoles - baseMoles;
  const toleranceMol = Math.max(
    EQUIVALENCE_MOL_TOLERANCE,
    Math.max(acidMoles, baseMoles) * 1e-12,
  );
  const atEquivalence = Math.abs(rawDeltaMoles) <= toleranceMol;
  const excessMoles = atEquivalence ? 0 : Math.abs(rawDeltaMoles);
  const excessSpecies = atEquivalence ? null : rawDeltaMoles > 0 ? 'H⁺' : 'OH⁻';
  const excessConcentration = excessMoles / totalVolumeL;

  let hConcentration;
  let ohConcentration;
  if (atEquivalence) {
    hConcentration = Math.sqrt(STANDARD_KW);
    ohConcentration = Math.sqrt(STANDARD_KW);
  } else if (rawDeltaMoles > 0) {
    hConcentration = excessConcentration;
    ohConcentration = STANDARD_KW / hConcentration;
  } else {
    ohConcentration = excessConcentration;
    hConcentration = STANDARD_KW / ohConcentration;
  }

  if (!(hConcentration > 0) || !(ohConcentration > 0)) {
    return { error: createInputError('NON_POSITIVE_CONCENTRATION', 'Nồng độ H⁺/OH⁻ không hợp lệ.', {}) };
  }
  const pH = -Math.log10(hConcentration);
  const pOH = -Math.log10(ohConcentration);
  const equivalenceMl = (acidMoles / Cb) * 1000;
  const stage = classifyStage({ addedVolumeMl: Vb, equivalenceMl, acidMoles, baseMoles, toleranceMol });
  const milestones = calculateMilestones({ Ca, Va: VaL * 1000, Cb });
  if (milestones.error) return { error: milestones.error };

  const chlorideMoles = acidMoles;
  const sodiumMoles = baseMoles;
  const result = {
    model: 'strong-strong',
    modelVersion: MODEL_VERSION,
    temperatureK,
    kw: STANDARD_KW,
    pH,
    pOH,
    Veq: equivalenceMl,
    totalVolumeL,
    totalVolumeMl: totalVolumeL * 1000,
    moles: {
      hclInitial: acidMoles,
      naohAdded: baseMoles,
      neutralized: Math.min(acidMoles, baseMoles),
      residualH: rawDeltaMoles > toleranceMol ? rawDeltaMoles : 0,
      residualOH: rawDeltaMoles < -toleranceMol ? -rawDeltaMoles : 0,
    },
    excess: { species: excessSpecies, moles: excessMoles, concentration: excessConcentration },
    concentrations: {
      HPlus: hConcentration,
      OHMinus: ohConcentration,
      NaPlus: sodiumMoles / totalVolumeL,
      ClMinus: chlorideMoles / totalVolumeL,
    },
    species: [
      speciesEntry('H⁺', hConcentration * totalVolumeL, hConcentration),
      speciesEntry('OH⁻', ohConcentration * totalVolumeL, ohConcentration),
      speciesEntry('Na⁺', sodiumMoles, sodiumMoles / totalVolumeL),
      speciesEntry('Cl⁻', chlorideMoles, chlorideMoles / totalVolumeL),
    ],
    stage,
    dominantReaction: DOMINANT_REACTION,
    milestones,
    diagnostics: {
      solver: MODEL_VERSION,
      converged: true,
      residual: atEquivalence ? Math.abs(rawDeltaMoles) : 0,
      toleranceMol,
    },
  };

  return finiteResultOrError(result);
};

export { DOMINANT_REACTION, MODEL_VERSION };
