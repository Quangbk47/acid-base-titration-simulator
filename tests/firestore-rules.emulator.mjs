import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-acid-base-titration',
    firestore: {
      rules: await readFile(resolve(import.meta.dirname, '..', 'firestore.rules'), 'utf8'),
    },
  });
});

test.after(async () => {
  await testEnv?.cleanup();
});

test('saved experiment rules enforce owner-only access and immutable uid', async () => {
  const owner = testEnv.authenticatedContext('owner').firestore();
  const other = testEnv.authenticatedContext('other').firestore();
  const guest = testEnv.unauthenticatedContext().firestore();
  const path = 'users/owner/savedExperiments/one';
  const snapshot = {
    uid: 'owner',
    input: { system: 'hcl-naoh' },
    modelVersion: 'strong-strong-v1',
    createdAt: 1,
  };

  await assertSucceeds(owner.doc(path).set(snapshot));
  await assertSucceeds(owner.doc(path).get());
  await assertSucceeds(owner.doc(path).update({ ...snapshot, updatedAt: 2 }));
  await assertFails(owner.doc(path).update({ ...snapshot, uid: 'other' }));
  await assertFails(other.doc(path).get());
  await assertFails(other.doc(path).update({ ...snapshot, updatedAt: 3 }));
  await assertFails(guest.doc(path).get());
  await assertFails(guest.doc('users/guest/savedExperiments/one').set(snapshot));
});

test('content rules expose only published documents and restrict writes to admins', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('users/admin').set({ role: 'admin' });
    await context.firestore().doc('substances/published').set({ status: 'published' });
    await context.firestore().doc('substances/draft').set({ status: 'draft' });
  });

  const guest = testEnv.unauthenticatedContext().firestore();
  const learner = testEnv.authenticatedContext('learner').firestore();
  const admin = testEnv.authenticatedContext('admin').firestore();
  await assertSucceeds(guest.doc('substances/published').get());
  await assertFails(guest.doc('substances/draft').get());
  await assertFails(guest.doc('misc/public').get());
  await assertFails(learner.doc('substances/published').set({ status: 'published' }));
  await assertSucceeds(admin.doc('substances/draft').update({ status: 'published' }));
});
