// Audit actual rules on a demo emulator only. Baseline mode records known gaps;
// default mode fails on any unexpected allow/deny and is the regression gate.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
const projectId = 'demo-acid-base-security-audit';
const env = await initializeTestEnvironment({ projectId, firestore: { rules: await readFile(process.env.SECURITY_RULES_PATH ?? resolve(import.meta.dirname, '..', 'firestore.rules'), 'utf8') } });
const results = [];
const probe = async (id, expectedAllowed, operation) => {
  let allowed = false;
  try { await operation(); allowed = true; }
  catch (error) { if (error.code !== 'permission-denied') throw error; }
  results.push({ id, expectedAllowed, allowed, pass: allowed === expectedAllowed });
};
try {
  const alice = env.authenticatedContext('audit-alice').firestore();
  const bob = env.authenticatedContext('audit-bob').firestore();
  const guest = env.unauthenticatedContext().firestore();
  const claimAdmin = env.authenticatedContext('audit-claim-admin', { role: 'admin' }).firestore();
  const admin = env.authenticatedContext('audit-fixture-admin').firestore();
  const alicePath = 'users/audit-alice/savedExperiments/one';
  const snapshot = { uid: 'audit-alice', input: { system: 'hcl-naoh', Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0 }, modelVersion: 'strong-strong-v1', createdAt: 1 };
  // This admin is a disposable fixture inside a demo emulator, never an Auth account.
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.doc('users/audit-fixture-admin').set({ role: 'admin' });
    for (const collection of ['substances', 'indicators', 'scenarios', 'guidedPrompts']) {
      await db.doc(`${collection}/published`).set({ status: 'published' });
      await db.doc(`${collection}/draft`).set({ status: 'draft' });
    }
  });
  await probe('profile-create-self-learner', true, () => alice.doc('users/audit-alice').set({ role: 'learner', displayName: 'Alice' }));
  await probe('profile-read-self', true, () => alice.doc('users/audit-alice').get());
  await probe('profile-other-read-denied', false, () => bob.doc('users/audit-alice').get());
  await probe('profile-guest-read-denied', false, () => guest.doc('users/audit-alice').get());
  await probe('profile-create-admin-denied', false, () => bob.doc('users/audit-bob').set({ role: 'admin' }));
  await probe('profile-update-role-denied', false, () => alice.doc('users/audit-alice').update({ role: 'admin' }));
  await probe('profile-extra-field-denied', false, () => alice.doc('users/audit-alice').update({ admin: true }));
  await probe('profile-malformed-fields-denied', false, () => alice.doc('users/audit-alice').update({ displayName: { invalid: true }, photoURL: 'javascript:alert(1)' }));
  await probe('profile-other-write-denied', false, () => bob.doc('users/audit-alice').update({ displayName: 'tampered' }));
  await probe('profile-delete-denied', false, () => alice.doc('users/audit-alice').delete());
  await probe('saved-create-self', true, () => alice.doc(alicePath).set(snapshot));
  await probe('saved-read-self', true, () => alice.doc(alicePath).get());
  await probe('saved-update-self', true, () => alice.doc(alicePath).update({ updatedAt: 2 }));
  await probe('saved-change-owner-denied', false, () => alice.doc(alicePath).update({ uid: 'audit-bob' }));
  await probe('saved-other-read-denied', false, () => bob.doc(alicePath).get());
  await probe('saved-other-write-denied', false, () => bob.doc(alicePath).update({ input: {} }));
  await probe('saved-other-delete-denied', false, () => bob.doc(alicePath).delete());
  await probe('saved-guest-read-denied', false, () => guest.doc(alicePath).get());
  await probe('saved-guest-create-denied', false, () => guest.doc(alicePath).set(snapshot));
  await probe('saved-extra-field-denied', false, () => alice.doc(alicePath).update({ isAdmin: true }));
  await probe('saved-impersonate-owner-denied', false, () => bob.doc('users/audit-bob/savedExperiments/forged').set(snapshot));
  await probe('saved-cross-path-create-denied', false, () => bob.doc('users/audit-alice/savedExperiments/cross-path').set({ ...snapshot, uid: 'audit-bob' }));
  await probe('saved-malformed-input-denied', false, () => alice.doc('users/audit-alice/savedExperiments/malformed').set({ ...snapshot, input: 'not-an-object', modelVersion: 123 }));
  await probe('saved-nonfinite-chemistry-denied', false, () => alice.doc('users/audit-alice/savedExperiments/nonfinite').set({ ...snapshot, input: { ...snapshot.input, Ca: NaN, Cb: Infinity } }));
  for (const collection of ['substances', 'indicators', 'scenarios', 'guidedPrompts']) {
    await probe(`${collection}-published-guest`, true, () => guest.doc(`${collection}/published`).get());
    await probe(`${collection}-draft-guest-denied`, false, () => guest.doc(`${collection}/draft`).get());
    await probe(`${collection}-draft-learner-denied`, false, () => alice.doc(`${collection}/draft`).get());
    await probe(`${collection}-learner-create-denied`, false, () => alice.doc(`${collection}/new`).set({ status: 'published' }));
    await probe(`${collection}-learner-update-denied`, false, () => alice.doc(`${collection}/published`).update({ status: 'draft' }));
    await probe(`${collection}-learner-delete-denied`, false, () => alice.doc(`${collection}/published`).delete());
    await probe(`${collection}-forged-claim-denied`, false, () => claimAdmin.doc(`${collection}/draft`).get());
    await probe(`${collection}-admin-read`, true, () => admin.doc(`${collection}/draft`).get());
    await probe(`${collection}-admin-write`, true, () => admin.doc(`${collection}/draft`).update({ status: 'published' }));
    await probe(`${collection}-guest-unfiltered-query-denied`, false, () => guest.collection(collection).get());
    await probe(`${collection}-guest-published-query`, true, () => guest.collection(collection).where('status', '==', 'published').get());
  }
  await probe('unmatched-collection-denied', false, () => alice.doc('misc/one').set({ status: 'published' }));
  await probe('saved-delete-self', true, () => alice.doc(alicePath).delete());
  // Check the advertised quota without large writes or touching production.
  const quotaDb = env.authenticatedContext('audit-quota-user').firestore();
  const quotaSnapshot = { ...snapshot, uid: 'audit-quota-user' };
  const batch = quotaDb.batch();
  for (let i = 0; i < 50; i += 1) batch.set(quotaDb.doc(`users/audit-quota-user/savedExperiments/quota-${i}`), quotaSnapshot);
  await batch.commit();
  await probe('saved-quota-51-denied', false, () => quotaDb.doc('users/audit-quota-user/savedExperiments/quota-50').set(quotaSnapshot));
  const findings = results.filter((result) => !result.pass);
  const report = { projectId, mode: process.env.SECURITY_AUDIT_BASELINE === '1' ? 'baseline' : 'regression', checks: results.length, passed: results.length - findings.length, findings, results };
  const output = process.env.SECURITY_AUDIT_OUTPUT ?? resolve('tmp/security-audit/firestore-results.json');
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
  if (process.env.SECURITY_AUDIT_BASELINE !== '1') assert.equal(findings.length, 0, 'Rules security findings remain; see audit output');
} finally { await env.cleanup(); }
