# HANDOVER — TRIỂN KHAI

## Baseline

- Current phase: `DONE — Phase 1; PO PASS`.
- Quyết định sản phẩm/khoa học/Firebase đã chốt trong README và docs.
- Repo GitHub và code baseline đã được xác nhận; Firebase Project ID và production URL vẫn để trống.

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

Phase 1 chemistry foundation hardening đang ở `DEV PASS` trên branch
`fix/phase1-chemistry-foundation`, PR #1. Local developer test 16/16 PASS;
peer run và PO PASS cho đợt hardening vẫn `PENDING`. Việc tiếp theo là review
chéo và nghiệm thu; không merge hoặc bắt đầu Phase 2 chỉ dựa trên DEV PASS.

## Cấm mở rộng

Không làm animation/chart UI/indicator, Auth/Firestore/Rules/Admin, HCl–NH3,
axit yếu–bazơ yếu hay production deploy trong Phase 1. Không dùng Firebase/URL/config của dự án khác.

## Báo cáo bàn giao

`Phase | Done | Files | Tests | Preview | SHA | Risks | Next`. Cập nhật PROGRESS và TODO trước khi chuyển người/phiên.
