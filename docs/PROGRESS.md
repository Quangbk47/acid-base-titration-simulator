# PROGRESS

## 2026-09-03 — Requirements baseline

- Trạng thái: `PO PASS` cho phạm vi/yêu cầu; chưa bắt đầu code.
- Repo dự kiến: public `acid-base-titration-simulator`.
- Frontend: HTML/CSS/JavaScript thuần.
- Firebase: project riêng; Google Sign-In, Cloud Firestore, Hosting.
- Chưa có branch, SHA, preview, production URL hoặc Firebase Project ID.

## 2026-09-03 — Documentation implementation baseline

- `ROADMAP.md` được nâng cấp thành roadmap giao việc theo Phase/P0 task, file-module, gate và PASS criteria.
- Đồng bộ PROJECT_RULES, CHEMISTRY_MODEL, UI_UX_SPEC, DATA_MODEL, FIREBASE_SECURITY, TEST_CASES, TODO, HANDOVER và NEXT_SESSION_PROMPT.
- Trạng thái code/Firebase vẫn: **chưa bắt đầu**. Không có deploy hay thay đổi external resource.

## Quyết định sản phẩm

- Guest mô phỏng ngay; tài khoản chỉ để lưu ca/đồ thị/báo cáo.
- Admin cấp thủ công, quản lý nội dung Nháp → Xuất bản.
- Tối đa 50 ca/user, không tự xóa; có tự xóa tài khoản/dữ liệu.
- Desktop hai nửa thí nghiệm–đồ thị; mobile xếp dọc.
- Giọt 0,05–0,10 mL; tốc độ Chậm/Vừa/Nhanh chỉ là nhịp; phenolphthalein có hoạt ảnh đúng quy tắc đã chốt.

## 2026-09-04 — Phase 0 implementation baseline

- Trạng thái: `DEV PASS — PO TESTING pending`.
- Branch: `feature/phase-0-foundation`.
- SHA: `2b3969a23e39d5a9b64a2b25a87c2c9321a6fe3c` (scaffold commit; checkpoint update will be amended).
- P0-01…P0-05: hoàn tất scaffold tĩnh, responsive placeholder, accessibility baseline, lint/format/test command, CI và preview local.
- Files chính: `index.html`, `assets/styles.css`, `src/app.js`, `src/chemistry/`, `src/simulation/`, `src/ui/`, `src/data/`, `src/firebase/`, `scripts/`, `tests/`, `.github/workflows/ci.yml`, `.gitignore`, `LICENSE`, `DEPLOYMENT_TARGETS.md`.
- Automated evidence: `npm run check` PASS; `git diff --check` PASS; 3 smoke tests PASS.
- Preview: `http://localhost:4173/` và `http://localhost:4173/simulate`; ảnh baseline: `docs/preview-baseline.svg`.
- Browser evidence: trang chủ và route `/simulate` load; status `Baseline sẵn sàng`; layout mobile một cột; không có runtime error hiển thị.
- Scope: không có chemistry solver/pH giả, Firebase/Auth/Firestore, admin, history, production deploy hay thay đổi nội dung khoa học.
- Risk: Phase 1 vẫn cần chemistry fixtures và kiểm chứng độc lập trước khi mở controls.
- Next: PO test thủ công baseline; sau PO acceptance có thể bắt đầu Phase 1.
