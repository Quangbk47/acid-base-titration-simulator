import assert from 'node:assert/strict';
import test from 'node:test';
import { titrationKnowledge } from '../src/data/learningContent.js';
import { initNavigation } from '../src/ui/navigation.js';

test('Phase 5 content distinguishes equivalence, endpoint, and curve', () => {
  assert.equal(titrationKnowledge.concepts.length, 3);
  assert.match(titrationKnowledge.concepts[0].description, /tỉ lượng/);
  assert.match(titrationKnowledge.concepts[1].emphasis, /không bắt buộc trùng/);
  assert.match(titrationKnowledge.indicator.description, /8,2–10,0/);
});

test('Phase 5 records model limits and all curve regions', () => {
  assert.equal(titrationKnowledge.curveRegions.length, 5);
  assert.equal(titrationKnowledge.modelLimits.length, 3);
  assert.match(titrationKnowledge.modelLimits[2].description, /deferred/);
});

test('knowledge route receives current-page navigation state', () => {
  const attributes = new Map();
  const link = { dataset: { route: 'knowledge' }, setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key) };
  const view = { dataset: { view: 'knowledge' }, hidden: true };
  assert.equal(initNavigation({ links: [link], views: [view], pathname: '/knowledge' }), 'knowledge');
  assert.equal(view.hidden, false);
  assert.equal(attributes.get('aria-current'), 'page');
});
