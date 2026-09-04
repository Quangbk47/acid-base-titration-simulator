import { solveStrongStrong, solveWeakAcidStrongBase } from './chemistry/index.js';
import { standardCases, standardCaseToSolverInput, weakAcidCases, weakAcidCaseToSolverInput } from './data/standardCases.js';
import { evaluateGuidedAnswer, guidedPromptFor } from './data/guidedPrompts.js';
import { firebaseModuleStatus } from './firebase/index.js';
import { addDropState, createSimulationState, resetSimulationState } from './simulation/state.js';
import { createRunner, speedDelayMs } from './simulation/runner.js';
import { renderChart } from './ui/chartView.js';
import { renderExperiment } from './ui/experimentView.js';
import { initNavigation } from './ui/navigation.js';
import { initInputForm } from './ui/inputForm.js';

const route = initNavigation({ links: document.querySelectorAll('[data-route]'), views: document.querySelectorAll('[data-view]') });
const status = document.querySelector('#app-status');
if (status) {
  status.textContent = 'Phase 2 · Nhập liệu';
  status.dataset.state = baselineState.screen;
}

initInputForm({ form: document.querySelector('#titration-form') });

document.documentElement.dataset.appReady = 'true';
window.__acidBaseBaseline = Object.freeze({
  route,
  chemistry: chemistryModuleStatus,
  firebase: firebaseModuleStatus,
  standardCaseCount: standardCases.length,
});
const start = () => { if (state.screen !== 'running') { state = { ...state, screen: 'running' }; runner.start(speedDelayMs[state.speed]); render(); } };
const pause = () => { runner.stop(); state = { ...state, timerId: null, screen: 'paused' }; render(); };
const reset = () => { runner.stop(); state = resetSimulationState(state); guidedFeedback = null; render(); };
controls['add-drop']?.addEventListener('click', () => addDrop());
controls.run?.addEventListener('click', start);
controls.pause?.addEventListener('click', pause);
controls.reset?.addEventListener('click', reset);
caseSelector?.addEventListener('change', (event) => {
  activeModel = event.target.value === 'weak' ? 'weak' : 'strong';
  input = activeModel === 'weak'
    ? weakAcidCaseToSolverInput(weakAcidCases[0])
    : standardCaseToSolverInput(standardCases[0]);
  runner.stop();
  state = addDropState(createSimulationState(), solveAt(0));
  guidedFeedback = null;
  render();
});
document.querySelector('[data-guided-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const evaluation = evaluateGuidedAnswer(state.current, {
    pH: form.get('pH'),
    color: form.get('color'),
    excess: form.get('excess'),
  });
  guidedFeedback = evaluation.total ? `${evaluation.feedback} (${evaluation.score}/${evaluation.total})` : evaluation.feedback;
  render();
});
document.querySelector('[data-action="report"]')?.addEventListener('click', () => {
  const graphSvg = document.querySelector('[data-chart-svg]')?.outerHTML ?? null;
  downloadSimulationReport(createSimulationReport({ input, result: state.current, history: state.history, modelVersion: state.current?.modelVersion ?? 'unknown', graphSvg }));
});
document.querySelector('#drop-size')?.addEventListener('change', (event) => { state = { ...state, dropSizeMl: Number(event.target.value) }; render(); });
document.querySelector('#speed')?.addEventListener('change', (event) => { state = { ...state, speed: event.target.value }; if (state.screen === 'running') runner.start(speedDelayMs[state.speed]); render(); });
document.documentElement.dataset.appReady = 'true';
window.__acidBaseApp = Object.freeze({ route, chemistry: 'phase-3-integrated', firebase: firebaseModuleStatus, standardCaseCount: standardCases.length, weakAcidCaseCount: weakAcidCases.length });
render();

