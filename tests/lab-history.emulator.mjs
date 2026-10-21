import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const modulePath = process.env.RULES_TEST_MODULE;
const { initializeTestEnvironment, assertSucceeds, assertFails } = await import(modulePath ? pathToFileURL(modulePath).href : '@firebase/rules-unit-testing');
const oldRules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const candidateRules = await readFile(new URL('../docs/firestore-history.rules', import.meta.url), 'utf8');
test('History Emulator: existing Rules permit cross-namespace create; proposed Rules deny it', async () => {
  for (const [suffix, rules, expectDenied] of [['old', oldRules, false], ['candidate', candidateRules, true]]) {
    const env = await initializeTestEnvironment({ projectId: 'demo-lab-' + suffix, firestore: { host: '127.0.0.1', port: 8085, rules } });
    try {
      const alice = env.authenticatedContext('alice').firestore(); const bob = env.authenticatedContext('bob').firestore(); const guest = env.unauthenticatedContext().firestore();
      const payload = { uid: 'alice', input: { version: 1, simulation: { values: { pairId: 'hcl-naoh' } } }, modelVersion: 'lab-session-v1', createdAt: 1, updatedAt: 1 };
      await assertSucceeds(alice.doc('users/alice/savedExperiments/one').set(payload));
      await assertSucceeds(alice.doc('users/alice/savedExperiments/one').get());
      await assertFails(bob.doc('users/alice/savedExperiments/one').get());
      await assertFails(bob.doc('users/alice/savedExperiments/one').delete());
      await assertFails(guest.doc('users/alice/savedExperiments/one').get());
      await assertFails(alice.doc('users/alice/savedExperiments/one').update({ uid: 'bob' }));
      const crossNamespace = alice.doc('users/bob/savedExperiments/foreign').set(payload);
      if (expectDenied) await assertFails(crossNamespace); else await assertSucceeds(crossNamespace);
      await assertSucceeds(alice.doc('users/alice/savedExperiments/one').delete());
    } finally { await env.cleanup(); }
  }
});
