import { solveStrongStrong } from '../chemistry/index.js';
import { standardCases } from '../data/standardCases.js';
import { TITRATION_SYSTEMS, toChemistryInput, validateTitrationForm } from './validation.js';
import { addDrop, createSimulationState, resetSimulation, setSimulationSpeed, setSimulationStatus, withSimulationResult } from '../simulation/state.js';
import { createSimulationRunner } from '../simulation/runner.js';
import { renderExperimentView } from './experimentView.js';
import { renderChartView } from './chartView.js';
import { renderIndicatorView } from './indicatorView.js';

export const FIELD_IDS = Object.freeze({ systemType: 'system-type', analyteConcentrationM: 'analyte-concentration', analyteVolumeMl: 'analyte-volume', titrantConcentrationM: 'titrant-concentration', addedVolumeMl: 'added-volume', Ka: 'ka' });
export const fieldIdFor = (field) => FIELD_IDS[field] ?? field;
const valuesFromForm = (form) => Object.fromEntries(new FormData(form).entries());
const setText = (root, selector, value) => { const element = root.querySelector(selector); if (element) element.textContent = value; };
const clearErrors = (form) => { for (const output of form.querySelectorAll('[data-error-for]')) output.textContent = ''; for (const control of form.elements) control.removeAttribute?.('aria-invalid'); };
const showErrors = (form, errors) => { clearErrors(form); for (const [field, message] of Object.entries(errors)) { form.querySelector(`#${fieldIdFor(field)}`)?.setAttribute('aria-invalid', 'true'); const output = form.querySelector(`[data-error-for="${field}"]`); if (output) output.textContent = message; } };

export function evaluateTitration(values, solve = solveStrongStrong) {
  const validation = validateTitrationForm(values);
  if (!validation.ok) return validation;
  const chemistryInput = toChemistryInput(validation.value);
  const result = solve(chemistryInput);
  if (result.error) return { ok: false, solverError: result.error };
  return { ok: true, chemistryInput, result };
}

export function solveChemistryInput(chemistryInput, strongSolver = solveStrongStrong) {
  return chemistryInput?.Ka !== undefined
    ? solveWeakAcidStrongBase(chemistryInput)
    : strongSolver(chemistryInput);
}

export const simulationControlState = ({ hasSimulation = false, state = 'Idle' } = {}) => {
  const canSimulate = hasSimulation && ['Ready', 'Running', 'Paused'].includes(state);
  return {
    submitDisabled: state === 'Validating' || state === 'Running',
    addDropDisabled: !canSimulate || state === 'Running',
    runDisabled: !canSimulate || state === 'Running',
    pauseDisabled: !canSimulate || state !== 'Running',
    resetDisabled: !hasSimulation || state === 'Validating',
  };
};

export function initInputForm({ form, root = document, solve = solveStrongStrong } = {}) {
  if (!form) return null;
  const caseSelector = form.querySelector('#case-selector');
  const systemSelector = form.querySelector('#system-type');
  const addDropButton = form.querySelector('#add-drop');
  const resetButton = form.querySelector('#reset-simulation');
  const runButton = form.querySelector('#run-simulation');
  const pauseButton = form.querySelector('#pause-simulation');
  const speedSelector = form.querySelector('#simulation-speed');
  const stateBadge = root.querySelector('[data-simulation-state]');
  let simulationState = null;
  const applyControlState = (value) => {
    const controls = simulationControlState({ hasSimulation: Boolean(simulationState), state: value });
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = controls.submitDisabled;
    if (addDropButton) addDropButton.disabled = controls.addDropDisabled;
    if (runButton) runButton.disabled = controls.runDisabled;
    if (pauseButton) pauseButton.disabled = controls.pauseDisabled;
    if (resetButton) resetButton.disabled = controls.resetDisabled;
  };
  const setStateLabel = (value) => { if (stateBadge) stateBadge.textContent = value; const vessel = root.querySelector('.vessel-stage'); if (vessel) vessel.dataset.state = value.toLowerCase(); const vesselStatus = root.querySelector('[data-vessel-status]'); if (vesselStatus) vesselStatus.textContent = value === 'Running' ? 'Đang nhỏ giọt tự động' : value === 'Paused' ? 'Đã tạm dừng' : value === 'Ready' ? 'Sẵn sàng mô phỏng' : 'Chưa có mô phỏng'; applyControlState(value); };
  const render = (result = simulationState?.result) => {
    if (!simulationState || !result) return;
    renderExperimentView(root, result, simulationState);
    renderIndicatorView(root, result, { transient: simulationState.dropCount > 0 && result.stage === 'before-equivalence' });
    renderChartView(root, simulationState.chemistryInput, simulationState.addedVolumeMl);
    if (form.elements.addedVolumeMl) form.elements.addedVolumeMl.value = simulationState.addedVolumeMl.toFixed(2);
  };
  const evaluateCurrent = () => {
    const result = solve(simulationState.chemistryInput);
    if (result.error) return result;
    simulationState = withSimulationResult(simulationState, result).state;
    render(result);
    return result;
  };
  const step = () => {
    const next = addDrop(simulationState);
    if (!next.ok) return false;
    simulationState = next.state;
    const result = evaluateCurrent();
    if (result.error || simulationState.addedVolumeMl > 2 * result.Veq) return false;
    return true;
  };
  const runner = createSimulationRunner({
    onStep: step,
    onStateChange: (status) => {
      const next = setSimulationStatus(simulationState, status);
      if (next.ok) simulationState = next.state;
      setStateLabel(status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Ready');
    },
  });
  const syncSystem = () => {
    const system = TITRATION_SYSTEMS[systemSelector.value];
    form.querySelector('#analyte').value = system?.analyte ?? '';
    form.querySelector('#titrant').value = system?.titrant ?? '';
    for (const element of root.querySelectorAll('[data-analyte-label]')) element.textContent = system?.analyte ?? '';
    const description = systemSelector.value === 'weak-acid-strong-base'
      ? 'CH₃COOH–NaOH ở 25 °C · thể tích nhập bằng mL, chemistry engine dùng L/K.'
      : 'HCl–NaOH ở 25 °C · thể tích nhập bằng mL, chemistry engine dùng L/K.';
    for (const element of root.querySelectorAll('[data-system-description]')) element.textContent = description;
    const ka = form.querySelector('[data-ka-field]');
    if (ka) ka.hidden = systemSelector.value !== 'weak-acid-strong-base';
  };
  const loadCase = () => { const selected = standardCases.find(({ id }) => id === caseSelector.value) ?? standardCases[0]; systemSelector.value = selected.systemType ?? 'strong-acid-strong-base'; syncSystem(); form.elements.analyteConcentrationM.value = selected.CaM; form.elements.analyteVolumeMl.value = selected.VaMl; form.elements.titrantConcentrationM.value = selected.CbM; form.elements.addedVolumeMl.value = selected.VbMl; if (form.elements.Ka) form.elements.Ka.value = selected.Ka ?? ''; clearErrors(form); };
  for (const item of standardCases) caseSelector.add(new Option(item.label, item.id));
  loadCase(); setStateLabel('Idle');
  caseSelector.addEventListener('change', loadCase); systemSelector.addEventListener('change', syncSystem);
  form.addEventListener('submit', (event) => {
    event.preventDefault(); setStateLabel('Validating'); setText(form, '[data-form-error]', '');
    const evaluation = evaluateTitration(valuesFromForm(form), solve);
    if (!evaluation.ok) { if (evaluation.errors) showErrors(form, evaluation.errors); else setText(form, '[data-form-error]', evaluation.solverError.message); setStateLabel(evaluation.errors ? 'Input error' : 'Solver error'); return; }
    clearErrors(form); const created = createSimulationState(evaluation.chemistryInput);
    if (!created.ok) { setText(form, '[data-form-error]', created.error.message); setStateLabel('Solver error'); return; }
    simulationState = withSimulationResult(created.state, evaluation.result).state; render(evaluation.result); setStateLabel('Ready');
  });
  addDropButton?.addEventListener('click', () => { if (!simulationState) { setText(form, '[data-form-error]', 'Hãy tính trạng thái ban đầu trước khi thêm giọt.'); setStateLabel('Input error'); return; } if (step()) setStateLabel('Ready'); });
  runButton?.addEventListener('click', () => { if (simulationState) runner.start(); });
  pauseButton?.addEventListener('click', () => runner.pause());
  speedSelector?.addEventListener('change', () => { runner.setSpeed(speedSelector.value); if (simulationState) { const next = setSimulationSpeed(simulationState, speedSelector.value); if (next.ok) simulationState = next.state; } });
  resetButton?.addEventListener('click', () => { if (!simulationState) return; runner.reset(); const reset = resetSimulation(simulationState); if (reset.ok) { simulationState = reset.state; evaluateCurrent(); setStateLabel('Ready'); } });
  return { loadCase, getState: () => simulationState, dispose: () => runner.dispose() };
}
