# Phase 2 clean branch closeout

## Identity

- Branch: `fix/phase-2-clean-closeout`
- Base: `origin/main` at `ceeb17ab58edb3fd20e9ec26123906a7fe7abefd`
- HEAD: `cc4d41fca0065cb8d5ddab40ad0d0c41e6c023e7`
- PR: `#5 — feat: close phase 2 simulation and experiment UI`
- PR state: `OPEN`; head `fix/phase-2-clean-closeout`; base `main`
- Current status: `READY FOR REVIEW / READY TO CLOSE`

## Scope

- SIM-01, SIM-02, SIM-03
- UI-01, UI-02, UI-03
- CHEM-06

## Verification

- Phase 2 tests: **15/15 PASS**
- Full test suite: **41/41 PASS**
- Lint: **PASS**, 38 JavaScript files
- Format: **PASS**, 21 files
- `git diff --check`: **PASS**
- Runtime local preview: submit, add-drop, speed, run, pause, resume, reset
  and chart flow PASS. Final observed state: Paused, 0.15 mL, pH 1.01,
  13 chart rows.
- Console: no new warnings/errors in the final runtime flow.
- Chemistry consistency: UI and runner use the same
  `addedVolumeMl`/`chemistryInput.Vb` path and the Phase 1 solver.

## Responsive and accessibility evidence

- Recorded responsive browser smoke checked 320/375/430/768/1366 px with no
  horizontal overflow; mobile layout is one column. Historical acceptance
  evidence additionally records 360/1280 px at `e6ffd10`.
- Recorded local peer/runtime evidence covers `/`, `/simulate`, required
  controls, graph data, chemistry state, add/run/pause/reset interaction and
  no console/page errors at the recorded SHA.
- Accessible labels, form fields, ARIA error attributes and the chart data-table
  alternative are implemented and partly covered by tests.
- Keyboard focus and complete manual accessibility review: **CONFIRMED** on
  the current HEAD below. The historical peer report has blank manual fields,
  but this review was performed directly on PR #5 implementation.
- Reduced-motion: **CONFIRMED / reusable historical evidence**. At
  `e6ffd10c43e9b2627f640e19a5dec95329ffdaff` (`2026-09-07`, Windows + Edge),
  Windows Animation effects were Off, `matchMedia('(prefers-reduced-motion:
  reduce)').matches` returned `true`, and submit/add-drop/run/pause/resume/reset
  remained functional with near-zero buret/drop motion. The relevant
  `assets/styles.css` is identical at that evidence commit and PR #5; `src/app.js`
  differs only in trailing whitespace. This is manual developer evidence, not
  peer or PO acceptance.

## Historical evidence audit

- `docs/PEER_RUN_REPORT.md`, recorded at `cf5f2772e51c25b62205c3b2dc18f6272d65075a`
  on `2026-09-06`, reports `/`, `/simulate`, controls, graph, chemistry state,
  interaction and console checks PASS. The report was committed by
  `Noname000-Zero`, but its manual keyboard/accessibility fields are blank and
  the Phase 2 UI/simulation files changed materially before PR #5. Peer evidence
  status for this PR: **STALE / RECHECK**.
- `da0f9905a7d33722ba6ff2c51c9f648ef2be9297` records Phase 2 responsive runtime
  and reduced-motion acceptance on the Phase 3 branch. It is not an ancestor of
  this clean branch, but the reduced-motion CSS/behavior evidence was compared
  against PR #5 and is reusable as documented above.
- No historical manual keyboard focus/tab/no-trap evidence was found. CSS
  `:focus-visible`, labels, ARIA attributes and the chart table are implementation
  evidence only, not a completed manual gate.

## Manual keyboard and accessibility review — current HEAD

- Date: `2026-09-08`
- HEAD reviewed: `632a08939e08cb63edb502922f1a1390ea87349d`
- Branch: `fix/phase-2-clean-closeout`
- PR: `#5`
- Browser: Codex In-app Browser (Chromium-based)
- OS: Windows (version not exposed by the browser harness)
- URL: `http://localhost:4173/simulate`
- Method: real browser keyboard interaction; no mouse used after browser/preview
  startup.
- Result: keyboard manual review **PASS**; manual accessibility review
  **PASS**.

### Keyboard checklist

- Tab order through navigation, selectors, fields, simulation controls, speed
  and guided controls: **PASS**.
- Visible focus ring: **PASS**, observed on focused simulation controls.
- Edit form input by keyboard: **PASS**.
- Submit with Enter: **PASS**, status changed to `Ready` and simulation data
  rendered.
- Add Drop with Space: **PASS**, volume changed from 0.00 to 0.05 mL.
- Run with Enter: **PASS**, status changed to `Running`.
- Pause with Space: **PASS**, status changed to `Paused`.
- Resume with Enter: **PASS**, status changed to `Running`.
- Reset with Space: **PASS**, state returned to `Ready` and 0.00 mL.
- Speed selector with keyboard arrows/Enter: **PASS**, value changed to `Nhanh`.
- Shift+Tab reverse traversal: **PASS**.
- Keyboard trap or mouse-only critical control: **PASS**, none observed.

### Accessibility checklist

- Clear input labels: **PASS**.
- Understandable accessible names for buttons/controls: **PASS**.
- Validation error text: **PASS**, error appeared beside the input.
- Focus remained identifiable after validation error: **PASS**.
- ARIA/error presentation: **PASS** for the observed field error state.
- Status communicated as text, not color only: **PASS** (`Ready`, `Running`,
  `Paused`, and corresponding vessel status text).
- pH, volume, stage and species communicated as text: **PASS**.
- Chart has text/data-table alternative: **PASS**.
- Equivalence and endpoint have distinct textual legend/stage information:
  **PASS**.
- Important information dependent only on color/animation: **PASS**, no
  obvious blocker observed.
- Obvious accessibility blocker: **NONE OBSERVED**.

## Scope exclusions

- Phase 3 solver, Guided prompts and report work
- NH3–HCl
- Firebase/Auth/Firestore/Rules/deploy
- Admin/auth/save/load/history
- Unrelated files

## Known issue fixed during closeout

`src/app.js` previously used the old simulation API. Commit `cc4d41f` corrected
the wiring to use the Phase 2 API (`createSimulationState`, `addDrop`,
`createSimulationRunner`, `resetSimulation`). Verification above was run after
this fix and passed.

## Open gates

- Peer review/recheck of the current implementation
- PO/GVHD acceptance
- Merge PR #5
- Post-merge verification and final closeout update

Phase 2 must not be marked `CLOSED`, `MERGED`, `VERIFIED` or `PO PASS` before
the corresponding evidence exists.
