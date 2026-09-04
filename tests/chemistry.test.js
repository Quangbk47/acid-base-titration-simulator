import assert from 'node:assert/strict';
import test from 'node:test';
import {
  celsiusToKelvin,
  generateCurve,
  mlToL,
  solveStrongStrong,
} from '../src/chemistry/index.js';
import { standardCases, standardCaseToSolverInput } from '../src/data/standardCases.js';
import { phase1Reference } from './fixtures/phase1Reference.js';

const inputFor = (id) => standardCaseToSolverInput(standardCases.find((item) => item.id === id));
const referenceFor = (id) => phase1Reference.find((item) => item.id === id);
const closeTo = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);

test('CHEM-01/02: hand-calculated HCl-NaOH reference cases match the pure solver', () => {
  for (const reference of phase1Reference) {
    const result = solveStrongStrong(inputFor(reference.id));
    assert.equal(result.error, undefined, reference.id);
    closeTo(result.pH, reference.pH, 1e-10);
    closeTo(result.pOH, reference.pOH, 1e-10);
    closeTo(result.totalVolumeL, reference.totalVolumeL, 1e-15);
    closeTo(result.excess.moles, reference.excessMoles, 1e-15);
    assert.equal(result.excess.species, reference.excessSpecies);
    assert.equal(result.stage, reference.stage);
    assert.equal(result.dominantReaction, 'H⁺ + OH⁻ → H₂O');
    closeTo(result.milestones.equivalenceMl, 25, 1e-12);
    closeTo(result.Veq, 25, 1e-12);
    closeTo(result.milestones.Veq, 25, 1e-12);
    assert.ok(result.milestones.endpointMl > result.milestones.equivalenceMl);
    assert.equal(result.pH + result.pOH, 14);
  }
});

test('CHEM-01: concentrations and ions conserve the strong electrolyte species', () => {
  const result = solveStrongStrong(inputFor('hcl-naoh-50-percent'));
  assert.equal(result.moles.hclInitial, 0.0025000000000000005);
  assert.equal(result.moles.naohAdded, 0.0012500000000000002);
  closeTo(result.moles.neutralized, 0.00125, 1e-15);
  closeTo(result.moles.residualH, 0.00125, 1e-15);
  assert.equal(result.moles.residualOH, 0);
  closeTo(result.concentrations.HPlus, 1 / 30, 1e-15);
  closeTo(result.concentrations.NaPlus, 1 / 30, 1e-15);
  closeTo(result.concentrations.ClMinus, 1 / 15, 1e-15);
  assert.ok(result.species.every(({ moles, concentration }) => Number.isFinite(moles) && Number.isFinite(concentration)));
});

test('CHEM-02: milestone calculations distinguish equivalence from endpoint', () => {
  const result = solveStrongStrong(inputFor('hcl-naoh-equivalence'));
  assert.equal(result.stage, 'at-equivalence');
  closeTo(result.milestones.halfEqMl, 12.5, 1e-12);
  closeTo(result.milestones.equivalenceMl, 25, 1e-12);
  assert.ok(result.milestones.endpointMl > result.milestones.equivalenceMl);
  const near = solveStrongStrong({ ...inputFor('hcl-naoh-equivalence'), Vb: mlToL(25.02) });
  assert.equal(near.stage, 'near-equivalence');
  const after = solveStrongStrong({ ...inputFor('hcl-naoh-equivalence'), Vb: mlToL(25.25) });
  assert.equal(after.stage, 'after-equivalence');
});

test('CHEM-02: curve is deterministic, includes initial state, and has no timer', () => {
  const input = inputFor('hcl-naoh-equivalence');
  const curve = generateCurve(input, { volumesMl: [0, 6.25, 12.5, 24.75, 25, 25.25] });
  assert.equal(curve.error, undefined);
  assert.equal(curve.diagnostics.timer, false);
  assert.deepEqual(curve.points.map((point) => point.volumeMl), [0, 6.25, 12.5, 24.75, 25, 25.25]);
  for (const point of curve.points) {
    assert.ok(Number.isFinite(point.pH));
    assert.ok(Number.isFinite(point.pOH));
    assert.ok(Number.isFinite(point.totalVolumeL));
  }
  assert.equal(curve.points[4].stage, 'at-equivalence');
  assert.equal(curve.points[5].stage, 'after-equivalence');
});

test('CHEM-05: zero/negative/non-finite and malformed input returns coded errors, never NaN', () => {
  const valid = inputFor('hcl-naoh-initial');
  const invalidInputs = [
    { ...valid, Ca: 0 },
    { ...valid, Va: -1 },
    { ...valid, Cb: 0 },
    { ...valid, Vb: -0.01 },
    { ...valid, Ca: Number.NaN },
    { ...valid, Vb: Number.POSITIVE_INFINITY },
    null,
  ];
  for (const input of invalidInputs) {
    const result = solveStrongStrong(input);
    assert.ok(result.error?.code, JSON.stringify(result));
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
  }
  const badCurve = generateCurve(valid, { stepMl: 0 });
  assert.equal(badCurve.error.code, 'INVALID_CURVE_STEP');
});

test('CHEM-05: unit conversion and initial titrant volume are well-defined', () => {
  assert.equal(solveStrongStrong(inputFor('hcl-naoh-initial')).totalVolumeL, 0.025);
  assert.equal(celsiusToKelvin(25), 298.15);
  assert.equal(inputFor('hcl-naoh-initial').Va, 0.025);
  assert.equal(inputFor('hcl-naoh-initial').Vb, 0);
  assert.equal(inputFor('hcl-naoh-initial').temperature, 298.15);
  assert.equal(referenceFor('hcl-naoh-initial').stage, 'before-equivalence');
});

test('CHEM-05: Phase 1 rejects temperatures outside 298.15 K', () => {
  const valid = inputFor('hcl-naoh-initial');
  for (const temperature of [25, 273.15, 298, 298.16, 310.15]) {
    const result = solveStrongStrong({ ...valid, temperature });
    assert.equal(result.error?.code, 'OUT_OF_RANGE');
    assert.match(result.error.fields.temperature, /298\.15 K/);
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
  }
});

test('CHEM-01/05: relative mol tolerance preserves very small valid acid excess', () => {
  const result = solveStrongStrong({
    Ca: 1e-9,
    Va: 1e-6,
    Cb: 1e-9,
    Vb: 0,
    temperature: 298.15,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.stage, 'before-equivalence');
  assert.equal(result.excess.species, 'H⁺');
  closeTo(result.excess.moles, 1e-15, 1e-27);
  closeTo(result.pH, 9, 1e-12);
});

test('CHEM-02: generated volumes are non-empty, sorted, unique, and include checkpoints', () => {
  const input = inputFor('hcl-naoh-initial');
  const curve = generateCurve(input, { stepMl: 0.1 });
  assert.equal(curve.error, undefined);
  assert.ok(curve.points.length > 0);
  const volumes = curve.points.map(({ volumeMl }) => volumeMl);
  for (let index = 1; index < volumes.length; index += 1) {
    assert.ok(volumes[index] > volumes[index - 1]);
    assert.ok(volumes[index] - volumes[index - 1] > volumes.at(-1) * 1e-12);
  }
  for (const checkpoint of [0, 6.25, 12.5, 24.75, 25, 25.25, 50]) {
    assert.ok(volumes.includes(checkpoint), `missing ${checkpoint} mL checkpoint`);
  }
  assert.equal(generateCurve(input, { volumesMl: [] }).error.code, 'INVALID_CURVE_VOLUMES');
});

test('CHEM-02: requested curve volumes are sorted and near-duplicates are removed', () => {
  const input = inputFor('hcl-naoh-equivalence');
  const curve = generateCurve(input, {
    volumesMl: [25.25, 25, 24.75, 12.5, 6.25, 0.3, 0.30000000000000004, 0],
  });
  assert.equal(curve.error, undefined);
  const volumes = curve.points.map(({ volumeMl }) => volumeMl);
  assert.deepEqual(volumes, [0, 0.3, 6.25, 12.5, 24.75, 25, 25.25]);
});

test('CHEM-02/05: curve volume tolerance preserves tiny valid titrations', () => {
  const input = {
    Ca: 0.1,
    Va: 1e-12,
    Cb: 0.1,
    Vb: 0,
    temperature: 298.15,
  };
  const curve = generateCurve(input);
  assert.equal(curve.error, undefined);
  assert.deepEqual(
    curve.points.map(({ volumeMl }) => volumeMl),
    [0, 2.5e-10, 5e-10, 9.9e-10, 1e-9, 1.01e-9, 2e-9],
  );
});

test('CHEM-05: malformed curve options return coded errors', () => {
  const input = inputFor('hcl-naoh-initial');
  for (const options of [null, [], 'invalid']) {
    const result = generateCurve(input, options);
    assert.equal(result.error?.code, 'INVALID_CURVE_OPTIONS');
  }
});
