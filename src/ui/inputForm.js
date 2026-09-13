import { solveStrongStrong } from '../chemistry/index.js';
import { standardCases } from '../data/standardCases.js';
import { TITRATION_SYSTEMS, toChemistryInput, validateTitrationForm } from './validation.js';
import { addDrop, createSimulationState, resetSimulation, setSimulationSpeed, setSimulationStatus, withSimulationResult } from '../simulation/state.js';
import { createSimulationRunner } from '../simulation/runner.js';
import { renderExperimentView } from './experimentView.js';
import { renderChartView } from './chartView.js';
import { renderIndicatorView } from './indicatorView.js';

const FIELD_IDS = Object.freeze({ systemType: 'system-type', analyteConcentrationM: 'analyte-concentration', analyteVolumeMl: 'analyte-volume', titrantConcentrationM: 'titrant-concentration', addedVolumeMl: 'added-volume' });
const valuesFromForm = (form) => Object.fromEntries(new FormData(form).entries());
const setText = (root, selector, value) => { const element = root.querySelector(selector); if (element) element.textContent = value; };
const clearErrors = (form) => { for (const output of form.querySelectorAll('[data-error-for]')) output.textContent = ''; for (const control of form.elements) control.removeAttribute?.('aria-invalid'); };
const showErrors = (form, errors) => { clearErrors(form); for (const [field, message] of Object.entries(errors)) { form.querySelector(`#${FIELD_IDS[field] ?? field}`)?.setAttribute('aria-invalid', 'true'); const output = form.querySelector(`[data-error-for="${field}"]`); if (output) output.textContent = message; } };

export function evaluateTitration(values, solve = solveStrongStrong) {
  const validation = validateTitrationForm(values);
  if (!validation.ok) return validation;
  const chemistryInput = toChemistryInput(validation.value);
  const result = solve(chemistryInput);
  if (result.error) return { ok: false, solverError: result.error };
  return { ok: true, chemistryInput, result };
}

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
  const syncControlAvailability = () => {
    const hasSimulation = simulationState !== null;
    const isRunning = simulationState?.status === 'running';
    if (addDropButton) addDropButton.disabled = !hasSimulation || isRunning;
    if (runButton) runButton.disabled = !hasSimulation || isRunning;
    if (pauseButton) pauseButton.disabled = !hasSimulation || !isRunning;
    if (resetButton) resetButton.disabled = !hasSimulation;
  };
  const setStateLabel = (value) => {
    if (stateBadge) stateBadge.textContent = value;
    const vessel = root.querySelector('.vessel-stage');
    if (vessel) vessel.dataset.state = value.toLowerCase();
    const vesselStatus = root.querySelector('[data-vessel-status]');
    if (vesselStatus) vesselStatus.textContent = value === 'Running' ? 'Đang nhỏ giọt tự động' : value === 'Paused' ? 'Đã tạm dừng' : value === 'Ready' ? 'Sẵn sàng mô phỏng' : 'Chưa có mô phỏng';
    syncControlAvailability();
  };
  const clearRenderedResult = () => {
    setText(root, '[data-result="ph"]', '—');
    setText(root, '[data-result="ph-label"]', 'Chưa tính');
    setText(root, '[data-result="volume"]', '—');
    setText(root, '[data-result="excess"]', '—');
    setText(root, '[data-result="stage"]', '—');
    setText(root, '[data-result="reaction"]', 'Chưa tính');
    setText(root, '[data-result="added-volume"]', '0.00 mL');
    const chemistryRows = root.querySelector('[data-chemistry-rows]');
    if (chemistryRows) chemistryRows.innerHTML = '<tr><td>HCl / NaOH</td><td>—</td><td>—</td><td data-result="reaction">Chưa tính</td></tr>';
    const curveRows = root.querySelector('[data-curve-rows]');
    if (curveRows) curveRows.innerHTML = '<tr><td colspan="3">Chưa có dữ liệu mô phỏng.</td></tr>';
    const chart = root.querySelector('[data-chart]');
    if (chart) {
      chart.innerHTML = '';
      chart.removeAttribute('viewBox');
    }
    const chartEmpty = root.querySelector('[data-chart-empty]');
    if (chartEmpty) chartEmpty.hidden = false;
    setText(root, '[data-indicator-state]', 'Chưa có dữ liệu');
  };
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
      if (!simulationState) {
        setStateLabel('Idle');
        return;
      }
      const next = setSimulationStatus(simulationState, status);
      if (next.ok) simulationState = next.state;
      setStateLabel(status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Ready');
    },
  });
  const syncSystem = () => { const system = TITRATION_SYSTEMS[systemSelector.value]; form.querySelector('#analyte').value = system?.analyte ?? ''; form.querySelector('#titrant').value = system?.titrant ?? ''; };
  const loadCase = () => {
    if (simulationState) runner.reset();
    simulationState = null;
    const selected = standardCases.find(({ id }) => id === caseSelector.value) ?? standardCases[0];
    systemSelector.value = 'strong-acid-strong-base';
    syncSystem();
    form.elements.analyteConcentrationM.value = selected.CaM;
    form.elements.analyteVolumeMl.value = selected.VaMl;
    form.elements.titrantConcentrationM.value = selected.CbM;
    form.elements.addedVolumeMl.value = selected.VbMl;
    clearErrors(form);
    clearRenderedResult();
    setStateLabel('Idle');
  };
  for (const item of standardCases) caseSelector.add(new Option(item.label, item.id));
  loadCase();
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
  runButton?.addEventListener('click', () => { if (simulationState && simulationState.status !== 'running') runner.start(); });
  pauseButton?.addEventListener('click', () => { if (simulationState?.status === 'running') runner.pause(); });
  speedSelector?.addEventListener('change', () => { runner.setSpeed(speedSelector.value); if (simulationState) { const next = setSimulationSpeed(simulationState, speedSelector.value); if (next.ok) simulationState = next.state; } });
  resetButton?.addEventListener('click', () => { if (!simulationState) return; runner.reset(); const reset = resetSimulation(simulationState); if (reset.ok) { simulationState = reset.state; evaluateCurrent(); setStateLabel('Ready'); } });
  syncControlAvailability();
  return { loadCase, getState: () => simulationState, dispose: () => runner.dispose() };
}
