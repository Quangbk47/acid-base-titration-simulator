import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateGuidedAnswer, guidedPromptFor } from '../src/data/guidedPrompts.js';
import { createSimulationReport, reportToHtml, reportToText } from '../src/ui/report.js';

test('Phase 3 guided prompt starts at initial milestone and follows state', () => {
  const initial = guidedPromptFor({ moles: { naohAdded: 0 }, pH: 2.88, stage: 'before-equivalence' });
  const after = guidedPromptFor({ moles: { naohAdded: 0.001 }, pH: 8.8, stage: 'at-equivalence' });
  assert.equal(initial.milestone, 'initial');
  assert.equal(after.milestone, 'equivalence');
  assert.notEqual(initial.question, after.question);
});

test('Phase 3 guided workflow scores answers from the current chemistry state', () => {
  const result = { pH: 8.72, stage: 'at-equivalence', moles: { naohAdded: 0.0025 }, excess: { species: null } };
  const evaluation = evaluateGuidedAnswer(result, { pH: '8.70', color: 'pink-transition', excess: 'none' });
  assert.equal(evaluation.score, 3);
  assert.match(evaluation.feedback, /Chính xác/);
});

test('Phase 3 guided prompt recognises half-equivalence from its actual milestone', () => {
  const prompt = guidedPromptFor({ volumeMl: 12.5, milestones: { halfEqMl: 12.5 }, moles: { naohAdded: 0.00125 }, pH: 4.74, stage: 'before-equivalence' });
  assert.equal(prompt.milestone, 'half-equivalence');
});

test('Phase 3 report records model version, input, milestones, and graph points', () => {
  const report = createSimulationReport({
    input: { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, Ka: 1.8e-5, temperature: 298.15 },
    result: { modelVersion: 'weak-acid-strong-base-v1', pH: 2.88, totalVolumeMl: 25, stage: 'before-equivalence', excess: { species: 'HA' }, milestones: { equivalenceMl: 25, endpointMl: 25.01 } },
    history: [{ volumeMl: 0, pH: 2.88, stage: 'before-equivalence' }],
    modelVersion: 'weak-acid-strong-base-v1',
    graphSvg: '<svg viewBox="0 0 10 10"><polyline points="0,0 1,1" /></svg>',
  });
  assert.equal(report.modelVersion, 'weak-acid-strong-base-v1');
  assert.equal(report.points.length, 1);
  assert.equal(report.graphImage.format, 'image/svg+xml');
  assert.match(report.graphImage.svg, /polyline/);
  assert.match(reportToHtml(report), /<svg/);
  assert.match(reportToHtml(report), /polyline/);
  assert.match(reportToText(report), /weak-acid-strong-base-v1/);
});
