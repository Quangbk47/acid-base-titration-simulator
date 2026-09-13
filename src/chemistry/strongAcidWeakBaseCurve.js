import { createInputError, isFiniteNumber, mlToL } from './units.js';
import { solveStrongAcidWeakBase } from './strongAcidWeakBase.js';

const DEFAULT_STEP_ML = 0.5;

export const generateStrongAcidWeakBaseCurve = (input, options = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: createInputError('INVALID_INPUT', 'Input must be an object.', {}) };
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return { error: createInputError('INVALID_CURVE_OPTIONS', 'Curve options must be an object.', {}) };
  }
  const initial = solveStrongAcidWeakBase({ ...input, Va: 0 });
  if (initial.error) return initial;
  const requested = options.volumesMl;
  if (requested !== undefined && (!Array.isArray(requested) || requested.length === 0)) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl must be a non-empty array.', {}) };
  }
  if (requested?.some((volume) => !isFiniteNumber(volume) || volume < 0)) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl contains an invalid volume.', {}) };
  }
  const maxVolumeMl = options.maxVolumeMl ?? Math.max(input.Va * 1000, initial.Veq * 2);
  const stepMl = options.stepMl ?? DEFAULT_STEP_ML;
  if (!isFiniteNumber(maxVolumeMl) || maxVolumeMl < 0 || !isFiniteNumber(stepMl) || stepMl <= 0) {
    return { error: createInputError('INVALID_CURVE_RANGE', 'Curve range and step must be finite and positive.', {}) };
  }
  if (requested?.some((volume) => volume > maxVolumeMl)) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'A requested volume exceeds maxVolumeMl.', {}) };
  }

  const volumes = requested ? [...requested] : [];
  if (!requested) {
    for (let volume = 0; volume <= maxVolumeMl; volume += stepMl) {
      volumes.push(Number(volume.toPrecision(15)));
    }
    if (volumes.at(-1) < maxVolumeMl) volumes.push(maxVolumeMl);
  }
  volumes.push(0, initial.Veq / 2, initial.Veq);
  const tolerance = Math.max(maxVolumeMl * 1e-12, Number.MIN_VALUE);
  const uniqueVolumes = volumes
    .filter((volume) => volume <= maxVolumeMl)
    .sort((left, right) => left - right)
    .filter((volume, index, list) => index === 0 || volume - list[index - 1] > tolerance);
  const points = [];
  for (const volumeMl of uniqueVolumes) {
    const result = solveStrongAcidWeakBase({ ...input, Va: mlToL(volumeMl) });
    if (result.error) return result;
    points.push({ volumeMl, pH: result.pH, pOH: result.pOH, stage: result.stage, excess: result.excess });
  }
  return {
    model: 'strong-acid-weak-base',
    points,
    milestones: initial.milestones,
    diagnostics: { solver: 'strong-acid-weak-base-curve-v1', timer: false, pointCount: points.length },
  };
};
