import { solveStrongStrong } from './strongStrong.js';
import { createInputError, isFiniteNumber } from './units.js';

const DEFAULT_STEP_ML = 0.5;

const range = (maxVolumeMl, stepMl) => {
  const values = [0];
  for (let volume = stepMl; volume < maxVolumeMl; volume += stepMl) values.push(volume);
  if (maxVolumeMl > 0 && values.at(-1) !== maxVolumeMl) values.push(maxVolumeMl);
  return values;
};

export const generateCurve = (input, options = {}) => {
  if (!input || typeof input !== 'object') {
    return { error: createInputError('INVALID_INPUT', 'Input phải là một object.', {}) };
  }
  const requestedVolumes = options.volumesMl;
  const maxVolumeMl =
    options.maxVolumeMl ??
    (Array.isArray(requestedVolumes) && requestedVolumes.length > 0
      ? Math.max(...requestedVolumes)
      : input.Vb);
  const stepMl = options.stepMl ?? DEFAULT_STEP_ML;
  if (!isFiniteNumber(maxVolumeMl) || maxVolumeMl < 0) {
    return { error: createInputError('INVALID_CURVE_RANGE', 'maxVolumeMl phải không âm và hữu hạn.', {}) };
  }
  if (!isFiniteNumber(stepMl) || stepMl <= 0) {
    return { error: createInputError('INVALID_CURVE_STEP', 'stepMl phải lớn hơn 0.', {}) };
  }
  const volumesMl = requestedVolumes ?? range(maxVolumeMl, stepMl);
  if (
    !Array.isArray(volumesMl) ||
    volumesMl.some((volume) => !isFiniteNumber(volume) || volume < 0 || volume > maxVolumeMl)
  ) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl chứa thể tích không hợp lệ.', {}) };
  }

  const points = [];
  for (const volumeMl of volumesMl) {
    const solved = solveStrongStrong({ ...input, Vb: volumeMl });
    if (solved.error) return solved;
    points.push({
      volumeMl,
      pH: solved.pH,
      pOH: solved.pOH,
      stage: solved.stage,
      excess: solved.excess,
      totalVolumeL: solved.totalVolumeL,
    });
  }
  const initial = solveStrongStrong({ ...input, Vb: 0 });
  if (initial.error) return initial;
  return {
    model: 'strong-strong',
    points,
    milestones: initial.milestones,
    diagnostics: { solver: 'curve-sampler-v1', timer: false, pointCount: points.length },
  };
};
