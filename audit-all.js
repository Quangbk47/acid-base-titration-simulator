import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const phaseSuites = Object.freeze([
  { phase: 'Phase 0', files: ['tests/smoke.test.js'] },
  { phase: 'Phase 1', files: ['tests/chemistry.test.js'] },
  { phase: 'Phase 2', files: ['tests/phase2-ui.test.js', 'tests/simulation.test.js', 'tests/validation.test.js'] },
  { phase: 'Phase 3', files: ['tests/phase3.test.js', 'tests/chem03-reference.test.js'] },
  { phase: 'Phase 4', files: ['tests/phase4.test.js'] },
  { phase: 'Phase 5', files: ['tests/firebase.test.js'] },
  { phase: 'Phase 6', files: ['tests/firestore-rules.test.js'] },
]);

const runPhase = (suite) => {
  const result = spawnSync(process.execPath, ['--test', ...suite.files], {
    cwd: process.cwd(),
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'NODE_TEST_CONTEXT')),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (output) process.stdout.write(`\n[${suite.phase}]\n${output}\n`);
  assert.equal(result.status, 0, `${suite.phase} failed with exit code ${result.status}`);
};

test('Audit all phases 0 through 6', async (t) => {
  for (const suite of phaseSuites) {
    await t.test(suite.phase, () => runPhase(suite));
  }
});
