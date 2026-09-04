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

- Trạng thái: `DONE — PO PASS`.
- Branch: `feature/phase-0-foundation`.
- SHA implementation: `54e665c179ba3520339b27d941b5da3e099fce8e`.
- P0-01…P0-05: hoàn tất scaffold tĩnh, responsive placeholder, accessibility baseline, lint/format/test command, CI và preview local.
- Files chính: `index.html`, `assets/styles.css`, `src/app.js`, `src/chemistry/`, `src/simulation/`, `src/ui/`, `src/data/`, `src/firebase/`, `scripts/`, `tests/`, `.github/workflows/ci.yml`, `.gitignore`, `LICENSE`, `DEPLOYMENT_TARGETS.md`.
- Automated evidence: `npm run check` PASS; `git diff --check` PASS; 3 smoke tests PASS.
- Preview: `http://localhost:4173/` và `http://localhost:4173/simulate`; ảnh baseline: `docs/preview-baseline.svg`.
- Browser evidence: trang chủ và route `/simulate` load; status `Baseline sẵn sàng`; layout mobile một cột; không có runtime error hiển thị.
- Scope: không có chemistry solver/pH giả, Firebase/Auth/Firestore, admin, history, production deploy hay thay đổi nội dung khoa học.
- Risk: Phase 1 vẫn cần chemistry fixtures và kiểm chứng độc lập trước khi mở controls.
- Next: Phase 1 chưa bắt đầu; chỉ bắt đầu theo chỉ đạo mới sau khi đóng Phase 0.

## 2026-09-04 — PO acceptance and Phase 0 close

- PO acceptance: `PASS`.
- Phase 0: `CLOSED / DONE`.
- Merge: branch `feature/phase-0-foundation` được yêu cầu merge vào `main`; merge SHA ghi nhận sau thao tác merge.
- Production deploy: `NO`.
- Phase 1: `NOT STARTED`.

## 2026-09-04 — Phase 1 chemistry DEV PASS

- Trạng thái: `DEV PASS — chờ PO testing`; chưa phải `PO PASS`/`DONE`.
- Branch: `feature/phase-1-hcl-naoh-chemistry`.
- SHA implementation: `4bc9f0c6849b3c407b13a703cbd98bf728669b5f`.
- CHEM-01: PASS — HCl–NaOH bằng M/V, trước/eq/sau, pH/pOH và mol ion dư khớp reference.
- CHEM-02: PASS — 25%, 50%, 99%, 100%, 101%, dư lớn; curve deterministic và mốc `Veq`/endpoint tách biệt.
- CHEM-05: PASS — 0/âm/NaN/Infinity/input sai/step curve sai trả lỗi có mã; không NaN/Infinity/chia 0.
- Files: `src/chemistry/units.js`, `strongStrong.js`, `milestones.js`, `curve.js`, `src/data/standardCases.js`, `tests/fixtures/phase1Reference.js`, `tests/chemistry.test.js`.
- Automated evidence: `npm run check` PASS (lint 16 JS, format 17 files, 9 tests PASS); `git diff --check` PASS.
- Reference: 0, 25%, 50%, 99%, 100%, 101% Veq và dư lớn của 0.100 M HCl 25.00 mL / 0.100 M NaOH; `Veq = 25.000 mL`, endpoint PP bắt đầu khoảng `25.000792 mL`.
- Preview: không tạo preview UI mới; Phase 1 chỉ là engine/test thuần. Không deploy production.
- Scope: không làm animation, chart UI, indicator UI, Firebase/Auth, Phase 2 hay model axit yếu/HCl–NH₃.
- Risk/PO note: `temperature` nhận 25 °C hoặc 298.15 K; `Kw=1e-14` theo giả thiết 25 °C của CHEMISTRY_MODEL. `Vb=0` được phép cho trạng thái ban đầu.
- Next: PO chạy checklist reference và thử import solver độc lập; sau PO acceptance mới mở Phase 2.
