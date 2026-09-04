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

## Phase 1 hardening / Review pending

- [x] DEV review lại contract M/L/K, temperature/Kw, tolerance, curve và preview tooling.
- [x] DEV test 16/16 + lint/format/diff check + local browser smoke.
- [ ] Thành viên thứ hai chạy lại test và ghi bằng chứng (`Peer run: PENDING`).
- [ ] PO/GVHD nghiệm thu đợt hardening (`PO PASS: PENDING`).
- [ ] Merge PR #1 sau khi các gate review thực tế đạt yêu cầu.

Evidence: branch `fix/phase1-chemistry-foundation`, PR #1 và `docs/PROGRESS.md`.
Không tick ba mục review/PO/merge nếu chưa có bằng chứng thật.

## Later

- [ ] P2 simulation/UI/PP; P3 weak acid/Guided/report; P4 Firebase learner; P5 Admin; P6 release.

## Quy tắc cập nhật

Chỉ tick sau khi có link PR/SHA + test evidence trong PROGRESS. Task BLOCKED phải ghi lý do, owner và điều kiện mở khóa.
