import assert from 'node:assert/strict';
import test from 'node:test';
import { generateCurve, solveWeakAcidStrongBase } from '../src/chemistry/index.js';
import { promptForState } from '../src/data/guidedPrompts.js';
import { createReport } from '../src/ui/report.js';

const input = Object.freeze({ Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, Ka: 1.8e-5, temperature: 298.15 });
const closeTo = (actual, expected, tolerance) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} not within ${tolerance} of ${expected}`);

test('CHEM-03: CH₃COOH–NaOH charge-balance solver matches reference states', () => {
  const initial = solveWeakAcidStrongBase(input); const half = solveWeakAcidStrongBase({ ...input, Vb: 0.0125 }); const equivalence = solveWeakAcidStrongBase({ ...input, Vb: 0.025 }); const after = solveWeakAcidStrongBase({ ...input, Vb: 0.02525 });
  for (const result of [initial, half, equivalence, after]) { assert.equal(result.error, undefined); assert.equal(result.diagnostics.converged, true); assert.ok(result.diagnostics.residual < 1e-10); }
  closeTo(initial.pH, 2.88, 0.03); closeTo(half.pH, -Math.log10(1.8e-5), 0.002); closeTo(equivalence.pH, 8.72, 0.04);
  assert.equal(half.stage, 'before-equivalence'); assert.equal(equivalence.stage, 'at-equivalence'); assert.equal(after.excess.species, 'OH⁻');
});

test('CHEM-03: curve checkpoints and prompts use the real weak-acid state', () => {
  const curve = generateCurve(input, { volumesMl: [0, 12.5, 25, 25.25] });
  assert.equal(curve.error, undefined); assert.equal(curve.model, 'weak-acid-strong-base'); assert.equal(curve.diagnostics.timer, false);
  assert.deepEqual(curve.points.map((point) => point.volumeMl), [0, 6.25, 12.5, 24.75, 25, 25.25]);
  const half = solveWeakAcidStrongBase({ ...input, Vb: 0.0125 }); assert.equal(promptForState(half, 12.5).milestone, 'half');
});

test('Phase 3 report captures the current weak-acid session', () => {
  const result = solveWeakAcidStrongBase({ ...input, Vb: 0.02525 });
  const chart = { outerHTML: '<svg data-chart="true"><circle /></svg>' };
  const report = createReport({ result, input: { ...input, Vb: 0.02525 }, addedVolumeMl: 25.25, chart });
  assert.equal(report.model, 'weak-acid-strong-base');
  assert.equal(report.modelVersion, 'weak-acid-strong-base-v1');
  assert.equal(report.input.Vb, 0.02525);
  assert.equal(report.stage, 'after-equivalence');
  assert.equal(report.summary.stage, result.stage);
  assert.equal(report.summary.excess.species, 'OH⁻');
  assert.ok(report.species.some(({ id }) => id === 'CH₃COO⁻'));
  assert.match(report.chartImageDataUrl, /^data:image\/svg\+xml/);
  assert.equal(report.milestones.equivalenceMl, result.milestones.equivalenceMl);
});
