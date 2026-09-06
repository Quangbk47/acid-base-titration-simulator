import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePhenolphthaleinState } from '../src/ui/indicatorView.js';
import { buildChartModel } from '../src/ui/chartView.js';
import { standardCaseToSolverInput, standardCases } from '../src/data/standardCases.js';

test('UI-03/CHEM-06: phenolphthalein state follows solver stage and OH excess', () => {
  assert.equal(derivePhenolphthaleinState(null).state, 'idle');
  assert.equal(derivePhenolphthaleinState({ stage: 'before-equivalence', pH: 2, excess: { species: 'H⁺' } }).state, 'acidic');
  assert.equal(derivePhenolphthaleinState({ stage: 'at-equivalence', pH: 7, excess: { species: null } }).state, 'equivalence');
  assert.equal(derivePhenolphthaleinState({ stage: 'after-equivalence', pH: 12, excess: { species: 'OH⁻' } }).state, 'base-excess');
});

test('UI-02: chart view is backed by deterministic curve points and milestones', () => {
  const input = standardCaseToSolverInput(standardCases[0]);
  const model = buildChartModel(input, 0);
  assert.equal(model.error, undefined);
  assert.ok(model.points.length > 10);
  assert.ok(model.points.some((point) => Math.abs(point.volumeMl - model.milestones.halfEqMl) < 1e-9));
  assert.ok(model.points.some((point) => Math.abs(point.volumeMl - model.milestones.equivalenceMl) < 1e-9));
});
