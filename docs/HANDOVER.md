# HANDOVER — TRIỂN KHAI

## Baseline

- Current phase: `Phase 2 simulation/UI — READY FOR REVIEW / READY TO CLOSE`.
- Technical implementation is complete on the clean closeout branch. PR #5 is
  OPEN; Phase 2 is not yet `CLOSED`, `MERGED`, `VERIFIED` or `PO PASS`.
- Quyết định sản phẩm/khoa học/Firebase đã chốt trong README và docs.
- Repo GitHub và code baseline đã được xác nhận; Firebase Project ID và production URL vẫn để trống.

## Parallel delivery model

- Current main track: `Phase 2 → Phase 3`.
- ROADMAP note: this branch retains the older parallel-track wording; the
  current ROADMAP in this branch places chemistry reference validation in
  Phase 4 and Firebase in Phase 6. This Phase 2 handover does not change that
  project-wide roadmap or pull Firebase work into PR #5.
- Parallel Firebase track: outside PR #5 scope.
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

## Việc được phép tiếp theo

Phase 2 implementation and clean closeout are now isolated on
`fix/phase-2-clean-closeout` and reviewed through PR #5. Không cần làm thêm
feature Phase 2 nếu reviewer không phát hiện lỗi.

Lát cắt state/drop runner, chart, experiment view và phenolphthalein đã được
đưa vào clean branch; Phase 2 tests 15/15 và full suite 41/41 PASS. Responsive
evidence 320/375/430/768/1366 và local runtime evidence đã được ghi trong
`PROGRESS.md`; historical closeout evidence còn ghi 360/1280. Reduced-motion
runtime được xác nhận lại từ evidence `e6ffd10` trên Windows + Edge và code
motion liên quan vẫn áp dụng cho PR #5. Keyboard focus và complete manual
accessibility review đã **CONFIRMED** trên HEAD `632a089` bằng browser thật
trên Windows: Tab/Shift+Tab, input, Enter/Space controls, speed selector,
focus visible, validation error, labels, status text và chart table alternative
đều PASS; không thấy keyboard trap. Peer report cũ vẫn stale cho mục peer review.

## Phase 2 input/validation handover

- Form chỉ mở HCl–NaOH vì đó là hệ duy nhất engine hiện hỗ trợ.
- UI boundary validate trước, đổi M/mL/°C sang contract M/L/K rồi gọi
  `solveStrongStrong`; không có công thức pH trùng lặp trong UI.
- Hiển thị cơ bản: pH, tổng thể tích, ion dư, stage và phản ứng.
- Automated: lint/format/full suite 22/22 PASS; browser smoke và năm breakpoint
  không overflow ngang. Không production deploy.
- Phase 1 peer run: `PENDING`; không thay đổi trạng thái này.

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

`Phase | Done | Files | Tests | Preview | SHA | Risks | Next`. Hiện còn lại:
review chéo → PO/GVHD acceptance → merge PR #5 → post-merge smoke và cập nhật
final closeout. Không ghi Phase 2 là closed trước khi merge.
