import { solveStrongStrong } from './strongStrong.js';
import { createInputError, isFiniteNumber, lToMl, mlToL } from './units.js';

const DEFAULT_STEP_ML = 0.5;
export const CURVE_RELATIVE_VOLUME_TOLERANCE = 1e-12;

const normalizeVolumeMl = (volumeMl) =>
  Number(volumeMl.toPrecision(15));

const curveVolumeToleranceMl = (maxVolumeMl) =>
  Math.max(Math.abs(maxVolumeMl) * CURVE_RELATIVE_VOLUME_TOLERANCE, Number.MIN_VALUE);

const range = (maxVolumeMl, stepMl, toleranceMl) => {
  const values = [];
  const fullSteps = Math.floor(maxVolumeMl / stepMl);
  for (let index = 0; index <= fullSteps; index += 1) {
    const volumeMl = index * stepMl;
    if (volumeMl <= maxVolumeMl) values.push(volumeMl);
  }
  if (maxVolumeMl > 0 && maxVolumeMl - values.at(-1) > toleranceMl) {
    values.push(maxVolumeMl);
  }
  return values;
};

const sortAndDeduplicateVolumes = (volumesMl, criticalVolumesMl, toleranceMl) => {
  const canonical = volumesMl.map((volumeMl) => {
    const critical = criticalVolumesMl.find(
      (candidate) => Math.abs(candidate - volumeMl) <= toleranceMl,
    );
    return normalizeVolumeMl(critical ?? volumeMl);
  });
  canonical.sort((left, right) => left - right);
  return canonical.filter(
    (volumeMl, index) =>
      index === 0 || volumeMl - canonical[index - 1] > toleranceMl,
  );
};

export const generateCurve = (input, options = {}) => {
  if (!input || typeof input !== 'object') {
    return { error: createInputError('INVALID_INPUT', 'Input phải là một object.', {}) };
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return {
      error: createInputError('INVALID_CURVE_OPTIONS', 'Curve options phải là một object.', {}),
    };
  }
  const current = solveStrongStrong(input);
  if (current.error) return current;
  const initial = solveStrongStrong({ ...input, Vb: 0 });
  if (initial.error) return initial;
  const requestedVolumes = options.volumesMl;
  if (
    requestedVolumes !== undefined &&
    (!Array.isArray(requestedVolumes) || requestedVolumes.length === 0)
  ) {
    return {
      error: createInputError(
        'INVALID_CURVE_VOLUMES',
        'volumesMl phải là một mảng không rỗng.',
        {},
      ),
    };
  }
  const defaultMaxVolumeMl = Math.max(
    lToMl(input.Vb),
    initial.milestones.equivalenceMl * 2,
  );
  const maxVolumeMl =
    options.maxVolumeMl ??
    (requestedVolumes === undefined ? defaultMaxVolumeMl : Math.max(...requestedVolumes));
  const stepMl = options.stepMl ?? DEFAULT_STEP_ML;
  if (!isFiniteNumber(maxVolumeMl) || maxVolumeMl < 0) {
    return { error: createInputError('INVALID_CURVE_RANGE', 'maxVolumeMl phải không âm và hữu hạn.', {}) };
  }
  if (!isFiniteNumber(stepMl) || stepMl <= 0) {
    return { error: createInputError('INVALID_CURVE_STEP', 'stepMl phải lớn hơn 0.', {}) };
  }
  const volumeToleranceMl = curveVolumeToleranceMl(maxVolumeMl);
  const milestoneVolumesMl = [
    0,
    initial.milestones.equivalenceMl * 0.25,
    initial.milestones.halfEqMl,
    initial.milestones.equivalenceMl * 0.99,
    initial.milestones.equivalenceMl,
    initial.milestones.equivalenceMl * 1.01,
    initial.milestones.equivalenceMl * 2,
  ].filter((volumeMl) => volumeMl - maxVolumeMl <= volumeToleranceMl);
  const volumesMl = sortAndDeduplicateVolumes(
    [
      ...(requestedVolumes ?? range(maxVolumeMl, stepMl, volumeToleranceMl)),
      ...milestoneVolumesMl,
    ],
    milestoneVolumesMl,
    volumeToleranceMl,
  );
  if (
    !Array.isArray(volumesMl) ||
    volumesMl.some(
      (volume) =>
        !isFiniteNumber(volume) ||
        volume < 0 ||
        volume - maxVolumeMl > volumeToleranceMl,
    )
  ) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl chứa thể tích không hợp lệ.', {}) };
  }

  const points = [];
  for (const volumeMl of volumesMl) {
    const solved = solveStrongStrong({ ...input, Vb: mlToL(volumeMl) });
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
  return {
    model: 'strong-strong',
    points,
    milestones: initial.milestones,
    diagnostics: { solver: 'curve-sampler-v1', timer: false, pointCount: points.length },
  };
};
