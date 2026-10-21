import assert from 'node:assert/strict';
import test from 'node:test';
import { hasDispensedDrop, buildVesselModel, flaskFillHeight, flaskRadiusAt, flaskLiquidProfile, flaskInnerRadiusAt, FLASK_INNER_PROFILE, FLASK_GLASS_PROFILE, FLASK_BOTTOM, FLASK_BODY_HEIGHT, LIQUID_CLEARANCE, VESSEL_LAYOUT } from '../src/ui/vesselModel.js';
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
  const large = buildVesselModel({ ...state, result: { totalVolumeMl: 1000, pH: 12, excess: { species: 'OH⁻' } } }, { indicatorName: 'phenolphthalein' });
  assert.equal(large.flaskFraction, 0.85);
  assert.ok(large.pinkStrength > 0.6);
});

test('3D: geometric liquid height conserves the rounded flask volume and increases continuously', () => {
  assert.ok(flaskFillHeight(0) < 1e-8);
  assert.ok(Math.abs(flaskFillHeight(1) - FLASK_BODY_HEIGHT) < 1e-8);
  let last = 0;
  for (const fraction of [0.05, 0.1, 0.25, 0.5, 0.85, 1]) {
    const height = flaskFillHeight(fraction);
    assert.ok(height > last);
    assert.ok(flaskRadiusAt(height) > 0);
    // Independent midpoint integration; the implementation uses exact frustum segments.
    const numericalVolume = (h) => { let sum = 0; const n = 4096; for (let i = 0; i < n; i++) { const worldY = FLASK_BOTTOM + h * (i + 0.5) / n; const j = FLASK_INNER_PROFILE.findIndex(([, y]) => y >= worldY); const [r0, y0] = FLASK_INNER_PROFILE[Math.max(0, j - 1)]; const [r1, y1] = FLASK_INNER_PROFILE[Math.max(1, j)]; const r = r0 + (r1 - r0) * (worldY - y0) / (y1 - y0) - LIQUID_CLEARANCE; sum += r * r * h / n; } return sum; };
    assert.ok(Math.abs(numericalVolume(height) / numericalVolume(FLASK_BODY_HEIGHT) - fraction) < 2e-6);
    last = height;
  }
});

test('3D: shared glass/liquid profile contains every fill and its meniscus, with a closed floor and open neck', () => {
  assert.equal(FLASK_GLASS_PROFILE[0][0], 0); assert.equal(FLASK_GLASS_PROFILE.at(-1)[0], 0);
  assert.equal(FLASK_INNER_PROFILE.at(-1)[1], VESSEL_LAYOUT.rimY);
  assert.ok(FLASK_BOTTOM - FLASK_INNER_PROFILE[0][1] > 0 && FLASK_BOTTOM - FLASK_INNER_PROFILE[0][1] < 0.003);
  for (const fraction of [0.0001, 0.01, 0.1, 0.25, 0.5, 0.85]) {
    const height = flaskFillHeight(fraction);
    const profile = flaskLiquidProfile(height);
    for (const [radius, y] of profile) { assert.ok(radius <= flaskInnerRadiusAt(y) - LIQUID_CLEARANCE + 1e-10); assert.ok(y >= FLASK_BOTTOM && y < VESSEL_LAYOUT.rimY); }
    // The concave meniscus edge rises by .007 but stays inside the wall.
    assert.ok(flaskRadiusAt(height) * 1.006 < flaskInnerRadiusAt(FLASK_BOTTOM + height + 0.007));
  }
});

test('3D: stand clears flask, outlet aligns with its opening and buret scale covers its liquid column', () => {
  const l = VESSEL_LAYOUT; const flaskLeft = l.axisX - Math.max(...FLASK_GLASS_PROFILE.map(([r]) => r));
  assert.ok(flaskLeft - (l.rodX + l.baseWidth / 2) > 0.15);
  assert.ok(l.tipY - l.rimY > 0.15 && l.tipY - l.rimY < 0.4);
  assert.ok(l.buretLiquidRadius < l.buretInnerRadius);
  const fullY = l.buretBottom + (l.buretTop - l.buretBottom) * buildVesselModel(null).buretFraction;
  assert.equal(fullY, l.buretTop);
  const empty = buildVesselModel({ initialBuretVolumeMl: 50, initialAddedVolumeMl: 0, addedVolumeMl: 50 }); assert.equal(empty.buretFraction, 0);
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
    const view = initVesselView({ root: { querySelector: (selector) => selector === '[data-vessel-3d]' ? stage : null }, loadScene: () => { loads += 1; return new Promise((resolve) => { resolveModule = resolve; }); } });
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

test('3D: initial sample preview follows inputs, without indicator all pH values stay colorless', () => {
  for (const sampleMl of [10, 25, 75]) {
    const m = buildVesselModel(null, { sampleMl, buretMl: 35 });
    assert.equal(m.totalMl, sampleMl); assert.equal(m.remainingMl, 35); assert.equal(m.addedMl, 0); assert.equal(m.pinkStrength, 0);
  }
  for (const pH of [1, 7, 9, 13]) assert.equal(buildVesselModel({ result: { pH, totalVolumeMl: 25 } }).pinkStrength, 0);
  assert.ok(buildVesselModel({ result: { pH: 13, totalVolumeMl: 25 } }, { indicatorName: 'phenolphthalein' }).pinkStrength > .6);
});

test('3D: only an actual single dispensed volume step emits a drop', () => {
  const previous = buildVesselModel(evaluated(createSimulationState(input, { dropSizeMl: .1 }).state));
  const next = { ...previous, dropCount: 1, addedMl: .1, remainingMl: 49.9 };
  assert.equal(hasDispensedDrop(previous, next), true);
  for (const fake of [previous, { ...next, addedMl: 0 }, { ...next, remainingMl: 50 }, { ...next, dropCount: 20 }, { ...previous, pH: 13 }]) assert.equal(hasDispensedDrop(previous, fake), false);
});
