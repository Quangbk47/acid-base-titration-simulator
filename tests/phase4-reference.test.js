import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateCurve,
  generateStrongAcidWeakBaseCurve,
  generateWeakAcidCurve,
  solveStrongAcidWeakBase,
} from '../src/chemistry/index.js';
import { chem03Reference } from './fixtures/chem03IndependentReference.js';
import { phase4Nh3HclReference, PHASE_4_PH_TOLERANCE } from './fixtures/phase4Reference.js';

test('CHEM-04: NH₃–HCl matches every independent Phase 4 reference row', () => {
  for (const reference of phase4Nh3HclReference) {
    const actual = solveStrongAcidWeakBase(reference);
    assert.equal(actual.error, undefined, reference.id);
    assert.ok(Math.abs(actual.pH - reference.expectedPH) <= PHASE_4_PH_TOLERANCE, reference.id);
    assert.ok(Math.abs(actual.Veq - reference.expectedVeqMl) <= 1e-12, `${reference.id} Veq`);
    assert.equal(actual.stage, reference.expectedStage, `${reference.id} stage`);
    assert.equal(actual.excess.species, reference.expectedExcessSpecies, `${reference.id} excess`);
    assert.equal(actual.diagnostics.converged, true, `${reference.id} convergence`);
    assert.ok(Math.abs(actual.pH + actual.pOH - 14) < 1e-10, `${reference.id} pH+pOH`);
  }
});

test('Phase 4: all three systems include independent Veq checkpoints in ordered curves', () => {
  const strongInput = { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, temperature: 298.15 };
  const weakInput = chem03Reference[0].input;
  const ammoniaInput = phase4Nh3HclReference[0];
  const curves = [
    generateCurve(strongInput, { maxVolumeMl: 50 }),
    generateWeakAcidCurve(weakInput, { maxVolumeMl: 50 }),
    generateStrongAcidWeakBaseCurve(ammoniaInput, { maxVolumeMl: 50 }),
  ];
  for (const curve of curves) {
    assert.equal(curve.error, undefined);
    assert.ok(curve.points.length > 10);
    assert.deepEqual(curve.points.map(({ volumeMl }) => volumeMl), [...curve.points.map(({ volumeMl }) => volumeMl)].sort((a, b) => a - b));
    assert.ok(curve.points.some(({ volumeMl }) => Math.abs(volumeMl - curve.milestones.equivalenceMl) <= 1e-12));
    assert.ok(curve.points.every(({ pH }) => Number.isFinite(pH) && pH >= 0 && pH <= 14));
  }
  assert.ok(curves[0].points[0].pH < curves[0].points.at(-1).pH, 'HCl–NaOH rises overall');
  assert.ok(curves[1].points[0].pH < curves[1].points.at(-1).pH, 'CH₃COOH–NaOH rises overall');
  assert.ok(curves[2].points[0].pH > curves[2].points.at(-1).pH, 'NH₃–HCl falls overall');
});

test('CHEM-04: NH₃–HCl invalid inputs fail without NaN or Infinity', () => {
  const valid = phase4Nh3HclReference[0];
  for (const input of [{ ...valid, Kb: 0 }, { ...valid, Va: -0.001 }, { ...valid, temperature: 300 }]) {
    const actual = solveStrongAcidWeakBase(input);
    assert.equal(actual.error?.code, 'OUT_OF_RANGE');
    assert.doesNotMatch(JSON.stringify(actual), /NaN|Infinity/);
  }
});
