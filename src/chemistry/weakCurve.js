import { createInputError, isFiniteNumber, lToMl, mlToL } from './units.js';
import { calculateMilestones } from './milestones.js';
import { solveWeakAcidStrongBase } from './weakAcidStrongBase.js';

const DEFAULT_STEP_ML = 0.5;

export const generateWeakAcidCurve = (input, options = {}) => {
  if (!input || typeof input !== 'object') return { error: createInputError('INVALID_INPUT', 'Input phải là một object.', {}) };
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return { error: createInputError('INVALID_CURVE_OPTIONS', 'Curve options phải là một object.', {}) };
  }
  const initial = solveWeakAcidStrongBase({ ...input, Vb: 0 });
  if (initial.error) return initial;
  const requested = options.volumesMl;
  if (requested !== undefined && (!Array.isArray(requested) || requested.length === 0)) {
    return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl phải là một mảng không rỗng.', {}) };
  }
  const maxVolumeMl = options.maxVolumeMl ?? Math.max(lToMl(input.Vb), initial.milestones.equivalenceMl * 2);
  const stepMl = options.stepMl ?? DEFAULT_STEP_ML;
  if (!isFiniteNumber(maxVolumeMl) || maxVolumeMl < 0) return { error: createInputError('INVALID_CURVE_RANGE', 'maxVolumeMl phải không âm và hữu hạn.', {}) };
  if (!isFiniteNumber(stepMl) || stepMl <= 0) return { error: createInputError('INVALID_CURVE_STEP', 'stepMl phải lớn hơn 0.', {}) };
  const milestones = calculateMilestones({ Ca: input.Ca, Va: input.Va, Cb: input.Cb });
  if (milestones.error) return milestones;
  const critical = [0, milestones.halfEqMl, milestones.equivalenceMl, milestones.endpointMl]
    .filter((volumeMl) => volumeMl <= maxVolumeMl);
  const volumes = requested ?? [];
  if (requested === undefined) {
    for (let volumeMl = 0; volumeMl <= maxVolumeMl; volumeMl += stepMl) volumes.push(Number(volumeMl.toPrecision(15)));
    if (volumes.at(-1) < maxVolumeMl) volumes.push(maxVolumeMl);
  }
  const allVolumes = [...volumes, ...critical]
    .filter((volumeMl) => isFiniteNumber(volumeMl) && volumeMl >= 0 && volumeMl <= maxVolumeMl)
    .sort((left, right) => left - right)
    .filter((volumeMl, index, list) => index === 0 || volumeMl - list[index - 1] > Math.max(maxVolumeMl * 1e-12, Number.MIN_VALUE));
  if (!allVolumes.length) return { error: createInputError('INVALID_CURVE_VOLUMES', 'volumesMl không chứa thể tích hợp lệ.', {}) };
  const points = [];
  for (const volumeMl of allVolumes) {
    const solved = solveWeakAcidStrongBase({ ...input, Vb: mlToL(volumeMl) });
    if (solved.error) return solved;
    points.push({ volumeMl, pH: solved.pH, pOH: solved.pOH, stage: solved.stage, excess: solved.excess, totalVolumeL: solved.totalVolumeL });
  }
  return { model: 'weak-acid-strong-base', points, milestones, diagnostics: { solver: 'weak-curve-sampler-v1', timer: false, pointCount: points.length } };
};
