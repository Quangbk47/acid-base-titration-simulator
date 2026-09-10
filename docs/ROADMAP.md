# ROADMAP TRIỂN KHAI CHI TIẾT

## Cách dùng

Roadmap là hợp đồng giao việc. Không nhảy phase: mỗi phase chỉ bắt đầu sau khi đọc các tài liệu liên quan và chỉ `DONE` khi toàn bộ gate PASS. Trạng thái: `PLANNED → IN PROGRESS → DEV PASS → PO TESTING → PO PASS → DONE`. Mọi phase phải ghi branch/SHA, file sửa, test, preview, rủi ro và bước sau vào `PROGRESS.md`.

## Gate convention from Phase 3 onward

- **Before merge:** technical validation/checks và required peer review hoặc
  peer run phải PASS. Khi đạt hai điều kiện này, PR được phép merge.
- PO/GVHD acceptance **không bắt buộc trước merge**.
- **Before `DONE`/`CLOSED`:** PO/GVHD acceptance PASS vẫn bắt buộc. Sau merge,
  phase có thể ở trạng thái `MERGED / AWAITING PO ACCEPTANCE` cho tới khi gate
  này đạt.
- **Production deploy:** PO approval vẫn bắt buộc theo `PROJECT_RULES.md`.

## Lịch trình hiện tại sau Phase 3

* Phase 4: kiểm chứng chemistry bằng bảng tham chiếu tính tay của nhóm.
* Phase 5: hoàn thiện kiểm chứng khoa học, UX và phạm vi phát hành trước hạ tầng.
* Phase 6: Firebase, tài khoản người dùng, Rules và deploy.

Firebase/Auth/Firestore/deploy đang **tạm dừng**, không phải nhiệm vụ Phase 4.

## Kiến trúc bắt buộc

```text
index.html | assets/
src/app.js
src/chemistry/   // pH, cân bằng, milestones; tuyệt đối không DOM/Firebase
src/simulation/  // state, addDrop, timer
src/ui/          // DOM, đồ thị, validation, accessibility
src/data/        // ca chuẩn, chất, chỉ thị, Hướng dẫn
src/firebase/    // Auth/Firestore repository, tách khỏi chemistry
tests/ | docs/
```

Không để UI tự tính pH, Firebase quyết định hóa học, hoặc hoạt ảnh thay đổi kết quả cân bằng.

## Phase 0 — Bootstrap và baseline tĩnh

**Mục tiêu:** repo chạy local/preview với layout đúng, chưa có pH giả, Auth, Firestore, Rules hay production.

**Làm:**

1. Tạo repo public `acid-base-titration-simulator`; commit README + toàn bộ docs.
2. Tạo `index.html`, `src/app.js`, CSS tokens/reset, cấu trúc thư mục chuẩn và `.gitignore`.
3. Dựng placeholder desktop/mobile: thí nghiệm, đồ thị, bảng hóa học, controls; chưa hiện số liệu mô phỏng.
4. Thêm lệnh lint/format/test phù hợp JavaScript thuần; tạo `DEPLOYMENT_TARGETS.md` với Project ID/URL để trống.
5. Tạo preview tĩnh. Chỉ cấu hình Firebase Hosting khi nhóm xác nhận Firebase Project ID riêng.

**PASS:** local không lỗi console; layout không tràn ở 320/375/430/768/1366 px; lint/test baseline và `git diff --check` PASS; có ảnh + URL preview + SHA trong PROGRESS.

## Phase 1 — Lõi HCl–NaOH được kiểm chứng

**Mục tiêu:** chemistry engine thuần, độc lập giao diện cho axit mạnh–bazơ mạnh.

**Làm:**

1. `chemistry/units.js`: mL↔L, finite-number và validation.
2. `chemistry/strongStrong.js`: nhận `Ca, Va, Cb, Vb, temperature`; trả pH/pOH, total volume, mol/ion dư, nồng độ và stage.
3. `chemistry/milestones.js`: `Veq`, before/near/at/after equivalence; không đồng nhất endpoint.
4. `chemistry/curve.js`: sinh pH–V không timer; `data/standardCases.js` có ca chuẩn.
5. Unit tests ở ban đầu, 25%, 50%, 99%, 100%, 101%, dư lớn và input lỗi; commit bảng tính tay/reference làm fixture.

**Không làm:** không hard-code pH theo thể tích; không làm màu/charts đẹp trước khi test pH PASS.

**PASS:** CHEM-01/02/05 PASS; không NaN/Infinity/chia 0; thành viên thứ hai chạy lại test và ghi bằng chứng.

## Phase 2 — Mô phỏng, đồ thị, phenolphthalein

**Mục tiêu:** một state thống nhất cho thí nghiệm ảo HCl–NaOH.

**Làm:**

1. `simulation/state.js`, `step.js`, `runner.js`: `addDrop()` tăng đúng 0,05–0,10 mL; Pause/Reset an toàn; Chậm/Vừa/Nhanh chỉ đổi interval/animation.
2. `ui/experimentView.js`: buret, bình, pH meter 0,01, bảng mol/nồng độ/chất dư/phản ứng/stage.
3. `ui/chartView.js`: vẽ dần, điểm hiện tại, 1/2 eq, eq, endpoint có nhãn khác nhau.
4. `ui/indicatorView.js`: PP theo data; trước eq mảng hồng cục bộ 0,5 s rồi mất, tại eq không màu, sau eq hồng bền theo OH⁻ dư.
5. `ui/validation.js`: lỗi tại ô nhập, miền hợp lệ, nút khôi phục ca mẫu; mobile bảng accordion.

**PASS:** SIM-01..03, UI-01..03, CHEM-06 PASS; cùng `addedVolumeMl` ở ba tốc độ cho pH/bảng/đồ thị giống hệt; preview kiểm tra bàn phím + mobile.

## Phase 3 — Axit yếu, Hướng dẫn và báo cáo

**Mục tiêu:** CH₃COOH–NaOH có giá trị vùng đệm/nửa tương đương và học tập.

**Làm:**

1. `weakAcidStrongBase.js` giải charge-balance bằng bisection log; trả trạng thái hội tụ/sai số cho test.
2. Mở rộng curve/milestones/bảng thành phần; không chỉ dùng Henderson–Hasselbalch ngoài vùng đệm.
3. `data/guidedPrompts.js`: dự đoán pH, màu, chất dư ở đầu, 1/2 eq, eq, sau eq; phản hồi từ state thật.
4. Khám phá/Hướng dẫn dùng chung engine; `ui/report.js` tạo báo cáo + ảnh đồ thị cục bộ.
5. HCl–NH₃ là task sau Phase 3; axit yếu–bazơ yếu vẫn DEFERRED.

**PASS:** CHEM-03 PASS với bảng tham chiếu độc lập; không giữ gợi ý cũ sau reset; báo cáo ghi đúng input/modelVersion/mốc.

## Phase 4 — Chemistry reference validation

**Mục tiêu:** biến bảng tham chiếu tính tay do Tuấn và Nhật Anh cung cấp thành
automated tests độc lập, đồng thời kiểm tra lại $V_e$ và hình dạng đường cong.

**Đầu vào bắt buộc từ nhóm:**

1. Tuấn/Nhật Anh cung cấp bảng cho HCl–NaOH, CH₃COOH–NaOH và NH₃–HCl.
2. Mỗi bảng ghi rõ nồng độ, thể tích ban đầu, $K_a$ hoặc $K_b$ nếu có, nhiệt độ,
	thể tích chất chuẩn, pH/pOH, species/mol dư, stage và nguồn tính tay.
3. Nhóm xác nhận tolerance số và quy ước endpoint/indicator nếu bảng có màu.

**Công việc của DEV:**

1. Lưu raw reference không chỉnh sửa vào `tests/fixtures/phase4Reference.js`.
2. Tạo automated tests đối chiếu input/output từng dòng, không sinh expected
	từ solver trong lúc test.
3. Kiểm tra $V_e$ độc lập từ stoichiometry và so với bảng.
4. Sinh curve từ engine, kiểm tra tăng dần, checkpoint, shape và sai lệch so với
	reference; không hard-code pH hoặc curve để làm test pass.
5. Ghi nguồn, phép tính, tolerance, reviewer và discrepancy vào report.

**PASS:** ba hệ có fixture độc lập; CHEM-01/03/04 và $V_e$/curve review PASS;
mọi discrepancy được giải thích hoặc trả lại nhóm; `npm run check` PASS.

**Không làm trong Phase 4:** Firebase, Google Sign-In, Firestore, Rules,
Hosting/deploy, lưu tài khoản hoặc thay đổi chemistry theo expected chưa được
nhóm xác nhận.

## Phase 5 — Scientific/UX release readiness

**Làm:** tổng hợp sai số/giới hạn mô hình, review UX/accessibility/responsive,
regression toàn hệ, test nội bộ và chuẩn bị release checklist. Chưa bật tài
khoản hay deploy Firebase; mọi thay đổi chemistry phải có reference đã review.

**PASS:** chemistry/UI tests PASS, mobile/accessibility review PASS, model limits
và nguồn được ghi rõ, GVHD/PO duyệt release candidate.

## Phase 6 — Firebase, accounts and deployment

**Làm:**

1. Firebase project/Hosting riêng và public Web config đã được PO xác nhận.
2. Google Sign-In; guest vẫn mô phỏng, login chỉ khi Lưu/Mở/Xóa ca.
3. Firestore profile/saved experiments, `modelVersion`, quota 50 ca và delete
	account/data.
4. Admin draft → published, Rules, Emulator tests và ownership tests.
5. Preview channel, deploy/rollback, production Hosting và smoke release.

**Boundary bắt buộc:** Firebase không quyết định pH, equivalence, endpoint,
stage hay curve; không lưu secret/token/curve arrays/ảnh/animation; không
production deploy nếu chưa có PO approval.

**PASS:** FB-01..06, Rules/Emulator PASS; đúng Project ID/commit; login-save,
guest simulation, chemistry regression, mobile và production smoke PASS; ghi
SHA/URL/rollback vào `PROGRESS.md` và `HANDOVER.md`.

## Backlog có chủ ý

HCl–NH₃ sau Phase 3; chỉ thị mới chỉ qua data/config; so sánh nhiều đường cong/lớp học/giao bài sau Phase 6; axit yếu–bazơ yếu chỉ khi có model + kiểm chứng được duyệt.
