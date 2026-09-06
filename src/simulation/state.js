import { isFiniteNumber, lToMl, mlToL } from '../chemistry/units.js';

export const DEFAULT_DROP_SIZE_ML = 0.05;
export const MIN_DROP_SIZE_ML = 0.05;
export const MAX_DROP_SIZE_ML = 0.1;
export const SIMULATION_SPEEDS = Object.freeze({ slow: 1200, normal: 700, fast: 280 });

const freezeState = (state) => Object.freeze({
  ...state,
  chemistryInput: Object.freeze({ ...state.chemistryInput }),
});

const invalid = (code, message) => ({ ok: false, error: { code, message } });

const validateChemistryInput = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return invalid('INVALID_CHEMISTRY_INPUT', 'chemistryInput phải là một object.');
  const { Ca, Va, Cb, Vb, temperature, Ka } = input;
  if (![Ca, Va, Cb, Vb, temperature].every(isFiniteNumber) || Ca <= 0 || Va <= 0 || Cb <= 0 || Vb < 0) {
    return invalid('INVALID_CHEMISTRY_INPUT', 'Nồng độ/thể tích chemistryInput không hợp lệ.');
  }
  if (Ka !== undefined && (!isFiniteNumber(Ka) || !(Ka > 0 && Ka < 1))) return invalid('INVALID_CHEMISTRY_INPUT', 'Ka không hợp lệ.');
  return { ok: true };
};

const validateDropSize = (dropSizeMl) => {
  if (!isFiniteNumber(dropSizeMl) || dropSizeMl < MIN_DROP_SIZE_ML || dropSizeMl > MAX_DROP_SIZE_ML) return invalid('INVALID_DROP_SIZE', `dropSizeMl phải nằm trong khoảng ${MIN_DROP_SIZE_ML}–${MAX_DROP_SIZE_ML} mL.`);
  return { ok: true };
};

export const createSimulationState = (chemistryInput, options = {}) => {
  const inputValidation = validateChemistryInput(chemistryInput);
  if (!inputValidation.ok) return inputValidation;
  const dropSizeMl = options.dropSizeMl ?? DEFAULT_DROP_SIZE_ML;
  const dropValidation = validateDropSize(dropSizeMl);
  if (!dropValidation.ok) return dropValidation;
  const initialAddedVolumeMl = lToMl(chemistryInput.Vb);
  return {
    ok: true,
    state: freezeState({ screen: 'ready', status: 'ready', speed: 'normal', chemistryInput, initialAddedVolumeMl, addedVolumeMl: initialAddedVolumeMl, dropSizeMl, dropCount: 0, result: null }),
  };
};

export const addDrop = (state, dropSizeMl = state?.dropSizeMl) => {
  if (!state || typeof state !== 'object' || !state.chemistryInput) return invalid('INVALID_SIMULATION_STATE', 'Simulation state không hợp lệ.');
  const dropValidation = validateDropSize(dropSizeMl);
  if (!dropValidation.ok) return dropValidation;
  if (!isFiniteNumber(state.addedVolumeMl) || state.addedVolumeMl < 0) return invalid('INVALID_SIMULATION_STATE', 'addedVolumeMl không hợp lệ.');
  const addedVolumeMl = state.addedVolumeMl + dropSizeMl;
  return {
    ok: true,
    state: freezeState({ ...state, chemistryInput: { ...state.chemistryInput, Vb: mlToL(addedVolumeMl) }, addedVolumeMl, dropCount: state.dropCount + 1, screen: 'ready', status: 'ready', result: null }),
  };
};

export const resetSimulation = (state) => {
  if (!state || typeof state !== 'object' || !state.chemistryInput) return invalid('INVALID_SIMULATION_STATE', 'Simulation state không hợp lệ.');
  return {
    ok: true,
    state: freezeState({ ...state, chemistryInput: { ...state.chemistryInput, Vb: mlToL(state.initialAddedVolumeMl) }, addedVolumeMl: state.initialAddedVolumeMl, dropCount: 0, screen: 'ready', status: 'ready', result: null }),
  };
};

export const baselineState = Object.freeze({ screen: 'idle', addedVolumeMl: null, hasSimulationData: false });

export const withSimulationResult = (state, result) => {
  if (!state || !state.chemistryInput) return invalid('INVALID_SIMULATION_STATE', 'Simulation state không hợp lệ.');
  return { ok: true, state: freezeState({ ...state, result: result ?? null }) };
};

export const setSimulationStatus = (state, status) => {
  if (!state || !state.chemistryInput || !['ready', 'running', 'paused'].includes(status)) return invalid('INVALID_SIMULATION_STATE', 'Trạng thái mô phỏng không hợp lệ.');
  return { ok: true, state: freezeState({ ...state, status, screen: status }) };
};

export const setSimulationSpeed = (state, speed) => {
  if (!state || !state.chemistryInput || !(speed in SIMULATION_SPEEDS)) return invalid('INVALID_SIMULATION_SPEED', 'Tốc độ mô phỏng không hợp lệ.');
  return { ok: true, state: freezeState({ ...state, speed }) };
};

