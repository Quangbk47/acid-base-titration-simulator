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

## 2026-09-05 — Parallel delivery model approved

- PO/GVHD cho phép Phase 4A chạy song song Phase 2–3.
- Main track = `Phase 2 → Phase 3`.
- Firebase track = `Phase 4A`.
- Owner = **Bắc Hà — Firebase/Deployment Owner**.
- Phase 4B = `BLOCKED` cho tới khi interface Phase 2–3 ổn định.
- Production deploy = `NO`.
- Project ID / Preview URL / SHA = `TBD` tới khi Bắc Hà triển khai thật.

## 2026-09-05 — Phase 2 baseline reconciliation

- Branch `feature/phase-2-input-validation` integrated `main` by merge; documentation conflicts were resolved while retaining Phase 4A/4B management state.
- Phase 2 input/validation slice: `READY FOR REVIEW`; not merged, no PO PASS or peer PASS.
- Verification: 22/22 tests, lint, format, HTTP smoke and `git diff --check` PASS.

## 2026-09-06 — Phase 2 simulation/UI implementation slice

- Phase: `Phase 2 — IN PROGRESS / DEV PASS pending browser gate`.
- Branch/SHA: `feature/phase-2-input-validation` / `ab72937`.
- Implemented: immutable simulation state with 0.05–0.10 mL drops and reset;
  timer runner with pause/resume and slow/normal/fast cadence; experiment view;
  curve view backed by `generateCurve` with current/half-equivalence/equivalence/
  endpoint markers; phenolphthalein state view; chemistry species table.
- Boundary: UI still calls `solveStrongStrong` only after validation and keeps
  mL→L and 25 °C→298.15 K conversion in `src/ui/validation.js`.
- Verification: 27/27 Node tests PASS, lint/format PASS, `git diff --check` PASS;
  local browser preview verified submit, add-drop, automatic runner and pause.
- Remaining gate: full keyboard/mobile/reduced-motion review and peer/PO review;
  no PR or merge has been created for this slice.

## 2026-09-08 — Phase 2 clean closeout / PR #5

- Phase: `READY FOR REVIEW / READY TO CLOSE` — implementation complete;
  not `CLOSED`, `MERGED`, `VERIFIED` or `PO PASS`.
- Branch/SHA: `fix/phase-2-clean-closeout` /
  `cc4d41fca0065cb8d5ddab40ad0d0c41e6c023e7`.
- PR: #5 — `feat: close phase 2 simulation and experiment UI` — OPEN,
  base `main`, head `fix/phase-2-clean-closeout`.
- Scope complete at implementation level: SIM-01..03, UI-01..03 and CHEM-06.
- Verification: Phase 2 tests 15/15 PASS; full suite 41/41 PASS; lint PASS
  (38 JavaScript files); format PASS (21 files); `git diff --check` PASS.
- Runtime recorded: local `/simulate` submit, add-drop, speed selection, run,
  pause, resume, reset and chart flow PASS; final observed state was Paused,
  0.15 mL, pH 1.01 and 13 chart rows; no new console warnings/errors in the
  final flow.
- Responsive evidence recorded in earlier repo evidence: local browser smoke
  checked 320/375/430/768/1366 px with no horizontal overflow; mobile layout
  is one column. Historical closeout evidence also records 360/1280 px.
- Reduced-motion evidence is reusable from `e6ffd10c43e9b2627f640e19a5dec95329ffdaff`
  (`2026-09-07`, Windows + Edge): Animation effects Off,
  `matchMedia('(prefers-reduced-motion: reduce)').matches === true`, controls
  remained functional and motion was reduced to near-zero. `assets/styles.css`
  is unchanged between that evidence commit and PR #5.
- Manual keyboard/accessibility review is now **CONFIRMED** on current HEAD
  `632a08939e08cb63edb502922f1a1390ea87349d` using the Codex In-app Browser on
  Windows at `http://localhost:4173/simulate` on 2026-09-08. Keyboard-only
  Tab/Shift+Tab traversal, input editing, Enter/Space activation for submit,
  add-drop, run, pause, resume and reset, speed selection, focus visibility,
  validation error, labels, accessible names, text status, chemistry fields and
  chart data-table alternative all passed. No keyboard trap or mouse-only
  critical control was observed.
- Historical peer report at `cf5f2772e51c25b62205c3b2dc18f6272d65075a` was
  authored by `Noname000-Zero` and reports browser interaction PASS, but is
  `STALE / RECHECK` for PR #5 because the relevant implementation changed.
- The clean branch excludes Phase 3, NH3–HCl, Firebase and Admin/auth/save/load.
- Closeout wiring fix: `src/app.js` previously used the old simulation API;
  commit `cc4d41f` wires the Phase 2 API and the verification above was run
  after that fix.
- Remaining gates: peer review, PO/GVHD acceptance, merge PR #5 and
  post-merge verification. Do not tick Phase 2 as closed before those gates.

## 2026-09-10 — Phase 3 closeout evidence after main synchronization

- Branch: `feature/phase-3-chem03-reference-validation`.
- Phase 3 technical gates: PASS — CH₃COOH–NaOH solver, CHEM-03 independent
  reference comparison, curve checkpoints, guided prompts, local report,
  browser/manual review and responsive review.
- Peer run: `PASS` — performed by **Nhật Anh** on `2026-09-09`.
- The peer-run result is recorded from the team's direct confirmation. Detailed
  command log, screenshot, or PR review artifact was not stored in the repo at
  the time of the run; detailed repository evidence remains pending.
- PO acceptance: `PENDING`; Phase 3 is `READY FOR PO ACCEPTANCE`, not CLOSED.
- PR #6: `MERGED` at merge SHA `e602ac84b4d87b9bfaba1004016c22af874ffcfd`.
- CI on the merge commit: `PASS`.
- Phase 3 status: `MERGED / AWAITING PO ACCEPTANCE`; PO/GVHD acceptance remains
  `PENDING`, so Phase 3 is not `DONE` or `CLOSED`.
- No chemistry behavior, Firebase, or NH₃–HCl scope was changed.
