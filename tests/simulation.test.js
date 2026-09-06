import assert from 'node:assert/strict';
import test from 'node:test';
import { addDropState, createSimulationState, resetSimulationState } from '../src/simulation/state.js';
import { createRunner } from '../src/simulation/runner.js';

const solved = (volumeMl) => ({ volumeMl, pH: 7, species: [], excess: {}, stage: 'before-equivalence' });

test('SIM-01: addDrop updates one shared state history', () => {
  const state = addDropState(createSimulationState(), solved(0.1));
  assert.equal(state.addedVolumeMl, 0.1);
  assert.equal(state.history.length, 1);
  assert.equal(state.current.volumeMl, 0.1);
});

test('SIM-02: reset clears history and returns initial volume', () => {
  const state = addDropState(createSimulationState(), solved(0.1));
  const reset = resetSimulationState(state);
  assert.equal(reset.addedVolumeMl, 0);
  assert.deepEqual(reset.history, []);
  assert.equal(reset.current, null);
});

test('SIM-03: runner replaces an existing timer and stop clears it', () => {
  let ticks = 0;
  const ids = [];
  const runner = createRunner({ onStep: () => { ticks += 1; }, onState: (id) => ids.push(id) });
  runner.start(1000);
  const first = runner.timerId;
  runner.start(1000);
  assert.notEqual(runner.timerId, first);
  runner.stop();
  assert.equal(runner.timerId, null);
  assert.equal(ticks, 0);
  assert.equal(ids.length, 2);
});

