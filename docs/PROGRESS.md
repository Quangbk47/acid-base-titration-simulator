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

## 2026-09-04 — Phase 1 chemistry CLOSED / DONE

- Trạng thái: `CLOSED / DONE — PO PASS`.
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
- Next: Phase 2 `NOT STARTED`; chỉ bắt đầu theo chỉ đạo mới.

## 2026-09-04 — PO acceptance and Phase 1 close

- PO acceptance: `PASS`.
- Phase 1: `CLOSED / DONE`.
- Merge: feature branch được merge vào `main` bằng `--no-ff`.
- Final merge SHA: `021a8aaf646c955feb93aca9a6a34227b7dd5c7a`.
- Production deploy: `NO`.
- Phase 2: `NOT STARTED`.

## 2026-09-04 — Phase 1 chemistry foundation hardening

- Phase: `Phase 1 hardening — DEV PASS; PO PASS; GVHD approved for merge`.
- Done: làm rõ contract M/L/K; giới hạn 298.15 K; tolerance mol/thể tích
  theo tỷ lệ; curve tăng dần, không rỗng/gần trùng và có checkpoint bắt buộc;
  preview path guard đa nền tảng; đồng bộ câu chữ UI tĩnh.
- Files: `src/chemistry/`, `src/data/standardCases.js`, `scripts/serve.mjs`,
  `scripts/path-security.mjs`, `tests/`, `index.html`, `src/app.js`,
  `docs/CHEMISTRY_MODEL.md`, `docs/TEST_CASES.md`.
- Tests: local developer rerun PASS — lint 17 JavaScript files; format baseline
  18 files; 16/16 tests PASS gồm CHEM-01/02/05, temperature invalid, mol rất
  nhỏ, curve checkpoints/dedup/order, tiny-volume curve và preview path guard;
  `git diff --check` PASS; browser smoke `/` + `/simulate` PASS, CSS/JS load,
  controls vẫn disabled, không chemistry output giả và không console error.
- Preview-URL: `http://localhost:4173/` và `http://localhost:4173/simulate`
  (local only); production deploy: `NO`.
- Risk: public field names `Va`/`Vb`/`temperature` được giữ để không phá contract,
  nhưng đơn vị M/L/K nay được ghi rõ; downstream Phase 2 phải chuyển đổi ở boundary.
- Next: merge PR #1 theo chỉ đạo trực tiếp của GVHD, rồi chạy test/smoke trên
  `main` và ghi closeout. Không bắt đầu Phase 2 trong đợt này.
- Branch-SHA: `fix/phase1-chemistry-foundation` /
  `9162d0c22f28f2d7bd4ea1c78408e03f17e7920a`.
- DEV review SHA: `d1af2547339b92b04a42e9ef78262c801455c858`.
- PR: `https://github.com/Quangbk47/acid-base-titration-simulator/pull/1`.
- GVHD approval: `PASS / APPROVED FOR MERGE` — GVHD đồng thời là PO và đã
  trực tiếp cho phép merge PR #1.
- Merge exception record: GVHD cho phép đóng đợt hardening dù chưa có bằng
  chứng peer run độc lập; trạng thái peer vẫn được giữ nguyên, không suy diễn PASS.
- Peer run: `PENDING`.
- PO PASS: `PASS` — GVHD đồng thời là PO và đã trực tiếp phê duyệt merge PR #1.

## 2026-09-04 — Phase 1 hardening merged / closed by GVHD direction

- Phase: `Phase 1 hardening — MERGED / CLOSED`.
- Done: PR #1 được merge vào `main` bằng merge commit theo chỉ đạo trực tiếp
  của GVHD; local `main` đã đồng bộ với `origin/main`.
- Files: toàn bộ code/test/docs của PR #1; không có Phase 2 hoặc Firebase.
- Tests after merge: lint 17 JavaScript files PASS; format baseline 18 files
  PASS; full suite 16/16 PASS; `git diff --check` PASS; local browser smoke `/`
  và `/simulate` PASS, CSS/JS load, controls disabled, không chemistry output giả,
  không console error.
- CI: GitHub Actions push check cho merge SHA PASS.
- Preview-URL: `http://localhost:4173/` và `http://localhost:4173/simulate`
  (local smoke only; server đã dừng).
- PR: `https://github.com/Quangbk47/acid-base-titration-simulator/pull/1`.
- Merge SHA: `87ba1d17b30e3d383d4bc87046c8d79f57ee70f0`.
- GVHD approval: `PASS / APPROVED` — GVHD đồng thời là PO, đã cho phép merge
  và đóng đợt hardening.
- Peer run: `PENDING` — chưa có bằng chứng chạy độc lập; không ghi PASS.
- PO PASS: `PASS` — GVHD đồng thời là PO và đã trực tiếp phê duyệt merge PR #1.
- Production deploy: `NO`.
- Risk: peer run độc lập vẫn chưa có bằng chứng nhưng không chặn closeout đã
  được GVHD/PO phê duyệt; boundary Phase 2 sau này phải giữ contract M/L/K.
- Next: Phase 2 vẫn `NOT STARTED`; trước khi code phải đọc lại ROADMAP,
  PROJECT_RULES, CHEMISTRY_MODEL, UI_UX_SPEC và TEST_CASES.

## 2026-09-04 — Phase 2 input and validation slice

- Phase: `Phase 2 — IN PROGRESS / DEV PASS`.
- Branch: `feature/phase-2-input-validation`.
- Done: form HCl–NaOH, validation lỗi tại trường nhập, khôi phục ca Phase 1,
  chuyển đổi mL → L và 25 °C → 298.15 K tại UI boundary, gọi duy nhất
  `solveStrongStrong`, hiển thị pH/tổng thể tích/chất dư/stage/phản ứng cơ bản.
- Scope giữ lại: không animation, addDrop/timer, chart động, PP, hệ yếu, Phase 3,
  Firebase/Auth/history/admin hay production deploy; không sửa chemistry engine.
- Tests: Node trực tiếp chạy lint/format/full suite PASS, 22/22 tests PASS;
  `git diff --check` PASS. Lệnh `npm` không có trên PATH của môi trường nên các
  script đích trong `npm run check` được chạy trực tiếp bằng bundled Node.
- Browser smoke: `/simulate` load không console error; ca ban đầu cho pH 1.00,
  input trống hiện lỗi cạnh trường; không overflow ngang tại 320/375/430/768/1366 px.
- Phase 1 dependency: solver/tests vẫn PASS; peer run độc lập vẫn `PENDING`,
  không tự ghi nhận PASS.
- Risk: mới là lát cắt nhập liệu; chưa có state mô phỏng thống nhất và các gate
  SIM/UI/CHEM-06 đầy đủ của Phase 2 chưa thể PASS.
- Next: review branch/commit này; sau đó triển khai state + `addDrop` trong task riêng.
