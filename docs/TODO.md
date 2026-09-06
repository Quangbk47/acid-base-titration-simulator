# TODO — BACKLOG CÓ THỂ GIAO NGAY

## Phase 0 / Now

- [x] P0-01 Tạo repo public, thêm docs, `.gitignore`, LICENSE/attribution phù hợp.
- [x] P0-02 Tạo HTML/CSS/JS structure đúng ROADMAP section Architecture.
- [x] P0-03 Dựng layout placeholder responsive + accessibility baseline.
- [x] P0-04 Thiết lập lint/format/test command và CI tối thiểu.
- [x] P0-05 Firebase Project ID để trống đúng scope; tạo `DEPLOYMENT_TARGETS.md`; tạo preview local, không production.

## Phase 0 evidence

- Status: `DONE — PO PASS`
- Branch: `feature/phase-0-foundation`
- SHA implementation: `54e665c179ba3520339b27d941b5da3e099fce8e`
- Tests: `npm run check`, `git diff --check`
- Preview: `http://localhost:4173/` và `http://localhost:4173/simulate`

## Phase 1 / CLOSED / DONE — PO PASS

- [x] P1-01 Units/input validation.
- [x] P1-02 HCl–NaOH solver + species/stages/milestones.
- [x] P1-03 Curve generator + standard fixtures.
- [x] P1-04 Unit test CHEM-01/02/05 và peer run.

Evidence: `feature/phase-1-hcl-naoh-chemistry`; `npm run check`,
`git diff --check`; fixture `tests/fixtures/phase1Reference.js`.
PO acceptance: PASS. Phase 1 đã đóng; Phase 2 vẫn `NOT STARTED`.

## Phase 1 hardening / MERGED / CLOSED — PO PASS / GVHD APPROVED

- [x] DEV review lại contract M/L/K, temperature/Kw, tolerance, curve và preview tooling.
- [x] DEV test 16/16 + lint/format/diff check + local browser smoke.
- [x] GVHD/PO trực tiếp cho phép merge PR #1 (`PASS / APPROVED FOR MERGE`).
- [ ] Thành viên thứ hai chạy lại test và ghi bằng chứng (`Peer run: PENDING`).
- [x] PO nghiệm thu đợt hardening (`PO PASS: PASS`) — GVHD đồng thời là PO và
  đã trực tiếp phê duyệt merge PR #1.
- [x] Merge PR #1 và ghi post-merge closeout theo chỉ đạo GVHD.

Evidence: branch `fix/phase1-chemistry-foundation`, PR #1 và `docs/PROGRESS.md`.
Không tick peer run nếu chưa có bằng chứng thật; PO PASS được ghi nhận theo phê
duyệt trực tiếp của GVHD/PO; mục merge được tick theo PR #1 và merge SHA đã xác minh.

Closeout: PR #1 merged tại
`87ba1d17b30e3d383d4bc87046c8d79f57ee70f0`; post-merge local tests và CI PASS.
Peer run vẫn để `PENDING`; PO PASS `PASS`; GVHD approval `PASS`; production
deploy `NO`; Phase 2 `NOT STARTED`.

## Main track

- [ ] Phase 2 simulation/UI/phenolphthalein (implementation slice present; review pending).
- [ ] Phase 3 weak acid/Guided/report.

## Firebase track — Phase 4A — có thể làm ngay

**Owner: Bắc Hà — Firebase/Deployment Owner**

- [ ] P4A-01 Xác nhận/tạo Firebase Project riêng.
- [ ] P4A-02 Thiết lập `.firebaserc`, `firebase.json`.
- [ ] P4A-03 Tạo preview channel và ghi Preview URL + SHA.
- [ ] P4A-04 Tạo `src/firebase/config.js`, `auth.js`, repository skeleton.
- [ ] P4A-05 Google Auth skeleton.
- [ ] P4A-06 Firestore schema/repository skeleton.
- [ ] P4A-07 Rules + emulator tests baseline.
- [ ] P4A-08 Deploy/rollback documentation.
- [ ] P4A-09 Chemistry regression PASS.
- [ ] P4A-10 PO acceptance Phase 4A.

## Phase 4B — BLOCKED

Phase 4B bị chặn cho tới khi interface Phase 2–3 ổn định.

## Later

- [x] P2 input form + validation + Phase 1 engine boundary (READY FOR REVIEW; PO/peer review pending).
- [ ] P2 simulation state/drop/runner, chart, experiment view và PP (implementation present; PR/PO/peer review pending).
- [ ] P3 weak acid/Guided/report; P4 Firebase learner; P5 Admin; P6 release.
- [ ] Phase 5 Admin.
- [ ] Phase 6 release.

## Quy tắc cập nhật

Chỉ tick sau khi có link PR/SHA + test evidence trong PROGRESS. Task BLOCKED phải ghi lý do, owner và điều kiện mở khóa.
