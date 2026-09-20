import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePhenolphthaleinState, renderIndicatorView } from '../src/ui/indicatorView.js';
import { buildChartModel } from '../src/ui/chartView.js';
import { standardCaseToSolverInput, standardCases } from '../src/data/standardCases.js';

test('UI-03/CHEM-06: phenolphthalein state follows solver stage and OH excess', () => {
  assert.equal(derivePhenolphthaleinState(null).state, 'idle');
  assert.equal(derivePhenolphthaleinState({ stage: 'before-equivalence', pH: 2, excess: { species: 'H⁺' } }).state, 'acidic');
  assert.equal(derivePhenolphthaleinState({ stage: 'at-equivalence', pH: 7, excess: { species: null } }).state, 'equivalence');
  assert.equal(derivePhenolphthaleinState({ stage: 'after-equivalence', pH: 12, excess: { species: 'OH⁻' } }).state, 'base-excess');
});

test('CHEM-06: indicator transition is transient before equivalence and persistent after equivalence', () => {
  const solution = { dataset: {}, style: { setProperty: () => {} }, classList: { values: new Set(), toggle(name, enabled) { if (enabled) this.values.add(name); else this.values.delete(name); }, remove(name) { this.values.delete(name); } } };
  const label = { textContent: '' };
  const root = { querySelector(selector) { return selector === '[data-indicator-solution]' ? solution : label; } };
  let scheduled;
  const timers = { setTimeoutFn(callback, delay) { scheduled = { callback, delay }; return scheduled; }, clearTimeoutFn() {} };
  renderIndicatorView(root, { stage: 'before-equivalence', pH: 2, excess: { species: 'H⁺' } }, { transient: true, ...timers });
  assert.equal(solution.dataset.indicator, 'acidic');
  assert.equal(solution.classList.values.has('indicator-transient'), true);
  assert.equal(scheduled.delay, 500);
  scheduled.callback();
  assert.equal(solution.classList.values.has('indicator-transient'), false);
  renderIndicatorView(root, { stage: 'at-equivalence', pH: 8.2, excess: { species: null } }, timers);
  assert.equal(solution.dataset.indicator, 'equivalence');
  assert.equal(solution.classList.values.has('indicator-transient'), false);
  renderIndicatorView(root, { stage: 'after-equivalence', pH: 12, excess: { species: 'OH⁻' } }, timers);
  assert.equal(solution.dataset.indicator, 'base-excess');
  assert.equal(label.textContent, 'Hồng bền (dư OH⁻)');
});

test('UI-02: chart view is backed by deterministic curve points and milestones', () => {
  const input = standardCaseToSolverInput(standardCases[0]);
  const model = buildChartModel(input, 0);
  assert.equal(model.error, undefined);
  assert.ok(model.points.length > 10);
  assert.ok(model.points.some((point) => Math.abs(point.volumeMl - model.milestones.halfEqMl) < 1e-9));
  assert.ok(model.points.some((point) => Math.abs(point.volumeMl - model.milestones.equivalenceMl) < 1e-9));
});
