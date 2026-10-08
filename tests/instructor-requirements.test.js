import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTheory, solverForInput } from '../src/ui/theoryView.js';
import { solveWeakBaseStrongAcid, solveWeakAcidStrongBase } from '../src/chemistry/index.js';
import { evaluateTitration } from '../src/ui/inputForm.js';
import { buildAxisTicks, buildChartModel, orderedChartData } from '../src/ui/chartView.js';
import { addDrop, createSimulationState, resetSimulation } from '../src/simulation/state.js';
import { createSimulationRunner } from '../src/simulation/runner.js';

const values = { systemType: 'strong-acid-strong-base', analyteConcentrationM: 0.1, analyteVolumeMl: 25, titrantConcentrationM: 0.1, addedVolumeMl: 0, buretVolumeMl: 50 };

test('Instructor: theoretical equivalence follows inputs, litres, and 1:1 stoichiometry', () => {
  for (const [concentration, volume, titrant, expected] of [[0.1, 25, 0.1, 25], [0.2, 20, 0.1, 40], [0.15, 17, 0.08, 31.875]]) {
    const result = calculateTheory({ ...values, analyteConcentrationM: concentration, analyteVolumeMl: volume, titrantConcentrationM: titrant });
    assert.equal(result.ok, true);
    assert.ok(Math.abs(result.equivalenceMl - expected) < 1e-10);
    assert.equal(result.analyteMoles, concentration * volume / 1000);
    assert.equal(result.pH, 7);
    assert.equal(result.reaction, 'HCl + NaOH → NaCl + H₂O');
  }
  assert.equal(calculateTheory({ ...values, titrantConcentrationM: 0 }).ok, false);
});

test('Instructor: weak-system theory uses the actual engine, not pH 7', () => {
  const acid = calculateTheory({ ...values, systemType: 'weak-acid-strong-base', Ka: 1.8e-5 });
  const base = calculateTheory({ ...values, systemType: 'strong-acid-weak-base', Kb: 1.8e-5 });
  assert.equal(acid.ok, true); assert.equal(base.ok, true);
  assert.ok(Math.abs(acid.equivalenceMl - 25) < 1e-10); assert.ok(Math.abs(base.equivalenceMl - 25) < 1e-10);
  assert.ok(Math.abs(acid.pH - 8.72) < 0.02);
  assert.ok(Math.abs(base.pH - 5.28) < 0.02);
  assert.equal(base.analyte, 'NH₃'); assert.equal(base.titrant, 'HCl');
});

test('Instructor: all systems reset a seeded experiment to zero, keep setup and refill the buret', () => {
  for (const extra of [{}, { systemType: 'weak-acid-strong-base', Ka: 1.8e-5 }, { systemType: 'strong-acid-weak-base', Kb: 1.8e-5 }]) {
    const evaluated = evaluateTitration({ ...values, addedVolumeMl: 12.5, ...extra });
    assert.equal(evaluated.ok, true);
    const initial = createSimulationState(evaluated.chemistryInput, { initialBuretVolumeMl: 7, dropSizeMl: 0.1 });
    assert.equal(initial.ok, true);
    const stepped = addDrop(initial.state).state;
    const reset = resetSimulation(stepped).state;
    assert.equal(reset.addedVolumeMl, 0); assert.equal(reset.dropCount, 0);
    assert.equal(reset.initialAddedVolumeMl, 0); assert.equal(reset.initialBuretVolumeMl, 7);
    assert.equal(reset.chemistryInput[reset.titrantVolumeKey], 0);
    assert.equal(stepped.chemistryInput[stepped.titrantVolumeKey], 0.0126);
    const solved = solverForInput(reset.chemistryInput)(reset.chemistryInput);
    assert.equal(solved.error, undefined); assert.equal(solved.totalVolumeMl, 25);
    const model = buildChartModel(reset.chemistryInput, 0);
    assert.equal(model.error, undefined);
    assert.ok(Math.abs(model.points[0].pH - solved.pH) < 1e-12);
    const eq = model.points.find((point) => Math.abs(point.volumeMl - 25) < 1e-10);
    assert.ok(Math.abs(eq.pH - calculateTheory({ ...values, ...extra }).pH) < 1e-12);
  }
});

test('Instructor: cancelled callbacks cannot mutate a reset or restarted run', () => {
  const callbacks = []; let steps = 0;
  const runner = createSimulationRunner({ onStep: () => { steps += 1; return true; }, setTimeoutFn: (fn) => { callbacks.push(fn); return callbacks.length; }, clearTimeoutFn() {} });
  runner.start(); const stale = callbacks[0]; runner.reset(); stale();
  assert.equal(steps, 0); assert.equal(runner.running, false);
  runner.start(); stale(); assert.equal(steps, 0);
  callbacks[1](); assert.equal(steps, 1);
  runner.pause(); callbacks.at(-1)(); assert.equal(steps, 1);
  runner.dispose();
});

test('Instructor: NH3–HCl samples finish charge balance at the previously failing volumes', () => {
  for (const volumeMl of [44, 47, 49, 49.5]) {
    const result = solveWeakBaseStrongAcid({ Cb: 0.1, Vb: 0.025, Ca: 0.1, Va: volumeMl / 1000, Kb: 1.8e-5, temperature: 298.15 });
    assert.equal(result.error, undefined);
    assert.ok(Math.abs(result.diagnostics.residual) <= 1e-14);
    assert.ok(Math.abs(result.pH + Math.log10((0.1 * volumeMl / 1000 - 0.0025) / (0.025 + volumeMl / 1000))) < 0.0001);
  }
});

test('Instructor: weak-acid chart sample at 44 mL also finishes charge balance', () => {
  const result = solveWeakAcidStrongBase({ Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0.04400000000000001, Ka: 1.8e-5, temperature: 298.15 });
  assert.equal(result.error, undefined);
  assert.ok(Math.abs(result.diagnostics.residual) <= 1e-14);
  assert.ok(Math.abs(result.pH - (14 + Math.log10((0.0044 - 0.0025) / 0.069))) < 0.0001);
});

test('Instructor: axis limits scale to the experiment and history ordering preserves exact pH', () => {
  const input = evaluateTitration({ ...values, analyteConcentrationM: 0.2, analyteVolumeMl: 20 }).chemistryInput;
  const model = buildChartModel(input, 0);
  assert.equal(Math.max(...model.points.map((p) => p.volumeMl)), 80);
  assert.deepEqual(buildAxisTicks(80, 600), { x: [0, 20, 40, 60, 80], y: [0, 2, 4, 6, 8, 10, 12, 14] });
  assert.deepEqual(buildAxisTicks(80, 270).x, [0, 40, 80]);
  const history = [{ volumeMl: 25.1, pH: 10.3 }, { volumeMl: 24.9, pH: 3.7 }, { volumeMl: 25, pH: 7 }];
  assert.deepEqual(orderedChartData(history).map((p) => [p.volumeMl, p.pH]), [[24.9, 3.7], [25, 7], [25.1, 10.3]]);
  assert.equal(history[0].volumeMl, 25.1);
});
