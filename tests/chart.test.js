import assert from 'node:assert/strict';
import test from 'node:test';
import { renderChart } from '../src/ui/chartView.js';
import { indicatorState } from '../src/ui/indicatorView.js';

class Element {
  constructor() { this.children = []; this.attributes = new Map(); }
  replaceChildren() { this.children = []; }
  append(child) { this.children.push(child); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

test('UI-03: chart keeps a current-point marker after rendering its history', () => {
  const svg = new Element(); const table = new Element();
  globalThis.document = { querySelector: (selector) => selector === '[data-chart-svg]' ? svg : selector === '[data-chart-body]' ? table : null, createElementNS: () => new Element(), createElement: () => new Element() };
  renderChart([{ volumeMl: 0, pH: 2.88, stage: 'before-equivalence' }, { volumeMl: 12.5, pH: 4.74, stage: 'before-equivalence' }], { halfEqMl: 12.5, equivalenceMl: 25, endpointMl: 25.1 });
  assert.equal(svg.children.some((child) => child.attributes.get('data-current-point') === 'true'), true);
  delete globalThis.document;
});

test('CHEM-06 UI: phenolphthalein follows equilibrium pH boundaries', () => {
  assert.equal(indicatorState({ pH: 8.19 }).color, 'clear');
  assert.equal(indicatorState({ pH: 8.2 }).color, 'pink-transition');
  assert.equal(indicatorState({ pH: 10 }).color, 'pink');
});
