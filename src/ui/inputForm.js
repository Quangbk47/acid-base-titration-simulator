import { solveStrongStrong } from '../chemistry/index.js';
import { solvePair } from '../chemistry/pairSolver.js';
import { titrationPairs, pairForValues } from '../data/titrationPairs.js';
import { chemicalById } from '../data/chemicals.js';
import { evaluateGuidedAnswer } from '../data/guidedPrompts.js';
import { standardCases } from '../data/standardCases.js';
import { TITRATION_SYSTEMS, toChemistryInput, validateTitrationForm } from './validation.js';
import { addDrop, createSimulationState, resetSimulation, setSimulationSpeed, setSimulationStatus, withSimulationResult } from '../simulation/state.js';
import { createSimulationRunner } from '../simulation/runner.js';
import { renderExperimentView } from './experimentView.js';
import { renderChartView } from './chartView.js';
import { renderIndicatorView } from './indicatorView.js';
import { calculateTheory, renderTheoryView } from './theoryView.js';

const FIELD_IDS = Object.freeze({ systemType: 'system-type', pairId: 'chemical-pair', analyteConcentrationM: 'analyte-concentration', analyteVolumeMl: 'analyte-volume', titrantConcentrationM: 'titrant-concentration', addedVolumeMl: 'added-volume', buretVolumeMl: 'buret-volume' });
const UI_DROP_SIZE_ML = 0.1;
const valuesFromForm = (form) => ({ ...Object.fromEntries(new FormData(form).entries()), Ka: chemicalById('acetic').Ka, Kb: chemicalById('ammonia').Kb });
const setText = (root, selector, value) => { const element = root.querySelector(selector); if (element) element.textContent = value; };
const clearErrors = (form) => { for (const output of form.querySelectorAll('[data-error-for]')) output.textContent = ''; for (const control of form.elements) control.removeAttribute?.('aria-invalid'); };
const showErrors = (form, errors) => { clearErrors(form); for (const [field, message] of Object.entries(errors)) { form.querySelector(`#${FIELD_IDS[field] ?? field}`)?.setAttribute('aria-invalid', 'true'); const output = form.querySelector(`[data-error-for="${field}"]`); if (output) output.textContent = message; } };

export function evaluateTitration(values, solve = solveStrongStrong) {
  const validation = validateTitrationForm(values);
  if (!validation.ok) return validation;
  const chemistryInput = toChemistryInput(validation.value);
  const selectedSolver = solve !== solveStrongStrong ? solve : solvePair;
  const result = selectedSolver(chemistryInput);
  if (result.error) return { ok: false, solverError: result.error };
  return { ok: true, chemistryInput, result, buretVolumeMl: validation.value.buretVolumeMl };
}

export function initInputForm({ form, root = document, solve = solveStrongStrong, onStateChange = () => {} } = {}) {
  if (!form) return null;
  const caseSelector = form.querySelector('#case-selector');
  const systemSelector = form.querySelector('#system-type');
  const pairSelector = form.querySelector('#chemical-pair');
  let lastTheory = null;
  let theoryChartVisible = false;
  const showTheory = (theory) => { lastTheory = theory?.ok ? theory : null; if (!lastTheory) theoryChartVisible = false; renderTheoryView(root, theory); };
  const redrawChart = () => { if (simulationState?.result) renderChartView(root, simulationState.chemistryInput, simulationState.addedVolumeMl, simulationState.result, simulationState.dropCount, chartHistory); else if (lastTheory && theoryChartVisible) renderChartView(root, lastTheory.input, 0, null, 0, [], true); };
  const addDropButton = form.querySelector('#add-drop');
  const resetButton = form.querySelector('#reset-simulation');
  const runButton = form.querySelector('#run-simulation');
  const pauseButton = form.querySelector('#pause-simulation');
  const speedSelector = form.querySelector('#simulation-speed');
  const chartStyle = root.querySelector('#chart-style');
  const stateBadge = root.querySelector('[data-simulation-state]');
  let simulationState = null;
  let chartHistory = [];
  const syncControlAvailability = () => {
    const hasSimulation = simulationState !== null;
    const isRunning = simulationState?.status === 'running';
    const hasDrop = hasSimulation && addDrop(simulationState, UI_DROP_SIZE_ML).ok;
    if (addDropButton) addDropButton.disabled = !hasDrop || isRunning;
    if (runButton) runButton.disabled = !hasDrop || isRunning || simulationState.addedVolumeMl >= 2 * (simulationState.result?.Veq ?? Infinity);
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
    if (value === 'Paused') renderIndicatorView(root, simulationState?.result);
    onStateChange(simulationState);
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
    renderIndicatorView(root, null);
    setText(root, '[data-guided-prompt]', 'Bắt đầu mô phỏng để nhận câu hỏi.');
    setText(root, '[data-guided-feedback]', 'Hãy tính trạng thái trước khi kiểm tra dự đoán.');
  };
  const render = (result = simulationState?.result) => {
    if (!simulationState || !result) return;
    renderExperimentView(root, result, simulationState);
    setText(root, '[data-guided-prompt]', 'Dự đoán pH, màu phenolphthalein và chất dư tại V = ' + simulationState.addedVolumeMl.toFixed(2) + ' mL. Đối chiếu với trạng thái cân bằng hiện tại.');
    setText(root, '[data-guided-feedback]', 'Nhập dự đoán rồi kiểm tra với trạng thái hiện tại.');
    const buretVolume = root.querySelector('[data-buret-volume]');
    if (buretVolume) buretVolume.textContent = `${Math.max(0, simulationState.initialBuretVolumeMl - simulationState.dropCount * UI_DROP_SIZE_ML).toFixed(2).replace('.', ',')} mL`;
    renderIndicatorView(root, result, {
      transient: simulationState.dropCount > 0 && result.stage === 'before-equivalence',
      transientDelayMs: 1000 + Math.random() * 1000,
      transientStrength: 0.22 + Math.min(0.34, simulationState.dropCount * 0.035),
    });
    const latest = chartHistory[chartHistory.length - 1];
    if (!latest || latest.dropCount !== simulationState.dropCount) chartHistory.push({ dropCount: simulationState.dropCount, volumeMl: simulationState.addedVolumeMl, pH: result.pH, stage: result.stage });
    renderChartView(root, simulationState.chemistryInput, simulationState.addedVolumeMl, result, simulationState.dropCount, chartHistory);
    if (form.elements.addedVolumeMl) form.elements.addedVolumeMl.value = simulationState.addedVolumeMl.toFixed(2);
    if (form.elements.buretVolumeMl) form.elements.buretVolumeMl.value = Math.max(0, simulationState.initialBuretVolumeMl - simulationState.dropCount * UI_DROP_SIZE_ML).toFixed(2);
    onStateChange(simulationState);
  };
  const evaluateCurrent = () => {
    const result = (solve === solveStrongStrong ? solvePair : solve)(simulationState.chemistryInput);
    if (result.error) return result;
    simulationState = withSimulationResult(simulationState, result).state;
    render(result);
    return result;
  };
  const step = () => {
    const next = addDrop(simulationState, UI_DROP_SIZE_ML);
    if (!next.ok) return false;
    simulationState = next.state;
    const result = evaluateCurrent();
    if (result.error) return false;
    return true;
  };
  const runner = createSimulationRunner({
    onStep: () => step() && addDrop(simulationState, UI_DROP_SIZE_ML).ok && simulationState.addedVolumeMl < 2 * simulationState.result.Veq,
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
  const syncSystem = () => {
    if (pairSelector && !titrationPairs.some((p) => p.id === pairSelector.value && p.systemType === systemSelector.value)) { pairSelector.replaceChildren(...titrationPairs.filter((p) => p.systemType === systemSelector.value).map((p) => new Option(p.analyte + ' – ' + p.titrant, p.id))); }
    const system = pairForValues(valuesFromForm(form)) ?? TITRATION_SYSTEMS[systemSelector.value];
    form.querySelector('#analyte').value = system?.analyte ?? ''; form.querySelector('#titrant').value = system?.titrant ?? '';
    for (const label of root.querySelectorAll('[data-analyte-label]')) label.textContent = system?.analyte ?? '';
    for (const label of root.querySelectorAll('[data-titrant-label]')) label.textContent = system?.titrant ?? '';
    root.querySelector('[data-vessel-3d]')?.setAttribute('aria-label', `Buret chứa ${system?.titrant ?? ''} phía trên bình tam giác, mô hình tương tác 3D`);
  };
  const loadCase = () => {
    theoryChartVisible = false;
    if (simulationState) runner.reset();
    simulationState = null;
    chartHistory = [];
    const selected = standardCases.find(({ id }) => id === caseSelector.value) ?? standardCases[0];
    systemSelector.value = 'strong-acid-strong-base';
    if (pairSelector) pairSelector.replaceChildren();
    syncSystem();
    form.elements.analyteConcentrationM.value = selected.CaM;
    form.elements.analyteVolumeMl.value = selected.VaMl;
    form.elements.titrantConcentrationM.value = selected.CbM;
    form.elements.buretVolumeMl.value = '50';
    form.elements.addedVolumeMl.value = String(selected.VbMl);
    clearErrors(form);
    clearRenderedResult();
    showTheory(calculateTheory(valuesFromForm(form)));
    setStateLabel('Idle');
  };
  for (const item of standardCases) caseSelector.add(new Option(item.label, item.id));
  loadCase();
  caseSelector.addEventListener('change', loadCase); systemSelector.addEventListener('change', syncSystem);
  const invalidateInput = (event) => {
    if (!Object.values(FIELD_IDS).includes(event.target.id)) return;
    runner.dispose(); simulationState = null; chartHistory = [];
    form.elements.addedVolumeMl.value = '0';
    clearRenderedResult(); showTheory(null); setStateLabel('Idle');
  };
  form.addEventListener('input', invalidateInput);
  systemSelector.addEventListener('change', invalidateInput);
  pairSelector?.addEventListener('change', (event) => { syncSystem(); invalidateInput(event); });
  form.querySelector('#predict-equivalence')?.addEventListener('click', () => { const theory = calculateTheory(valuesFromForm(form)); showTheory(theory); if (!theory.ok) { showErrors(form, theory.errors ?? {}); setText(form, '[data-form-error]', theory.solverError?.message ?? 'Kiểm tra lại thông số.'); } else { theoryChartVisible = true; clearErrors(form); setText(form, '[data-form-error]', ''); redrawChart(); } });
  form.querySelector('#export-excel')?.addEventListener('click', async (event) => { const button = event.currentTarget; button.disabled = true; try { const theory = calculateTheory(valuesFromForm(form)); if (!theory.ok) throw new Error('Thông số chưa hợp lệ để xuất Excel.'); const { downloadExperiment } = await import('./excelExport.js'); downloadExperiment({ values: valuesFromForm(form), theory, state: simulationState, history: chartHistory.slice() }); setText(form, '[data-export-status]', 'Đã xuất .xlsx; dữ liệu mô phỏng được phân biệt với lý thuyết.'); } catch (error) { setText(form, '[data-export-status]', error.message); } finally { button.disabled = false; } });
  form.addEventListener('submit', (event) => {
    event.preventDefault(); runner.pause(); setStateLabel('Validating'); setText(form, '[data-form-error]', '');
    const evaluation = evaluateTitration(valuesFromForm(form), solve);
    const theory = calculateTheory(valuesFromForm(form));
    showTheory(theory);
    if (!evaluation.ok) { if (evaluation.errors) showErrors(form, evaluation.errors); else setText(form, '[data-form-error]', evaluation.solverError.message); setStateLabel(evaluation.errors ? 'Input error' : 'Solver error'); return; }
    if (!theory.ok) { setText(form, '[data-form-error]', theory.solverError?.message ?? 'Không thể tính điểm tương đương. Kiểm tra lại thông số.'); setStateLabel('Input error'); return; }
    clearErrors(form); const created = createSimulationState(evaluation.chemistryInput, { initialBuretVolumeMl: evaluation.buretVolumeMl, dropSizeMl: UI_DROP_SIZE_ML });
    if (!created.ok) { setText(form, '[data-form-error]', created.error.message); setStateLabel('Solver error'); return; }
    chartHistory = [];
    simulationState = withSimulationResult(created.state, evaluation.result).state; render(evaluation.result); setStateLabel('Ready');
  });
  addDropButton?.addEventListener('click', () => { if (!simulationState) { setText(form, '[data-form-error]', 'Hãy tính trạng thái ban đầu trước khi thêm giọt.'); setStateLabel('Input error'); return; } if (step()) setStateLabel('Ready'); });
  runButton?.addEventListener('click', () => { if (simulationState && simulationState.status !== 'running') runner.start(); });
  pauseButton?.addEventListener('click', () => { if (simulationState?.status === 'running') runner.pause(); });
  speedSelector?.addEventListener('change', () => { runner.setSpeed(speedSelector.value); if (simulationState) { const next = setSimulationSpeed(simulationState, speedSelector.value); if (next.ok) simulationState = next.state; } });
  resetButton?.addEventListener('click', () => { if (!simulationState) return; runner.reset(); const reset = resetSimulation(simulationState); if (reset.ok) { chartHistory = []; simulationState = reset.state; evaluateCurrent(); setStateLabel('Ready'); } });
  chartStyle?.addEventListener('change', redrawChart);
  const chart = root.querySelector('[data-chart]');
  const chartResizeObserver = chart && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
    if (chart.clientWidth && chart.clientHeight) {
      redrawChart();
    }
  }) : null;
  chartResizeObserver?.observe(chart);
  const guidedForm = root.querySelector('[data-guided-form]');
  const checkGuided = (event) => { event.preventDefault(); setText(root, '[data-guided-feedback]', evaluateGuidedAnswer(simulationState?.result, Object.fromEntries(new FormData(guidedForm))).feedback); };
  guidedForm?.addEventListener('submit', checkGuided);
  const transfer = new URLSearchParams(location.search);
  if (transfer.has('pairId')) {
    const pair = titrationPairs.find((item) => item.id === transfer.get('pairId'));
    if (pair) {
      systemSelector.value = pair.systemType;
      pairSelector.replaceChildren(); syncSystem(); pairSelector.value = pair.id; syncSystem();
      for (const key of ['analyteConcentrationM', 'analyteVolumeMl', 'titrantConcentrationM']) {
        if (transfer.has(key)) form.elements[key].value = transfer.get(key);
      }
      form.elements.addedVolumeMl.value = '0';
      const theory = calculateTheory(valuesFromForm(form)); showTheory(theory);
      if (!theory.ok) showErrors(form, theory.errors ?? {});
    } else setText(form, '[data-form-error]', 'Cặp hóa chất trong liên kết chưa được hỗ trợ. Không nhận các thông số chuyển sang.');
  }
  syncControlAvailability();
  return { loadCase, getState: () => simulationState, dispose: () => { guidedForm?.removeEventListener('submit', checkGuided); runner.dispose(); chartResizeObserver?.disconnect(); renderIndicatorView(root, null); } };
}
