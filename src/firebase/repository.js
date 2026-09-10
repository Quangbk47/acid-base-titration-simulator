const MAX_SAVED_EXPERIMENTS = 50;
const MODEL_VERSION_PATTERN = /^[a-z0-9-]+$/;

const ensureObject = (value, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name}_MUST_BE_OBJECT`);
};

export const validateSavedExperiment = (snapshot) => {
  ensureObject(snapshot, 'EXPERIMENT');
  for (const field of ['input', 'modelVersion', 'currentAddedVolumeMl', 'currentStage', 'summary']) {
    if (!(field in snapshot)) throw new Error(`MISSING_${field.toUpperCase()}`);
  }
  ensureObject(snapshot.input, 'INPUT');
  ensureObject(snapshot.summary, 'SUMMARY');
  if (typeof snapshot.modelVersion !== 'string' || !MODEL_VERSION_PATTERN.test(snapshot.modelVersion)) throw new Error('INVALID_MODEL_VERSION');
  if (!Number.isFinite(snapshot.currentAddedVolumeMl) || snapshot.currentAddedVolumeMl < 0) throw new Error('INVALID_VOLUME');
  if (typeof snapshot.currentStage !== 'string' || !snapshot.currentStage) throw new Error('INVALID_STAGE');
  return true;
};

export const createExperimentRepository = ({ list, create, update, remove } = {}) => Object.freeze({
  maxSavedExperiments: MAX_SAVED_EXPERIMENTS,
  async list(userId) {
    if (typeof list !== 'function') throw new Error('REPOSITORY_NOT_CONFIGURED');
    return list(userId);
  },
  async create(userId, snapshot) {
    if (typeof create !== 'function') throw new Error('REPOSITORY_NOT_CONFIGURED');
    validateSavedExperiment(snapshot);
    return create(userId, snapshot);
  },
  async update(userId, experimentId, snapshot) {
    if (typeof update !== 'function') throw new Error('REPOSITORY_NOT_CONFIGURED');
    validateSavedExperiment(snapshot);
    return update(userId, experimentId, snapshot);
  },
  async remove(userId, experimentId) {
    if (typeof remove !== 'function') throw new Error('REPOSITORY_NOT_CONFIGURED');
    return remove(userId, experimentId);
  },
});
