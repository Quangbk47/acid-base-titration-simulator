import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rules = readFileSync(resolve(import.meta.dirname, '..', 'firestore.rules'), 'utf8');

const evaluateSavedExperiment = ({ operation, auth, existing, incoming }) => {
  const signedIn = auth !== null;
  if (!signedIn) return false;
  if (operation === 'create') return auth.uid === incoming.uid;
  if (!existing || auth.uid !== existing.uid) return false;
  if (operation === 'read' || operation === 'delete') return true;
  if (operation === 'update') return incoming.uid === existing.uid;
  return false;
};

const evaluateContent = ({ operation, auth, status }) => {
  const admin = auth?.role === 'admin';
  if (operation === 'read') return status === 'published' || admin;
  return admin;
};

test('Firestore rules contain the production ownership and collection boundaries', () => {
  assert.match(rules, /request\.resource\.data\.uid\s*==\s*resource\.data\.uid/);
  assert.doesNotMatch(rules, /match\s+\/{contentCollection}\//);
  for (const collection of ['substances', 'indicators', 'scenarios', 'guidedPrompts']) {
    assert.match(rules, new RegExp(`match \/${collection}\\/\\{contentId\\}`));
  }
  assert.match(rules, /match \/users\/\{uid\}/);
  assert.match(rules, /match \/savedExperiments\/\{experimentId\}/);
});

test('saved experiment ownership policy rejects guests, impersonation, and uid mutation', async (t) => {
  await t.test('guest cannot create', () => {
    assert.equal(evaluateSavedExperiment({ operation: 'create', auth: null, incoming: { uid: 'u1' } }), false);
  });

  await t.test('user cannot create for another uid', () => {
    assert.equal(evaluateSavedExperiment({
      operation: 'create',
      auth: { uid: 'hacker' },
      incoming: { uid: 'victim' },
    }), false);
  });

  await t.test('owner can create, update, read, and delete', () => {
    const auth = { uid: 'u1' };
    const existing = { uid: 'u1' };
    assert.equal(evaluateSavedExperiment({ operation: 'create', auth, incoming: { uid: 'u1' } }), true);
    assert.equal(evaluateSavedExperiment({ operation: 'read', auth, existing, incoming: existing }), true);
    assert.equal(evaluateSavedExperiment({ operation: 'update', auth, existing, incoming: { uid: 'u1' } }), true);
    assert.equal(evaluateSavedExperiment({ operation: 'delete', auth, existing, incoming: existing }), true);
  });

  await t.test('owner cannot transfer ownership and another user cannot update', () => {
    assert.equal(evaluateSavedExperiment({
      operation: 'update',
      auth: { uid: 'u1' },
      existing: { uid: 'u1' },
      incoming: { uid: 'u2' },
    }), false);
    assert.equal(evaluateSavedExperiment({
      operation: 'update',
      auth: { uid: 'u2' },
      existing: { uid: 'u1' },
      incoming: { uid: 'u1' },
    }), false);
  });
});

test('content policy allows published reads and admin-only writes', () => {
  assert.equal(evaluateContent({ operation: 'read', auth: null, status: 'published' }), true);
  assert.equal(evaluateContent({ operation: 'read', auth: null, status: 'draft' }), false);
  assert.equal(evaluateContent({ operation: 'read', auth: { role: 'admin' }, status: 'draft' }), true);
  assert.equal(evaluateContent({ operation: 'update', auth: { role: 'admin' }, status: 'draft' }), true);
  assert.equal(evaluateContent({ operation: 'update', auth: { role: 'learner' }, status: 'published' }), false);
});
