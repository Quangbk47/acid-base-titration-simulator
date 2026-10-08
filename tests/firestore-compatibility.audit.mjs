// Observes current vs review-only rules on synthetic fixtures. It does not
// relax the separate security gate or claim that allowed legacy writes are safe.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
const root = process.env.SECURITY_REPO_ROOT ?? resolve(import.meta.dirname, '..');
const output = join(root, 'tmp/security-audit/followup');
assert.match(process.env.FIRESTORE_EMULATOR_HOST ?? '', /^(127\.0\.0\.1|localhost):\d+$/);
const { validateSavedExperiment, createExperimentRepository } = await import(pathToFileURL(join(root, 'src/firebase/repository.js')).href);
const { solveStrongStrong, solveWeakAcidStrongBase, solveWeakBaseStrongAcid } = await import(pathToFileURL(join(root, 'src/chemistry/index.js')).href);
const cases = [
  ['hcl-naoh', solveStrongStrong, { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0.025, temperature: 298.15 }],
  ['ch3cooh-naoh', solveWeakAcidStrongBase, { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0.025, Ka: 1.8e-5, temperature: 298.15 }],
  ['nh3-hcl', solveWeakBaseStrongAcid, { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15 }],
];
const snapshots = cases.map(([system, solve, input]) => {
  const result = solve(input);
  assert.ok(!result.error);
  const snapshot = { input: { system, ...input }, modelVersion: result.modelVersion, currentAddedVolumeMl: 25, currentStage: result.stage, summary: { pH: result.pH } };
  assert.equal(validateSavedExperiment(snapshot), true);
  return { system, snapshot };
});
const result = { scope: 'synthetic fixtures only; no production data inspected', snapshots: snapshots.map(({ system, snapshot }) => ({ system, clientValid: true, modelVersion: snapshot.modelVersion, fields: Object.keys(snapshot) })), observations: [], clientQuota: null };
let calls = 0;
const repository = createExperimentRepository({ create: async () => { calls += 1; return 'mock-id'; } });
for (let index = 0; index < 51; index += 1) await repository.create('compat-owner', snapshots[0].snapshot);
result.clientQuota = { advertisedLimit: repository.maxSavedExperiments, mockWritesAccepted: calls, enforcementImplemented: calls <= 50 };
for (const variant of ['current', 'draft']) {
  const rulesPath = variant === 'current' ? join(root, 'firestore.rules') : join(root, 'tmp/security-audit/proposed-firestore.rules');
  const env = await initializeTestEnvironment({ projectId: `demo-acid-base-compat-${variant}`, firestore: { rules: await readFile(rulesPath, 'utf8') } });
  const observe = async (id, expectedAllowed, operation, reason) => {
    let allowed = false;
    try { await operation(); allowed = true; }
    catch (error) { if (error.code !== 'permission-denied') throw error; }
    result.observations.push({ variant, id, allowed, expectedAllowed, matchesAnalyzedBehavior: allowed === expectedAllowed, reason });
    assert.equal(allowed, expectedAllowed, `${variant}: ${id}`);
  };
  try {
    const owner = env.authenticatedContext('compat-owner').firestore();
    const other = env.authenticatedContext('compat-other').firestore();
    const guest = env.unauthenticatedContext().firestore();
    const collection = 'users/compat-owner/savedExperiments';
    const minimal = { uid: 'compat-owner', input: snapshots[0].snapshot.input, modelVersion: snapshots[0].snapshot.modelVersion, createdAt: 1 };
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.doc(`${collection}/legacy-malformed`).set({ ...minimal, input: 'legacy-text' });
      await db.doc(`${collection}/legacy-missing-uid`).set({ input: minimal.input, modelVersion: minimal.modelVersion });
      await db.doc('users/compat-other/savedExperiments/wrong-path').set(minimal);
      await db.doc('users/compat-owner').set({ role: 'learner', displayName: 'Learner' });
      await db.doc('users/compat-admin-fixture').set({ role: 'admin' });
      await db.doc('scenarios/draft').set({ status: 'draft', payload: {} });
    });
    for (const { system, snapshot } of snapshots) {
      const wire = { uid: 'compat-owner', input: snapshot.input, modelVersion: snapshot.modelVersion, createdAt: 1 };
      const doc = owner.doc(`${collection}/${system}`);
      await observe(`${system}-minimal-create`, true, () => doc.set(wire), 'Current rule-supported wire format; not the complete repository snapshot');
      await observe(`${system}-minimal-read`, true, () => doc.get(), 'Correct path and data UID');
      await observe(`${system}-minimal-update`, true, () => doc.update({ updatedAt: 2 }), 'Allowed metadata update');
      await observe(`${system}-outsider-read`, false, () => other.doc(doc.path).get(), 'Owner-only reads');
      await observe(`${system}-outsider-update`, false, () => other.doc(doc.path).update({ updatedAt: 3 }), 'Owner-only updates');
      await observe(`${system}-outsider-delete`, false, () => other.doc(doc.path).delete(), 'Owner-only deletes');
      await observe(`${system}-guest-read`, false, () => guest.doc(doc.path).get(), 'Authentication required');
      await observe(`${system}-full-repository-create`, false, () => owner.doc(`${collection}/${system}-full`).set({ uid: 'compat-owner', ...snapshot, createdAt: 1 }), 'Both rules exclude currentAddedVolumeMl, currentStage and summary');
      await observe(`${system}-minimal-delete`, true, () => doc.delete(), 'Owner can remove own document');
    }
    await observe('legacy-malformed-read', true, () => owner.doc(`${collection}/legacy-malformed`).get(), 'Draft read does not enforce write schema');
    await observe('legacy-malformed-update', variant === 'current', () => owner.doc(`${collection}/legacy-malformed`).update({ updatedAt: 2 }), 'Draft intentionally validates the entire resulting document on update');
    await observe('legacy-malformed-delete', true, () => owner.doc(`${collection}/legacy-malformed`).delete(), 'Delete does not require write-schema validity');
    await observe('missing-uid-read', false, () => owner.doc(`${collection}/legacy-missing-uid`).get(), 'Both policies require stored UID, even when path is own');
    await observe('missing-uid-delete', false, () => owner.doc(`${collection}/legacy-missing-uid`).delete(), 'Existing defect/contract mismatch, not a new draft restriction');
    const cross = owner.doc('users/compat-other/savedExperiments/wrong-path');
    await observe('wrong-path-read', variant === 'current', () => cross.get(), 'Draft adds path UID requirement');
    await observe('wrong-path-update', variant === 'current', () => cross.update({ updatedAt: 2 }), 'Draft adds path UID requirement');
    await observe('wrong-path-delete', variant === 'current', () => cross.delete(), 'Draft adds path UID requirement, including deleting own-data UID in wrong namespace');
    await observe('correct-path-owner-list-unfiltered', false, () => owner.collection(collection).get(), 'Rules are not filters; resource UID requires constrained query');
    await observe('correct-path-owner-list-uid-filter', true, () => owner.collection(collection).where('uid', '==', 'compat-owner').get(), 'Query UID matches auth and path');
    await observe('profile-null-fields-update', true, () => owner.doc('users/compat-owner').update({ displayName: null, photoURL: null }), 'Google profile fields may be null');
    await observe('profile-valid-url-update', true, () => owner.doc('users/compat-owner').update({ displayName: 'Learner', photoURL: 'https://example.invalid/avatar.png' }), 'Valid string/photo URL compatibility');
    await observe('profile-name-257-update', variant === 'current', () => owner.doc('users/compat-owner').update({ displayName: 'a'.repeat(257) }), 'Draft introduces a new 256-character policy limit');
    await observe('model-version-81-create', variant === 'current', () => owner.doc(`${collection}/long-model`).set({ ...minimal, modelVersion: 'v'.repeat(81) }), 'Client validator has no length cap; draft introduces 80');
    await observe('input-missing-numbers-create', true, () => owner.doc(`${collection}/missing-input`).set({ ...minimal, input: { system: 'hcl-naoh' } }), 'Draft validates present fields only; complete input schema is still missing');
    await observe('input-invalid-ka-create', true, () => owner.doc(`${collection}/bad-ka`).set({ ...minimal, input: { ...snapshots[1].snapshot.input, Ka: NaN } }), 'Draft does not validate Ka');
    await observe('input-invalid-kb-create', true, () => owner.doc(`${collection}/bad-kb`).set({ ...minimal, input: { ...snapshots[2].snapshot.input, Kb: Infinity } }), 'Draft does not validate Kb');
    await observe('input-invalid-temperature-create', true, () => owner.doc(`${collection}/bad-temperature`).set({ ...minimal, input: { ...minimal.input, temperature: 0 } }), 'Draft does not validate temperature');
    const admin = env.authenticatedContext('compat-admin-fixture').firestore();
    await observe('admin-draft-read', true, () => admin.doc('scenarios/draft').get(), 'Content role policy unchanged');
    await observe('learner-draft-read', false, () => owner.doc('scenarios/draft').get(), 'Draft content remains protected');
    await observe('admin-content-create', true, () => admin.doc('scenarios/admin-created').set({ status: 'published' }), 'Admin CRUD unchanged');
    await observe('admin-content-delete', true, () => admin.doc('scenarios/admin-created').delete(), 'Admin CRUD unchanged');
  } finally { await env.cleanup(); }
}
await mkdir(output, { recursive: true });
await writeFile(join(output, 'compatibility-results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ observations: result.observations.length, matchesAnalyzedBehavior: result.observations.every((row) => row.matchesAnalyzedBehavior), clientQuota: result.clientQuota, notice: 'Observation suite success does not mean security or schema compatibility gate PASS.' }, null, 2));
