import assert from 'node:assert/strict';
import test from 'node:test';
import { titrationKnowledge } from '../src/data/learningContent.js';
import { initNavigation } from '../src/ui/navigation.js';

test('Phase 5 knowledge content distinguishes equivalence point and endpoint', () => {
  assert.equal(titrationKnowledge.concepts.length, 3);
  assert.match(titrationKnowledge.concepts[0].description, /tỉ lượng/);
  assert.match(titrationKnowledge.concepts[1].emphasis, /không bắt buộc trùng khít/);
  assert.match(titrationKnowledge.example.note, /không áp dụng cho mọi hệ/);
});

test('Phase 5 content describes curve regions and the configured indicator range', () => {
  assert.equal(titrationKnowledge.curveRegions.length, 5);
  assert.match(titrationKnowledge.curveRegions[2].description, /pKa/);
  assert.match(titrationKnowledge.indicator.description, /8,2–10,0/);
  assert.equal(titrationKnowledge.checks.length, 3);
});

test('knowledge route is selectable and receives the current-page state', () => {
  const attributes = new Map();
  const link = { dataset: { route: 'knowledge' }, setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key) };
  const view = { dataset: { view: 'knowledge' }, hidden: true };
  assert.equal(initNavigation({ links: [link], views: [view], pathname: '/knowledge' }), 'knowledge');
  assert.equal(view.hidden, false);
  assert.equal(attributes.get('aria-current'), 'page');
});
