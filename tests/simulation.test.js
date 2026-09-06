import assert from 'node:assert/strict';
import test from 'node:test';
import { solveStrongStrong } from '../src/chemistry/index.js';
import { addDrop, createSimulationState, resetSimulation } from '../src/simulation/state.js';

const input = { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, temperature: 298.15 };

test('SIM-01: initial simulation state preserves chemistry input and starts at zero added volume', () => {
  const created = createSimulationState(input);
  assert.equal(created.ok, true);
  assert.equal(created.state.addedVolumeMl, 0);
  assert.equal(created.state.dropCount, 0);
  assert.equal(Object.isFrozen(created.state), true);
  assert.equal(Object.isFrozen(created.state.chemistryInput), true);
});

test('SIM-01: addDrop increments deterministically and solver receives the new volume', () => {
  const created = createSimulationState(input);
  const first = addDrop(created.state);
  const second = addDrop(first.state);
  assert.equal(first.state.addedVolumeMl, 0.05);
  assert.equal(second.state.addedVolumeMl, 0.1);
  assert.equal(second.state.dropCount, 2);
  assert.equal(second.state.chemistryInput.Vb, 0.0001);
  const result = solveStrongStrong(second.state.chemistryInput);
  assert.equal(result.error, undefined);
  assert.equal(result.totalVolumeMl, 25.1);
  assert.equal(result.stage, 'before-equivalence');
  assert.equal(created.state.addedVolumeMl, 0);
});

test('SIM-02: reset restores the original added volume without mutating prior state', () => {
  const created = createSimulationState({ ...input, Vb: 0.0125 });
  const stepped = addDrop(created.state);
  const reset = resetSimulation(stepped.state);
  assert.equal(reset.ok, true);
  assert.equal(reset.state.addedVolumeMl, 12.5);
  assert.equal(reset.state.chemistryInput.Vb, 0.0125);
  assert.equal(reset.state.dropCount, 0);
  assert.equal(stepped.state.addedVolumeMl, 12.55);
});

test('SIM-03: invalid state, input and drop size are rejected without NaN', () => {
  assert.equal(createSimulationState({ ...input, Vb: -1 }).error.code, 'INVALID_CHEMISTRY_INPUT');
  assert.equal(createSimulationState(input, { dropSizeMl: 0.2 }).error.code, 'INVALID_DROP_SIZE');
  const state = createSimulationState(input).state;
  assert.equal(addDrop(state, 0).error.code, 'INVALID_DROP_SIZE');
  assert.equal(addDrop(null).error.code, 'INVALID_SIMULATION_STATE');
  assert.doesNotMatch(JSON.stringify(addDrop(state, Number.NaN)), /NaN|Infinity/);
});
