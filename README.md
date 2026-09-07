# Acid–Base Titration Simulator

Website mô phỏng tương tác phục vụ đề tài NCKH: **xây dựng, kiểm chứng và trực quan hóa mô hình chuẩn độ axit–bazơ trên nền tảng website tương tác**.

## Mục tiêu

- Tính pH, thành phần dung dịch, điểm tương đương và điểm kết thúc theo thể tích chất chuẩn.
- Trực quan hóa buret, bình tam giác, chỉ thị màu và đường cong pH–V theo từng giọt.
- Hỗ trợ học theo hai chế độ: **Khám phá** và **Hướng dẫn**.
- Kiểm chứng mô hình bằng tính tay và dữ liệu tham chiếu trước khi công bố ca mô phỏng.

## Phạm vi bản đầu

- Ca lõi: HCl–NaOH và CH₃COOH–NaOH; HCl–NH₃ là mở rộng gần.
- Phenolphthalein hoạt động thật; kiến trúc mở để thêm chỉ thị.
- Khách dùng mô phỏng ngay. Đăng nhập Google chỉ cần khi lưu tối đa 50 ca, đường cong và báo cáo tóm tắt.
- Admin quản trị chất, `Ka`/`Kb`, chỉ thị, ca chuẩn và gợi ý Hướng dẫn theo Nháp → Xuất bản.

## Công nghệ và dịch vụ

- HTML, CSS, JavaScript thuần (ES modules).
- Firebase Authentication (Google Sign-In), Cloud Firestore và Firebase Hosting.
- Firebase project riêng cho nhóm; không dùng chung hay tác động bất kỳ Firebase project nào của dự án khác.

## Cách đọc tài liệu

1. `docs/PROJECT_RULES.md` — quy tắc nhóm, GitHub và deploy.
2. `docs/ROADMAP.md` — thứ tự phase và điều kiện hoàn tất.
3. `docs/CHEMISTRY_MODEL.md` — giả thiết, công thức và miền áp dụng.
4. `docs/UI_UX_SPEC.md` — màn hình, trạng thái và responsive.
5. `docs/TEST_CASES.md` — kiểm chứng khoa học, UI và Firebase.

## Trạng thái

**Phase 2 — READY TO CLOSE (acceptance PASS).** Phase 2 simulation/UI đã hoàn
tất implementation và acceptance: SIM-01..03, UI-01..03, CHEM-06, responsive
runtime và reduced-motion runtime đều PASS; automated suite 36/36 PASS. Phase 2
closeout commit là `e6ffd10c43e9b2627f640e19a5dec95329ffdaff`. Phase 3
CH₃COOH–NaOH/Guided/report đã có implementation nhưng vẫn cần review riêng.
Firebase và production chưa deploy.
