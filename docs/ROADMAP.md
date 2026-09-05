# ROADMAP TRIỂN KHAI CHI TIẾT

## Cách dùng

Roadmap là hợp đồng giao việc. Không nhảy phase: mỗi phase chỉ bắt đầu sau khi đọc các tài liệu liên quan và chỉ `DONE` khi toàn bộ gate PASS. Trạng thái: `PLANNED → IN PROGRESS → DEV PASS → PO TESTING → PO PASS → DONE`. Mọi phase phải ghi branch/SHA, file sửa, test, preview, rủi ro và bước sau vào `PROGRESS.md`.

## Mô hình delivery sau Phase 1

Từ sau khi Phase 1 đạt PO PASS, dự án có hai track:

* Main track: `Phase 2 → Phase 3`
* Firebase track: `Phase 4A`

Phase 4A được phép chạy song song với Phase 2–3; Phase 4B chỉ mở sau khi
interface cần thiết của Phase 2–3 đã ổn định.

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

## Phase 4A — Firebase Foundation / Infrastructure

Phase 4A được phép chạy **song song với Phase 2–3** sau khi:

* Phase 1 đạt PO PASS;
* có Firebase Project ID riêng;
* có người phụ trách.

**Owner:** **Bắc Hà — Firebase/Deployment Owner**

**Làm:**

1. Firebase project riêng của repo và Firebase Hosting.
2. `.firebaserc`, `firebase.json`, `src/firebase/config.js` và `src/firebase/auth.js`.
3. Repository skeleton cho profile/experiments.
4. Google Auth skeleton và Firestore schema/repository skeleton.
5. Firestore Rules và emulator tests.
6. Preview channel, deploy/rollback documentation.
7. Cập nhật Project ID, Hosting Site, Preview URL và SHA.

**Boundary bắt buộc:**

* Không sửa hoặc quyết định logic trong `src/chemistry/**`.
* Firebase không quyết định pH, equivalence, endpoint hay stage.
* Không tự ý thay đổi lõi `src/simulation/**`.
* Firebase chỉ lưu/đọc state do application layer cung cấp.
* Nếu cần đổi interface app ↔ Firebase phải ghi contract rõ.
* Không production deploy nếu chưa có PO approval.

**PASS:**

* Đúng Firebase project riêng.
* Hosting/config skeleton hoạt động.
* Rules/emulator baseline PASS.
* Có preview URL + SHA + rollback record.
* Chemistry regression vẫn PASS.

## Phase 4B — Firebase Learner Integration

Chỉ bắt đầu tích hợp sâu khi interface cần thiết của Phase 2–3 đã ổn định.

**Làm:**

1. Guest vẫn mô phỏng không login; Google Sign-In chỉ khi Lưu/Mở.
2. Lưu `input + modelVersion + volume/state + summary`.
3. Giới hạn 50 ca, không auto-delete.
4. Xóa account/data.
5. Hoàn thiện FB-01..05.

Chỉ khi **4A + 4B cùng PASS** mới được đánh dấu toàn bộ Phase 4 DONE.

## Phase 5 — Admin Nháp → Xuất bản

**Làm:** bootstrap Admin thủ công sau khi UID tồn tại; CRUD chất/Ka/Kb/chỉ thị/ca/prompt có validation; Admin thấy nháp, Guest/Learner chỉ published; lưu `updatedAt/updatedBy`; sửa thư viện không làm hỏng ca đã lưu/modelVersion.

**PASS:** FB-06 và test âm quyền nội dung PASS; URL trực tiếp không lộ nháp; nội dung trước publish có review khoa học ghi bằng chứng.

## Phase 6 — Kiểm chứng NCKH và phát hành

**Làm:** hoàn thiện bảng sai số/nguồn/giới hạn mô hình; accessibility/performance/error states; regression; preview; test nội bộ; deploy `--only hosting`; smoke production; ghi SHA/Project ID/URL/rollback vào PROGRESS/HANDOVER.

**PASS:** toàn bộ chemical/UI/Firebase tests PASS; đúng project/commit; Guest simulation, pH–màu–graph, mobile và login-save (nếu đã có) smoke PASS; GVHD/PO nghiệm thu thực.

## Backlog có chủ ý

HCl–NH₃ sau Phase 3; chỉ thị mới chỉ qua data/config; so sánh nhiều đường cong/lớp học/giao bài sau Phase 6; axit yếu–bazơ yếu chỉ khi có model + kiểm chứng được duyệt.
