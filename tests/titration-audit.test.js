import assert from 'node:assert/strict';
import test from 'node:test';
import { solveStrongStrong } from '../src/chemistry/index.js';
import { addDrop, createSimulationState, resetSimulation, withSimulationResult } from '../src/simulation/state.js';
import { buildVesselModel } from '../src/ui/vesselModel.js';
import { derivePhenolphthaleinState, renderIndicatorView } from '../src/ui/indicatorView.js';
import { validateTitrationForm } from '../src/ui/validation.js';

const input = { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, temperature: 298.15 };
const form = { systemType: 'strong-acid-strong-base', analyteConcentrationM: '0.1', analyteVolumeMl: '25', titrantConcentrationM: '0.1', addedVolumeMl: '0' };

test('AUDIT: 250 consecutive drops reach 25 mL / pH 7, with colorless 3D and conserved volumes', () => {
  let state = createSimulationState(input, { dropSizeMl: 0.1 }).state;
  for (let i = 0; i < 250; i += 1) state = addDrop(state).state;
  const result = solveStrongStrong(state.chemistryInput);
  assert.ok(Math.abs(result.Veq - 25) < 1e-9);
  assert.equal(result.pH, 7);
  assert.equal(result.stage, 'at-equivalence');
  const model = buildVesselModel(withSimulationResult(state, result).state);
  assert.ok(Math.abs(model.remainingMl - 25) < 1e-9);
  assert.ok(Math.abs(model.totalMl - 50) < 1e-9);
  assert.equal(model.pinkStrength, 0);
  const next = addDrop(state).state;
  const after = solveStrongStrong(next.chemistryInput);
  assert.ok(Math.abs(after.pH - 10.300162274) < 1e-6);
  assert.ok(buildVesselModel(withSimulationResult(next, after).state).pinkStrength > 0.6);
});

test('AUDIT: buret depletion rejects an extra drop without changing the final state', () => {
  let state = createSimulationState(input, { dropSizeMl: 0.1 }).state;
  for (let i = 0; i < 500; i += 1) state = addDrop(state).state;
  const snapshot = JSON.stringify(state);
  assert.equal(addDrop(state).error.code, 'BURET_EMPTY');
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(buildVesselModel(state).remainingMl, 0);
  const reset = resetSimulation(state).state;
  assert.equal(addDrop(reset).ok, true);
});

test('AUDIT: small and empty burets enforce complete-drop conservation, including seeded cases', () => {
  let state = createSimulationState({ ...input, Vb: 0.025 }, { initialBuretVolumeMl: 0.2, dropSizeMl: 0.1 }).state;
  state = addDrop(addDrop(state).state).state;
  assert.ok(Math.abs(state.addedVolumeMl - 25.2) < 1e-9);
  assert.equal(addDrop(state).error.code, 'BURET_EMPTY');
  const empty = createSimulationState(input, { initialBuretVolumeMl: 0 }).state;
  assert.equal(buildVesselModel(empty).initialMl, 0);
  assert.equal(buildVesselModel(empty).buretFraction, 0);
  assert.equal(addDrop(empty).error.code, 'BURET_EMPTY');
  assert.equal(addDrop(createSimulationState(input, { initialBuretVolumeMl: 0.09 }).state, 0.1).error.code, 'BURET_EMPTY');
  for (const value of [-1, NaN, Infinity]) assert.equal(createSimulationState(input, { initialBuretVolumeMl: value }).error.code, 'INVALID_BURET_VOLUME');
});

test('AUDIT: indicator uses the pH transition, including both sides of near-equivalence', () => {
  const low = derivePhenolphthaleinState({ pH: 7.8, stage: 'near-equivalence', excess: { species: 'OH⁻' } });
  assert.match(low.color, /, 0\)$/);
  const high = derivePhenolphthaleinState({ pH: 8.5, stage: 'near-equivalence', excess: { species: 'OH⁻' } });
  assert.equal(high.state, 'base-excess');
  assert.doesNotMatch(high.color, /, 0\)$/);
  assert.equal(derivePhenolphthaleinState({ pH: 8.72, stage: 'at-equivalence', excess: { species: null } }).state, 'base-excess');
});

test('AUDIT: indicator has only one pending effect and pause/reset cancel it', () => {
  const solution = { dataset: {}, style: { setProperty() {} }, classList: { values: new Set(), toggle(name, value) { if (value) this.values.add(name); else this.values.delete(name); }, remove(name) { this.values.delete(name); } } };
  const label = { textContent: '' };
  const root = { querySelector: (selector) => selector === '[data-indicator-solution]' ? solution : label };
  const pending = new Map();
  let id = 0;
  const timers = { setTimeoutFn(fn) { pending.set(++id, fn); return id; }, clearTimeoutFn(key) { pending.delete(key); } };
  const result = { pH: 2, stage: 'before-equivalence' };
  for (let i = 0; i < 10; i += 1) renderIndicatorView(root, result, { transient: true, transientDelayMs: 1500, ...timers });
  assert.equal(pending.size, 1);
  const [key, callback] = pending.entries().next().value;
  pending.delete(key);
  callback();
  assert.equal(solution.classList.values.has('indicator-transient'), true);
  renderIndicatorView(root, result, timers);
  assert.equal(pending.size, 0);
  assert.equal(solution.classList.values.has('indicator-transient'), false);
  renderIndicatorView(root, result, { transient: true, transientDelayMs: 1500, ...timers });
  renderIndicatorView(root, null, timers);
  assert.equal(pending.size, 0);
  assert.equal(solution.dataset.indicator, 'idle');
});

test('AUDIT: buret field accepts zero and rejects negative, blank, NaN and infinity', () => {
  assert.equal(validateTitrationForm({ ...form, buretVolumeMl: '0' }).value.buretVolumeMl, 0);
  assert.equal(validateTitrationForm(form).value.buretVolumeMl, 50);
  for (const value of ['-1', '', 'NaN', 'Infinity']) {
    const result = validateTitrationForm({ ...form, buretVolumeMl: value });
    assert.equal(result.ok, false);
    assert.ok(result.errors.buretVolumeMl);
  }
});
