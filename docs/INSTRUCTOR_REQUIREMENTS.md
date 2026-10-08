# Bàn giao bốn yêu cầu giảng viên — 2026-10-08

Trạng thái: triển khai và kiểm thử local; chưa commit, push hoặc deploy.
Preview: http://localhost:4173/simulate.

## Hành vi đã triển khai

1. **Reset thí nghiệm**: luôn về 0 mL, kể cả ca mẫu bắt đầu ở thể tích khác 0. Giữ nồng độ, thể tích chất phân tích, cặp hóa học, tốc độ, kiểu đồ thị và dung tích buret đã khởi tạo. Nạp lại buret; tính lại trạng thái hóa học ban đầu; xóa lịch sử cũ, giữ một điểm ban đầu. Hủy timer tự động, hiệu ứng chỉ thị, giọt và splash; callback cũ không thể cập nhật lượt chạy mới.
2. **Kết quả lý thuyết**: nằm trước khu vực nút chạy, hiển thị phương trình, số mol với thể tích theo L, quan hệ mol 1:1, công thức/thể tích tương đương theo mL và pH tương đương ở 25 °C. Ca mặc định hiện kết quả ngay khi mở. Sửa thông số đánh dấu cần tính lại và dừng lượt chạy trước; nút “Tính trạng thái” giữ chức năng tính trạng thái hiện tại và cập nhật lý thuyết.
3. **Kiểu đồ thị**: giữ kiểu điểm, thêm nét liền nối trực tiếp lịch sử mô phỏng đã sắp theo thể tích. Không spline, không làm mượt hoặc tạo giá trị pH nội suy. Mẫu từ engine được phân biệt với dữ liệu mô phỏng bằng màu tím/nét đứt. Đổi kiểu chỉ vẽ lại đồ thị, không thay đổi state, timer hoặc lịch sử.
4. **Trục và giá trị điểm**: pH 0–14 với bước 2; trục V NaOH đã thêm (mL), đổi thành HCl khi chuẩn độ NH₃ bằng HCl. Phạm vi dựa vào 2 lần thể tích tương đương và thể tích hiện tại. Giảm số nhãn thể tích trên mobile. Hover, focus và chạm điểm hiển thị V/pH bốn chữ số thập phân.

## Sửa lỗi phát hiện trong quá trình tích hợp

- Adapter NH₃–HCl trước đây gán tên chất phân tích/chất chuẩn ngược với solver và thêm giọt vào Vb của chất phân tích. Đã sửa tên, trường thể tích chất chuẩn Va, trạng thái Reset và nhãn buret/đồ thị, dùng solver NH₃–HCl đang có.
- Hai solver yếu dừng chia đôi ở khoảng logH 1e-12 trong khi còn chưa đạt residual 1e-14 tại một số mẫu. Đã hạ điều kiện dừng khoảng xuống 1e-14. Không đổi phương trình cân bằng, hằng số hóa học hoặc ngưỡng residual. Có regression cho NH₃–HCl tại 44/47/49/49,5 mL và axit yếu tại 44 mL.
- Export SVG trước đây không chấp nhận nhãn text/title và thuộc tính trợ năng mới. Danh sách cho phép đã mở rộng cho các phần tử thụ động cụ thể; vẫn từ chối script, sự kiện inline, URL ngoài, foreignObject và thuộc tính không hợp lệ.
- Test Reset cũ mong giữ 12,5 mL được đổi thành 0 mL theo yêu cầu mới; test tọa độ đồ thị cập nhật padding dành cho nhãn trục, giữ kiểm tra pH và vị trí điểm.

## File thay đổi

- Giao diện: `index.html`, `assets/styles.css`.
- Lý thuyết/đồ thị/form: `src/ui/theoryView.js` (mới), `src/ui/chartView.js`, `src/ui/inputForm.js`, `src/ui/validation.js`.
- Reset/timer: `src/simulation/state.js`, `src/simulation/runner.js`.
- Mô hình 3D: `src/ui/vesselModel.js`, `src/ui/vesselScene.js`.
- Hội tụ solver: `src/chemistry/weakAcidStrongBase.js`, `src/chemistry/weakBaseStrongAcid.js`.
- Export thụ động: `src/ui/htmlSafety.js`.
- Kiểm thử: `tests/instructor-requirements.test.js` và `tests/instructor-requirements.browser.mjs` (mới); `tests/simulation.test.js`, `tests/security.test.js`, `tests/titration-audit.browser.mjs`, `tests/vessel3d.browser.mjs`.
- Báo cáo: file này.

## Kết quả kiểm thử

- `npm run check`: lint/format đạt; 101/101 unit tests đạt.
- `npm run audit`: 8/8 kiểm tra phase đạt.
- Integration Firestore hiện có: 2/2 đạt trên Emulator project demo, dùng `firestore.rules` nguyên trạng. Không truy cập dữ liệu production.
- Browser `instructor-requirements`: đạt kiểm tra 25/40 mL, đổi thông số, ba trạng thái Reset và ca mẫu khác 0, chuyển kiểu, nối chính xác các điểm, trục và readout, hệ yếu, sáu kích thước màn hình và thao tác touch.
- Browser `titration-audit`: đạt bảy mốc 0 đến 50 mL, điểm tương đương 25 mL/pH 7, màu chỉ thị, thể tích, chạy/tạm dừng/Reset và các tốc độ; không có findings hay uncaught errors.
- Browser `vessel3d`: đạt camera/zoom/pan/reset, trạng thái/màu/đồ thị, touch, tám kích thước màn hình, bố cục cân đối và fallback.
- Browser `security`: export giữ đồ thị, không thực thi XSS, từ chối đồ thị chủ động, đầu vào sai bị chặn; không có yêu cầu ngoài hoặc uncaught errors.
- Build local đạt. Build có `dirty=true` vì thay đổi chưa commit; không dùng bản này để khẳng định website công khai đã cập nhật.
- Ảnh và kết quả local ở `tmp/instructor-requirements/`; kết quả regression hiện có ở `tmp/titration-audit/`, `tmp/vessel3d-qa/`, `tmp/security-audit/` (được Git bỏ qua).

## Phạm vi và điểm cần xác nhận

Không cài thêm thư viện; dùng Three.js/SVG và bộ công cụ QA đã có. Không sửa Firestore Rules, Firebase Hosting config, secrets hoặc dữ liệu thật. Không commit, push hay deploy trong lượt này.

Các hệ hỗ trợ đều đơn proton, tỉ lệ 1:1 và 25 °C. Ka/Kb vẫn dùng dữ liệu hiện có 1,8e-5; chưa mở rộng đa proton, nhiệt độ khác hoặc thay nguồn hằng số. Mobile được kiểm tra bằng Edge emulation/touch; chưa thử trên thiết bị iOS/Safari thật.

Người chốt phiên bản cần xem preview và duyệt bản sửa trước khi yêu cầu commit/push/deploy ở lượt tiếp theo. Website công khai hiện chưa chứa bốn thay đổi này.
