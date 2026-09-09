import { solveStrongStrong, solveWeakAcidStrongBase } from './chemistry/index.js';
import { standardCases, standardCaseToSolverInput, weakAcidCases, weakAcidCaseToSolverInput } from './data/standardCases.js';
import { evaluateGuidedAnswer, guidedPromptFor } from './data/guidedPrompts.js';
import { firebaseModuleStatus } from './firebase/index.js';
import { addDropState, createSimulationState, resetSimulationState } from './simulation/state.js';
import { createRunner, speedDelayMs } from './simulation/runner.js';
import { renderChart } from './ui/chartView.js';
import { renderExperiment } from './ui/experimentView.js';
import { renderKnowledge } from './ui/knowledgeView.js';
import { initNavigation } from './ui/navigation.js';
import { createSimulationReport, downloadSimulationReport } from './ui/report.js';

const route = initNavigation({ links: document.querySelectorAll('[data-route]'), views: document.querySelectorAll('[data-view]') });
renderKnowledge(document.querySelector('[data-learning-content]'));
const status = document.querySelector('#app-status');
const controls = Object.fromEntries([...document.querySelectorAll('[data-action]')].map((button) => [button.dataset.action, button]));
let activeModel = 'strong';
let input = standardCaseToSolverInput(standardCases[0]);
let guidedFeedback = null;
const caseSelector = document.querySelector('#case-selector');
const getSolver = () => activeModel === 'weak' ? solveWeakAcidStrongBase : solveStrongStrong;
const solveAt = (volumeMl) => {
  const solved = getSolver()({ ...input, Vb: volumeMl / 1000 });
  if (solved.error) throw new Error(solved.error.message);
  return { ...solved, volumeMl };
};
let state = addDropState(createSimulationState(), solveAt(0));
const updateButtons = () => {
  if (!controls['add-drop']) return;
  controls['add-drop'].disabled = state.screen === 'running';
  controls.run.disabled = state.screen === 'running';
  controls.pause.disabled = state.screen !== 'running';
  controls.reset.disabled = false;
};
const render = () => {
  renderExperiment(state);
  renderChart(state.history, state.current?.milestones ?? solveAt(0).milestones);
  const analyte = document.querySelector('#analyte');
  if (analyte) analyte.value = activeModel === 'weak' ? 'CH₃COOH' : 'HCl';
  if (status) { status.textContent = `Phase 3 · ${state.screen}`; status.dataset.state = state.screen; }
  const badge = document.querySelector('.state-badge');
  if (badge) badge.textContent = state.screen;
  const prompt = guidedPromptFor(state.current);
  const promptElement = document.querySelector('[data-guided-prompt]');
  const feedbackElement = document.querySelector('[data-guided-feedback]');
  if (promptElement) promptElement.textContent = prompt.question;
  if (feedbackElement) feedbackElement.textContent = guidedFeedback ?? 'Nhập dự đoán rồi gửi để nhận phản hồi từ state thật.';
  updateButtons();
};
const addDrop = (fromRunner = false) => {
  if (state.screen === 'running' && !fromRunner) return;
  const nextVolume = Math.min(state.addedVolumeMl + state.dropSizeMl, 50);
  state = addDropState(state, solveAt(nextVolume));
  if (fromRunner) state = { ...state, screen: 'running' };
  if (fromRunner && nextVolume >= 50) runner.stop();
  render();
};
const runner = createRunner({
  onStep: () => addDrop(true),
  onState: (timerId) => { state = { ...state, timerId, screen: timerId === null ? 'paused' : 'running' }; render(); },
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

