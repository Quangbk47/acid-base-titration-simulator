# Hoàn thiện cảnh thí nghiệm 3D — 21/10/2026

## Phạm vi và lỗi đã sửa

- Giữ hình học dụng cụ đã hoàn thiện: bình đáy kín/cổ mở, kẹp ngang, đế tách bình, vòi thẳng tâm cổ bình. Camera mặc định gần hơn một chút, vẫn thấy nhãn đầu buret và mặt bàn.
- Bỏ nước xám và mặt phủ đục. Nước dùng alpha blending, ánh phản xạ và mặt khum nhẹ; tránh nhiều lớp transmission làm mẫu ban đầu gần như biến mất. Màu nền quang học nhạt không biểu thị phản ứng hóa học.
- V chất chuẩn = 0: bình vẫn có mẫu ban đầu (mặc định 25 mL), buret 50 mL, không giọt/gợn/hiệu ứng phản ứng. Đổi thể tích mẫu cập nhật preview cả trước khi tính trạng thái. Readout phân biệt mẫu ban đầu, chất chuẩn đã thêm và tổng trong bình.
- Thể tích bình lấy từ state/result, buret chỉ trừ lượng thực sự cấp kể từ trạng thái ban đầu. Chiều cao lấy từ tích phân các đoạn nón cụt và phép đảo số; giữ khoảng hở thành/đáy, không thay bằng chiều cao tuyến tính.
- Lựa chọn rõ ràng: không dùng chỉ thị (mặc định, luôn không màu) hoặc phenolphthalein (màu từ pH hiện tại). Đổi lựa chọn không đổi pH, thể tích, lịch sử hay đồ thị. Ngưỡng pH 8,2 trên đồ thị được ghi là tham khảo phenolphthalein. Không tự bổ sung chỉ thị chưa có mô hình kiểm chứng.
- Chỉ phát giọt khi bộ đếm tăng đúng một, thể tích thêm tăng và buret giảm; đổi pH, tải snapshot hay tăng bộ đếm đơn thuần không phát giọt. Giọt tăng tốc rơi vào bình, thời gian ngắn hơn ở tốc độ nhanh. Gợn không tự tô hồng khi thêm NaOH.
- Pause/reset/ẩn tab/ẩn viewport/reduced-motion hủy hiệu ứng. Geometry giọt dùng chung, geometry chất lỏng cũ được dispose; idle ngừng render. Không thêm thư viện, texture ngoài hay particle system.

## Kiểm thử

- npm run check: 132/132 unit test, lint và format PASS.
- npm run build: PASS.
- Unit bổ sung: preview 10/25/75 mL; mọi pH không chỉ thị đều không màu; chỉ phát giọt khi thực sự cấp thêm; giữ kiểm tra độc lập volume–height, biên thành/mặt khum và hình học dụng cụ.
- vessel-quality.browser.mjs: V=0; đổi mẫu trước khi chạy; 500 giọt đầy/gần cạn/cạn; bình 25→75 mL; trước/tại/sau tương đương; bật/tắt phenolphthalein không mất dữ liệu; giọt/gợn, reset, fullscreen, mobile, giới hạn draw calls/geometry và idle không render.
- vessel3d.browser.mjs: xoay/zoom/pan/reset camera, chạy/tạm dừng/reset, màu/pH/đồ thị, touch, WebGL fallback và 8 chiều rộng 320–1920 px.
- Browser regression PASS: titration-audit (7 mốc 0–50 mL, pH/màu/thể tích/đồ thị), instructor-requirements (9 nhóm reset/lý thuyết/đường cong/responsive), research-upgrade (6 hướng chuẩn độ/fullscreen/nhãn/Excel) và lab-upgrade (import CSV/XLSX, đánh giá, lịch sử local, mobile). Không chạy kiểm thử tài khoản online hoặc Firebase Emulator trong tác vụ 3D này.
- Đã xem ảnh trạng thái ban đầu, hồng sau tương đương và mobile trên Edge headless. Ảnh/log local tại tmp/vessel-quality-qa, không đưa vào Git.

## Giới hạn

Đây là minh họa tương tác, không phải CAD hoặc mô phỏng động lực học chất lỏng. Chưa benchmark FPS trên điện thoại thật; mobile vẫn giảm segment/DPR và tắt shadow. Không sửa chemistry engine, đánh giá số liệu, tài khoản, lịch sử, Excel, thư viện hay Firebase. Không deploy Hosting/Rules. File có sẵn git-contributions.txt được giữ ngoài commit.
