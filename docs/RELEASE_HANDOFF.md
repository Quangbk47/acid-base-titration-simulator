# Stable simulator handoff — 2026-10-08

Repository: https://github.com/Quangbk47/acid-base-titration-simulator

Review site: https://acid-base-titration-simulator.web.app

Simulator: https://acid-base-titration-simulator.web.app/simulate

This release is the existing guest titration simulator for instructor review.
It does not add Free Lab/Guided Lab modes or enable Firebase sign-in/cloud saving.
The Three.js experiment, shared simulation state, pH–V chart, chemistry engine
and responsive layout are preserved.

## Release checks

Pre-publication checks on this handoff passed: **94/94 unit tests**, phase
regression **8/8**, demo Firestore integration **2/2**, browser titration and
3D/layout suites, and Hosting HTTP/headers/private-path checks (11 paths).
The initial stable simulator checkpoint is `bed52af619d1e5b763b1338af7972883f7945fcb`;
the final release commit is generated into `/assets/release.json` at build time.

- Run `npm run check`, `npm run audit`, existing Firestore integration tests on
  a demo Emulator, and the browser titration/3D/layout regressions.
- HCl 0.1 M, 25 mL with NaOH 0.1 M at 25°C: equivalence at 25 mL, pH 7;
  flask volume 50 mL, remaining buret volume 25 mL, colorless indicator.
- Verify calculate, add drop, automatic run, pause/reset, camera orbit/zoom/pan,
  eight desktop/mobile viewport widths and WebGL fallback.
- Verify actual Hosting CSP/headers and denied internal paths before publishing.
- Build only `index.html`, allowed browser resources under `assets`/`src`, the
  vendored Three.js license, and generated public release metadata. Frontend JS
  and Firebase web configuration remain public by design. Never publish private
  keys, service accounts, Auth tokens, Git metadata, env files, tests or QA logs.
- `/assets/release.json` records the exact Git commit and SHA-256 of every web
  file. Before deploy, require a clean tree and matching local manifest; after
  deploy, compare the public manifest and served file hashes with the build.

## Deployment scope and recovery

GitHub's workflow runs quality/security checks and builds; it has no Hosting
deploy step. Publishing GitHub does not itself update this Firebase Hosting site.
Use only `firebase deploy --only hosting --project acid-base-titration-simulator`.
Do not deploy Firestore Rules, indexes, Storage Rules, Auth configuration or data.

The pre-existing staged root-Hosting change was preserved as a local patch before
the approved Hosting correction. Builds keep any previous `dist` under ignored
`tmp/build-backups/` instead of deleting it. Before deployment, save the existing
Hosting release/version metadata locally. If public smoke tests fail, stop and
report the issue for the owner to decide; do not automatically change Rules or
restore Firestore data. Hosting release rollback is separate from database policy
and data recovery.

## Limits that remain

- Free Lab and Guided Lab development has not started in this handoff.
- Authentication and cloud persistence are unconfigured skeletons. Firestore
  path/schema/quota findings remain documented in `SECURITY_AUDIT.md`; the expanded
  gate's 66/71 result was not relaxed or presented as a full security PASS.
- Dependency advisories remain in development tooling; the identified Critical
  lockfile package was patched. This is not a claim of absolute security.
- Responsive/touch behavior was tested with browser emulation; physical mobile
  GPU performance and Safari/iOS were not independently verified.
