import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthService, createExperimentRepository, validateFirebaseConfig, validateSavedExperiment } from '../src/firebase/index.js';

test('P4A config requires all public web config fields', () => {
  assert.deepEqual(validateFirebaseConfig({ projectId: 'demo', apiKey: 'key', authDomain: 'demo.firebaseapp.com', storageBucket: 'demo.appspot.com', messagingSenderId: '1', appId: 'app' }), { ok: true, missing: [] });
  assert.equal(validateFirebaseConfig({ projectId: 'demo' }).ok, false);
});

test('P4A auth skeleton stays guest-safe until injected', async () => {
  const auth = createAuthService();
  assert.equal(await auth.currentUser(), null);
  await assert.rejects(auth.signIn(), /AUTH_NOT_CONFIGURED/);
});

test('P4A repository validates saved experiment contract and quota', async () => {
  const snapshot = {
    input: { system: 'weak-acid-strong-base', Ca: 0.1, Va: 0.025, Cb: 0.1, Ka: 1.8e-5, temperature: 298.15 },
    modelVersion: 'weak-acid-strong-base-v1',
    currentAddedVolumeMl: 12.5,
    currentStage: 'before-equivalence',
    summary: { pH: 4.74 },
  };
  assert.equal(validateSavedExperiment(snapshot), true);
  assert.equal(createExperimentRepository().maxSavedExperiments, 50);
  assert.throws(() => validateSavedExperiment({ ...snapshot, modelVersion: 'bad version' }), /INVALID_MODEL_VERSION/);
  assert.throws(() => validateSavedExperiment({ ...snapshot, currentAddedVolumeMl: -1 }), /INVALID_VOLUME/);
});
