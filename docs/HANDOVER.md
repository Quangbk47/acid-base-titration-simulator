# HANDOVER — TRIỂN KHAI

## Baseline

- Current phase: `Phase 2 simulation/UI — DONE / CLOSED; Phase 3 is next`.
- Current branch: `feature/phase-4a-firebase-foundation`.
- Current HEAD: `f5a12ce26ce4d4cfca3e50ca32d7809832ea3ebd`.
- Quyết định sản phẩm/khoa học/Firebase đã chốt trong README và docs.
- Repo GitHub và code baseline đã được xác nhận; Firebase Project ID và production URL vẫn để trống.
- `origin/main` đang diverge với branch hiện tại; không tự động merge/rebase.
- Firebase foundation files are present as uncommitted working-tree changes and
  are outside the Phase 2 closeout scope.

## Parallel delivery model

- Current main track: `Phase 2 → Phase 3`.
- Parallel Firebase track: `Phase 4A`.
- Firebase/Deployment Owner: **Bắc Hà**.
- Phase 4B: `BLOCKED` cho tới khi interface Phase 2–3 ổn định.
- Production deploy: `NO`.

## Phase 1 hardening closeout

- PR: `#1` — merged.
- Merge SHA: `87ba1d17b30e3d383d4bc87046c8d79f57ee70f0`.
- Post-merge tests: lint/format PASS; 16/16 tests PASS; local browser smoke PASS.
- GitHub Actions on merge SHA: `PASS`.
- GVHD approval: `PASS / APPROVED` — GVHD đồng thời là PO và đã trực tiếp
  phê duyệt merge PR #1.
- Peer run: `PENDING`; PO PASS: `PASS`.
- Production deploy: `NO`; Phase 2: `NOT STARTED`.

## Bằng chứng Phase 0

- Branch: `feature/phase-0-foundation`.
- Preview local: `http://localhost:4173/` và `http://localhost:4173/simulate`.
- Tests: `npm run check` và `git diff --check` PASS.
- Ảnh baseline: `docs/preview-baseline.svg`.
- SHA implementation: `54e665c179ba3520339b27d941b5da3e099fce8e`.

## Bằng chứng Phase 1

- Branch: `feature/phase-1-hcl-naoh-chemistry`.
- Tests: `npm run check` và `git diff --check` PASS; 9/9 tests PASS.
- Reference: `tests/fixtures/phase1Reference.js`; các mốc ban đầu, 25%, 50%, 99%, 100%, 101% và dư lớn.
- Preview/deploy: không có preview UI mới; production `NO`.
- SHA implementation: `4bc9f0c6849b3c407b13a703cbd98bf728669b5f`.
- Merge SHA: `021a8aaf646c955feb93aca9a6a34227b7dd5c7a`.

## Phase 2 closeout

- Implementation và acceptance của Phase 2 đã hoàn tất; trạng thái hiện tại là
  `DONE / CLOSED`.
- Evidence: SIM-01..03, UI-01..03 và CHEM-06 PASS; responsive runtime PASS;
  reduced-motion runtime manual PASS trên Windows + Microsoft Edge.
- Automated: `node --test` 43/43 PASS on the current working tree; lint PASS;
  format PASS;
  `git diff --check` PASS.
- Implementation closeout SHA: `e6ffd10c43e9b2627f640e19a5dec95329ffdaff`.
- Documentation closeout is recorded in `docs/PROGRESS.md`; no Firebase file is
  included in the closeout.
- Solver dispatch regression fix: `aac830341c32dbbf720713a2221d41a2af6ad6e8`.
- Không có thay đổi Firebase, chemistry formula, Ka/Kw convention hoặc đơn vị.

## Việc được phép tiếp theo

Tập trung review Phase 3 trên `feature/phase-3-weak-acid-guided-report`:
CH₃COOH–NaOH tại initial/half-equivalence/equivalence/post-equivalence,
guided prompts và local report. Không quay lại Phase 2 trừ khi phát hiện
regression mới.

Phase 2 đã được kiểm tra bằng 15 Phase 2 tests, 12 Phase 1 chemistry regression
tests, full suite 43/43, browser
responsive smoke và manual reduced-motion evidence; đã được đóng ở trạng thái
`DONE / CLOSED`.

## Phase 2 input/validation handover

- Form chỉ mở HCl–NaOH vì đó là hệ duy nhất engine hiện hỗ trợ.
- UI boundary validate trước, đổi M/mL/°C sang contract M/L/K rồi gọi
  `solveStrongStrong`; không có công thức pH trùng lặp trong UI.
- Hiển thị cơ bản: pH, tổng thể tích, ion dư, stage và phản ứng.
- Automated: lint/format/full suite 22/22 PASS; browser smoke và năm breakpoint
  không overflow ngang. Không production deploy.
- Phase 1 peer run: `PENDING`; không thay đổi trạng thái này.
Phase 1 hardening đã đóng theo chỉ đạo GVHD. Main track tiếp tục theo thứ tự
Phase 2 → Phase 3; Firebase track Phase 4A có thể chạy song song dưới ownership
của Bắc Hà. Trước khi code tiếp theo phải đọc lại ROADMAP, PROJECT_RULES,
CHEMISTRY_MODEL, UI_UX_SPEC và TEST_CASES.

## Cấm mở rộng

Trong Phase 2–3, không làm Auth/Firestore/Rules/Admin ngoài contract đã duyệt
của Firebase track; không sửa chemistry ngoài phase tương ứng, HCl–NH3, axit
yếu–bazơ yếu hay production deploy. Phase 4A không được sửa chemistry hoặc lõi
simulation, và không dùng Firebase/URL/config của dự án khác.

## Firebase handover checklist

- [ ] Firebase Project ID
- [ ] Hosting Site
- [ ] Preview URL
- [ ] Auth providers
- [ ] Firestore status
- [ ] Rules status
- [ ] Emulator evidence
- [ ] Repository/config files
- [ ] Emulator command
- [ ] Deploy command
- [ ] Deployed SHA
- [ ] Rollback target/SHA
- [ ] Risks

## Báo cáo bàn giao

`Phase | Done | Files | Tests | Preview | SHA | Risks | Next`. Cập nhật PROGRESS và TODO trước khi chuyển người/phiên.

## Phase 3 handover

`DEV PASS` implementation remains on `feature/phase-3-weak-acid-guided-report`;
independent CHEM-03 validation is on `feature/phase-3-chem03-reference-validation`.
Reference files are `tests/fixtures/chem03IndependentReference.js` and
`tests/chem03-reference.test.js`. CHEM-03 automated comparison and browser/manual
technical review are PASS at initial, half-equivalence, equivalence and
post-equivalence. Responsive technical review is recorded as PASS with the
runtime limitations documented below. Peer run: `PASS` — performed by Nhật Anh
on `2026-09-09`; detailed repository evidence pending. PO acceptance is still
pending, so Phase 3 is `READY FOR PO ACCEPTANCE`, not closed. Firebase is out
of scope.

Responsive evidence: local preview at `http://localhost:4173/simulate` was
checked at the available `1280×720` desktop viewport with no horizontal
overflow and usable form/chart/guided/report controls. The current browser
runtime did not expose reliable viewport emulation, so exact 1366/1024/430/375
browser runs remain pending; do not treat them as completed evidence.

## Phase 3 closeout handover — 2026-09-10

- Technical gates: PASS.
- Peer run: PASS — performed by Nhật Anh on 2026-09-09.
- Detailed peer-run artifact: not stored in the repository; evidence is based
  on the team's direct confirmation.
- PO acceptance: PENDING.
- Phase status: READY FOR PO ACCEPTANCE.
- PR #6: OPEN; CI PASS; GitHub merge state DIRTY. Do not merge until PO
  acceptance and the PR merge state are resolved.
