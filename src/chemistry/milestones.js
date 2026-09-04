import { createInputError, isFiniteNumber, mlToL } from './units.js';

export const PHENOLPHTHALEIN_START_PH = 8.2;
export const EQUIVALENCE_MOL_TOLERANCE = 1e-12;

export const calculateEquivalenceMl = (input = {}) => {
  const { Ca, Va, Cb } = input ?? {};
  if (![Ca, Va, Cb].every(isFiniteNumber) || Ca <= 0 || Va <= 0 || Cb <= 0) return null;
  return (Ca * mlToL(Va) * 1000) / Cb;
};

export const calculateEndpointMl = (input = {}) => {
  const { Ca, Va, Cb, endpointPh = PHENOLPHTHALEIN_START_PH } = input ?? {};
  const equivalenceMl = calculateEquivalenceMl({ Ca, Va, Cb });
  if (equivalenceMl === null || !isFiniteNumber(endpointPh) || endpointPh >= 14) return null;
  const targetOh = 10 ** (endpointPh - 14);
  if (Cb <= targetOh) return null;
  const numerator = Ca * mlToL(Va) + targetOh * mlToL(Va);
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
  toleranceMol = EQUIVALENCE_MOL_TOLERANCE,
  nearToleranceMl = Math.max(0.01, equivalenceMl * 0.001),
}) => {
  if (![addedVolumeMl, equivalenceMl, acidMoles, baseMoles].every(isFiniteNumber)) return null;
  const molDelta = acidMoles - baseMoles;
  if (Math.abs(molDelta) <= toleranceMol) return 'at-equivalence';
  if (Math.abs(addedVolumeMl - equivalenceMl) <= nearToleranceMl) return 'near-equivalence';
  return molDelta > 0 ? 'before-equivalence' : 'after-equivalence';
};
