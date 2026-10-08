import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVesselModel, flaskFillHeight, flaskRadiusAt, FLASK_BODY_HEIGHT } from '../src/ui/vesselModel.js';
import { addDrop, createSimulationState, resetSimulation, withSimulationResult } from '../src/simulation/state.js';
import { solveStrongStrong } from '../src/chemistry/index.js';
import { initVesselView } from '../src/ui/vesselView.js';

const input = { Ca: 0.1, Va: 0.01, Cb: 0.1, Vb: 0, temperature: 298.15 };
const evaluated = (state) => withSimulationResult(state, solveStrongStrong(state.chemistryInput)).state;

test('3D: drop and reset synchronize vessel volumes with the original solver without mutating state', () => {
  const initial = evaluated(createSimulationState(input, { dropSizeMl: 0.1 }).state);
  const snapshot = JSON.stringify(initial);
  const next = evaluated(addDrop(initial).state);
  const model = buildVesselModel(next);
  assert.equal(model.remainingMl, 49.9);
  assert.equal(model.totalMl, 10.1);
  assert.equal(model.pH, next.result.pH);
  assert.equal(model.dropCount, 1);
  assert.equal(model.pinkStrength, 0);
  assert.equal(JSON.stringify(initial), snapshot);
  const reset = buildVesselModel(evaluated(resetSimulation(next).state));
  assert.equal(reset.remainingMl, 50);
  assert.equal(reset.totalMl, 10);
  assert.equal(reset.dropCount, 0);
});

test('3D: initial titrant is not subtracted twice, empty buret and oversized flask stay finite', () => {
  const state = createSimulationState({ ...input, Vb: 0.005 }, { initialBuretVolumeMl: 20, dropSizeMl: 0.1 }).state;
  const model = buildVesselModel(evaluated(addDrop(state).state));
  assert.ok(Math.abs(model.remainingMl - 19.9) < 1e-9);
  assert.equal(buildVesselModel({ ...state, addedVolumeMl: 100 }).remainingMl, 0);
  const large = buildVesselModel({ ...state, result: { totalVolumeMl: 1000, pH: 12, excess: { species: 'OH⁻' } } });
  assert.equal(large.flaskFraction, 0.85);
  assert.ok(large.pinkStrength > 0.6);
});

test('3D: geometric liquid height conserves conical volume and increases continuously', () => {
  assert.ok(flaskFillHeight(0) < 1e-8);
  assert.ok(Math.abs(flaskFillHeight(1) - FLASK_BODY_HEIGHT) < 1e-8);
  let last = 0;
  for (const fraction of [0.05, 0.1, 0.25, 0.5, 0.85, 1]) {
    const height = flaskFillHeight(fraction);
    assert.ok(height > last);
    assert.ok(flaskRadiusAt(height) > 0);
    const frustumVolume = (h) => h / 3 * (0.68 ** 2 + 0.68 * flaskRadiusAt(h) + flaskRadiusAt(h) ** 2);
    assert.ok(Math.abs(frustumVolume(height) / frustumVolume(FLASK_BODY_HEIGHT) - fraction) < 1e-8);
    last = height;
  }
});

test('3D: lazy loader replays the latest state and disposes observers/renderer', async () => {
  const originalObserver = globalThis.IntersectionObserver;
  let intersection;
  let disconnected = false;
  globalThis.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  const outputs = new Map();
  const stage = { dataset: {}, querySelector(selector) { if (!outputs.has(selector)) outputs.set(selector, { textContent: '', disabled: true, addEventListener() {}, removeEventListener() {} }); return outputs.get(selector); } };
  let resolveModule;
  let rendered;
  let cleaned = false;
  let loads = 0;
  try {
    const view = initVesselView({ root: { querySelector: () => stage }, loadScene: () => { loads += 1; return new Promise((resolve) => { resolveModule = resolve; }); } });
    assert.equal(loads, 0);
    intersection([{ isIntersecting: true }]);
    const latest = evaluated(addDrop(createSimulationState(input, { dropSizeMl: 0.1 }).state).state);
    view.update(latest);
    resolveModule({ createVesselScene: () => ({ update(state) { rendered = state; }, setVisible() {}, dispose() { cleaned = true; } }) });
    await Promise.resolve();
    assert.equal(rendered, latest);
    assert.equal(stage.dataset.renderer, 'ready');
    assert.equal(outputs.get('[data-vessel-buret]').textContent, '49,90 mL');
    view.dispose();
    assert.equal(disconnected, true);
    assert.equal(cleaned, true);
  } finally { globalThis.IntersectionObserver = originalObserver; }
});
