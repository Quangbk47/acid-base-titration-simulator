import assert from 'node:assert/strict';
import test from 'node:test';
import { generateCurve, solveWeakAcidStrongBase } from '../src/chemistry/index.js';
import { chem03Reference, CHEM03_REFERENCE_CONVENTION } from './fixtures/chem03IndependentReference.js';

const closeTo = (actual, expected, tolerance, label) => {
  const delta = Math.abs(actual - expected);
  assert.ok(delta <= tolerance, `${label}: expected ${expected}, actual ${actual}, delta ${delta}, tolerance ${tolerance}`);
};

test('CHEM-03: production solver matches independent reference records', () => {
  assert.equal(CHEM03_REFERENCE_CONVENTION.kw, 1e-14);
  for (const reference of chem03Reference) {
    const actual = solveWeakAcidStrongBase(reference.input);
    assert.equal(actual.error, undefined, `${reference.id}: solver error`);
    closeTo(actual.pH, reference.expectedPH, reference.pHTolerance, `${reference.id} pH`);
    closeTo(actual.Veq * 1, reference.expectedVeqMl, reference.veqToleranceMl, `${reference.id} Veq`);
    assert.equal(actual.stage, reference.expectedStage, `${reference.id} stage`);
    assert.equal(actual.excess.species, reference.expectedExcessSpecies, `${reference.id} excess species`);
    assert.equal(actual.diagnostics.converged, true, `${reference.id} convergence`);
    assert.ok(actual.diagnostics.residual < 1e-10, `${reference.id} residual`);
  }
});

test('CHEM-03: curve includes every independent reference milestone in order', () => {
  const input = chem03Reference[0].input;
  const requestedVolumes = chem03Reference.map(({ volumeMl }) => volumeMl);
  const curve = generateCurve(input, { volumesMl: requestedVolumes });
  assert.equal(curve.error, undefined);
  const curveVolumes = curve.points.map(({ volumeMl }) => volumeMl);
  assert.deepEqual(
    requestedVolumes.filter((volumeMl) => curveVolumes.includes(volumeMl)),
    requestedVolumes,
  );
  assert.deepEqual([...curveVolumes].sort((left, right) => left - right), curveVolumes);
  for (const reference of chem03Reference) {
    const point = curve.points.find(({ volumeMl }) => volumeMl === reference.volumeMl);
    assert.ok(point, `${reference.id}: reference volume must be present`);
    assert.ok(Number.isFinite(point.pH), `${reference.id}: pH must be finite`);
    assert.equal(point.stage, reference.expectedStage, `${reference.id}: curve stage`);
    closeTo(point.pH, reference.expectedPH, reference.pHTolerance, `${reference.id} curve pH`);
  }
});
