import { createInputError, isFiniteNumber, lToMl } from './units.js';

export const PHENOLPHTHALEIN_START_PH = 8.2;
export const EQUIVALENCE_RELATIVE_MOL_TOLERANCE = 1e-12;
export const NEAR_EQUIVALENCE_RELATIVE_VOLUME_TOLERANCE = 1e-3;

export const calculateEquivalenceMolTolerance = (acidMoles, baseMoles) => {
  if (![acidMoles, baseMoles].every(isFiniteNumber) || acidMoles < 0 || baseMoles < 0) {
    return null;
  }
  return Math.max(acidMoles, baseMoles) * EQUIVALENCE_RELATIVE_MOL_TOLERANCE;
};

export const calculateEquivalenceMl = (input = {}) => {
  const { Ca, Va, Cb } = input ?? {};
  if (![Ca, Va, Cb].every(isFiniteNumber) || Ca <= 0 || Va <= 0 || Cb <= 0) return null;
  return lToMl((Ca * Va) / Cb);
};

export const calculateEndpointMl = (input = {}) => {
  const { Ca, Va, Cb, endpointPh = PHENOLPHTHALEIN_START_PH } = input ?? {};
  const equivalenceMl = calculateEquivalenceMl({ Ca, Va, Cb });
  if (equivalenceMl === null || !isFiniteNumber(endpointPh) || endpointPh >= 14) return null;
  const targetOh = 10 ** (endpointPh - 14);
  if (Cb <= targetOh) return null;
  const numerator = Ca * Va + targetOh * Va;
  const denominator = Cb - targetOh;
  return (numerator / denominator) * 1000;
};

export const calculateMilestones = (input) => {
  const equivalenceMl = calculateEquivalenceMl(input);
  if (equivalenceMl === null) {
    return {
      error: createInputError('INVALID_MILESTONE_INPUT', 'Ca, Va và Cb phải hợp lệ.', {}),
    };
  }
  return {
    Veq: equivalenceMl,
    halfEqMl: equivalenceMl / 2,
    equivalenceMl,
    endpointMl: calculateEndpointMl(input),
    endpointPh: PHENOLPHTHALEIN_START_PH,
  };
};

export const classifyStage = ({
  addedVolumeMl,
  equivalenceMl,
  acidMoles,
  baseMoles,
  toleranceMol = calculateEquivalenceMolTolerance(acidMoles, baseMoles),
  nearToleranceMl = equivalenceMl * NEAR_EQUIVALENCE_RELATIVE_VOLUME_TOLERANCE,
}) => {
  if (
    ![addedVolumeMl, equivalenceMl, acidMoles, baseMoles, toleranceMol].every(isFiniteNumber)
  ) {
    return null;
  }
  const molDelta = acidMoles - baseMoles;
  if (Math.abs(molDelta) <= toleranceMol) return 'at-equivalence';
  if (Math.abs(addedVolumeMl - equivalenceMl) <= nearToleranceMl) return 'near-equivalence';
  return molDelta > 0 ? 'before-equivalence' : 'after-equivalence';
};
