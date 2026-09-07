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

## 2026-09-05 — Parallel delivery model approved

- PO/GVHD cho phép Phase 4A chạy song song Phase 2–3.
- Main track = `Phase 2 → Phase 3`.
- Firebase track = `Phase 4A`.
- Owner = **Bắc Hà — Firebase/Deployment Owner**.
- Phase 4B = `BLOCKED` cho tới khi interface Phase 2–3 ổn định.
- Production deploy = `NO`.
- Project ID / Preview URL / SHA = `TBD` tới khi Bắc Hà triển khai thật.

## 2026-09-06 — Phase 2 simulation/UI CLOSED / DONE

- Trạng thái: `PASS — Peer Run PASS; Phase 2 PASS`.
- Branch: `main`; commit SHA kiểm tra: `cf5f2772e51c25b62205c3b2dc18f6272d65075a`.
- Đã hoàn tất mô phỏng HCl–NaOH nối với chemistry engine thật: thêm giọt
  0,05/0,10 mL, pH, thể tích, ion, chất dư, stage, indicator và graph pH–V.
- Đã hoàn tất state/timer `ready/running/paused`, Pause giữ nguyên trạng thái,
  Reset hủy timer và đưa mô phỏng về ban đầu; không tạo timer đồng thời.
- Đã sửa lỗi điều phối click: thao tác `Thêm giọt` không còn bị nhận nhầm là
  tick timer và không tự chuyển sang `running`.
- Automated evidence: `npm run check` PASS; lint 23 JavaScript files, format
  PASS, 19/19 tests PASS; `git diff --check` PASS.
- Peer Run: PASS — `/` và `/simulate` HTTP 200; controls, graph, chemistry
  state PASS; Playwright click flow `Thêm giọt → Chạy → Tạm dừng → Đặt lại`
  PASS; không có console/page errors.
- Preview: `http://127.0.0.1:4173/` và
  `http://127.0.0.1:4173/simulate` (local only); production deploy: `NO`.
- Files chính: `src/app.js`, `src/simulation/`, `src/ui/`, `tests/simulation.test.js`,
  `scripts/peer-run.mjs`, `docs/PEER_RUN_REPORT.md`, `package.json` và
  `package-lock.json`.
- Next: Phase 3 — axit yếu, Hướng dẫn và báo cáo. Firebase Phase 4A tiếp tục
  theo track song song; Phase 4B vẫn chờ interface Phase 2–3 ổn định.

## 2026-09-06 — Phase 3 implementation checkpoint

- Trạng thái: `IN PROGRESS — chemistry/UI slice DEV PASS`; chưa PO PASS và chưa
  đóng Phase 3.
- Đã thêm `solveWeakAcidStrongBase` dùng charge-balance và bisection trên
  `log10([H+])`, không dùng Henderson–Hasselbalch ngoài vùng đệm; có
  `converged`, `residual`, `iterations` và species HA/A⁻.
- Đã thêm `generateWeakAcidCurve`, ca chuẩn CH₃COOH–NaOH (`Ka=1.8e-5`), guided
  prompts theo state và report JSON có input/modelVersion/mốc/history.
- UI đã cho phép chọn HCl–NaOH hoặc CH₃COOH–NaOH trên cùng state/runner/chart;
  browser smoke xác nhận pH đầu `2.88`, thêm giọt lên `2.94`, bảng HA/A⁻ và
  prompt cập nhật theo state.
- Automated evidence: `npm run check` PASS; lint 28 JavaScript files, format
  PASS, 24/24 tests PASS; `git diff --check` PASS.
- Remaining before Phase 3 close: guided answer/feedback workflow đầy đủ,
  report ảnh đồ thị cục bộ và acceptance/reference review CHEM-03 độc lập.

## 2026-09-06 — Phase 3 CLOSED / DONE

- Trạng thái: `DONE — CHEM-03 PASS; guided PASS; report PASS`.
- Guided workflow: người học nhập pH, màu chỉ thị và chất dư; submit được chấm
  theo chemistry state hiện tại, feedback aria-live và reset/đổi model xóa
  feedback cũ. Browser smoke đạt `3/3` tại CH₃COOH ban đầu.
- Report: JSON ghi input, `modelVersion`, current state, milestones, history và
  SVG graph; report HTML duy nhất nhúng trực tiếp SVG graph; nút Xuất báo cáo
  tải JSON, HTML và file `acid-base-titration-graph.svg` cục bộ. Test xác nhận
  HTML/SVG đều có polyline dữ liệu thật.
- CHEM-03 independent review: fixture cố định tại 0%, 50%, 100%, 101% và 200%
  Veq; pH/stage/excess/residual đều khớp; không sinh expected từ solver trong
  lúc test.
- Automated evidence: `npm run check` PASS; lint 29 JavaScript files, format
  PASS, 26/26 tests PASS; `git diff --check` PASS.
- Browser evidence: selector CH₃COOH, pH `2.88` → `2.94` sau giọt, guided
  answer `3/3`, graph SVG có dữ liệu. Browser harness không bắt được download
  event, nhưng report serialization và SVG artifact đã được test tự động.
- Phase 3 scope complete: CH₃COOH–NaOH; Hướng dẫn; báo cáo. HCl–NH₃ vẫn là
  task sau Phase 3; axit yếu–bazơ yếu vẫn `DEFERRED`.

## 2026-09-06 — Phase 4A foundation started

- Trạng thái: `IN PROGRESS — local foundation DEV PASS; Firebase setup pending`.
- Mục tiêu: Firebase project/Hosting riêng, public web config, Google Auth
  skeleton, Firestore repository/schema, Rules + Emulator tests và preview/
  rollback evidence; Firebase không quyết định chemistry hoặc simulation.
- Đã thêm `.firebaserc` placeholder, `firebase.json`, `firestore.rules`,
  `firestore.indexes.json`, `.env.example`, config validation, Google Auth
  adapter và saved-experiment repository contract.
- Contract giữ `modelVersion`, input/state/summary, giới hạn 50 ca; không lưu
  curve arrays, ảnh, animation, secret hoặc token.
- Automated evidence: Firebase foundation tests kiểm tra public config fields,
  guest-safe auth adapter, schema validation và quota contract; chemistry/UI
  regression vẫn giữ nguyên.
- Pending: cần Firebase Project ID thật và deploy owner/credentials để thay
  placeholder, chạy Emulator Rules tests, tạo preview URL và ghi SHA/rollback.
  Chưa deploy production.

## 2026-09-06 — Firebase project configured locally

- Project ID: `acid-base-titration-simulator`.
- Firestore region do owner xác nhận: `asia-southeast1`.
- Web App public config đã được ghi vào `src/firebase/config.js`; `.firebaserc`
  đã trỏ về project thật. Không ghi service account/private key/token.
- `npm run check`: PASS — 29/29 tests; `git diff --check`: PASS.
- Deploy status: `BLOCKED — Firebase CLI chưa đăng nhập`; `npx firebase-tools
  projects:list` trả lỗi `Failed to authenticate, have you run firebase login?`.
- Next: owner chạy `npx firebase-tools login`, sau đó xác nhận để chạy
  `projects:list`, deploy Rules/Hosting preview và ghi URL/SHA/rollback.

## 2026-09-06 — Schedule correction: Phase 4 reference validation

- Quyết định nhóm: dừng Firebase/Auth/Firestore/deploy ở thời điểm này; các
  nhiệm vụ đó chuyển sang Phase 6.
- Phase hiện tại: `Phase 4 — Chemistry reference validation`.
- Tuấn và Nhật Anh sẽ cung cấp bảng tính tay cho HCl–NaOH, CH₃COOH–NaOH và
  NH₃–HCl. DEV sẽ chuyển raw tables thành fixtures/tests độc lập, kiểm tra
  `V_e`, pH/species/stage/excess và hình dạng curve.
- Template nhận số liệu: `docs/PHASE_4_REFERENCE_TEMPLATE.md`.
- Các file Firebase foundation đã tạo được giữ ở trạng thái local/parked, không
  deploy và không dùng để thay đổi chemistry/simulation trong Phase 4.
- Next: chờ bảng reference đã ghi rõ input, tolerance, nguồn tính tay và người
  review; sau đó tạo `tests/fixtures/phase4Reference.js` và automated review.

## 2026-09-07 — Phase 4 NH3-HCl chemistry validation

- Status: `DEV PASS`; scope is chemistry only, with no Firebase, UI, or deployment change.
- Done: added a pure strong-acid/weak-base charge-balance solver for NH3-HCl,
  independent fixed reference fixtures, and a 15-point automated comparison.
- Reference cases: standard 0.1000 M / 0.1000 M; changed concentration 0.01000 M
  NH3 / 0.02000 M HCl; dilute 1.000e-6 M / 1.000e-6 M model-boundary case.
- Result: every row passes `|delta pH| <= 0.02`; maximum observed error against
  the four-decimal reference table is `0.000048`.
- Files: `src/chemistry/strongAcidWeakBase.js`, `src/chemistry/index.js`,
  `tests/fixtures/phase4Reference.js`, `tests/phase4Nh3Hcl.test.js`, and
  `docs/PHASE_4_NH3_HCL_REFERENCE.md`.
- Tests: `npm run check` PASS (31/31); `git diff --check` PASS.
- Risk: the dilute case correctly retains water autoionisation but ideal-solution
  assumptions, CO2 absorption, activity, and volumetric error limit its use as
  experimental data.
- Next: peer/reference review and PO acceptance before marking CHEM-04 closed.

## 2026-09-07 — Phase 4 NH3-HCl data synchronization

- Synced the Phase 4 implementation against the current files from GitHub.
- Corrected the stoichiometric excess contract: NH3 before equivalence, no
  excess at equivalence, and H+ after equivalence; equilibrium species remain
  separate from stoichiometric excess.
- Added ammonia mass-balance, `pH + pOH = 14`, and stage-transition assertions.
- Scope remains chemistry-only; Firebase, UI, and deployment are unchanged.
