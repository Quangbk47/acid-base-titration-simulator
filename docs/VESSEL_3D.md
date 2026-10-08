# Mô hình nhỏ giọt 3D

Chạy `npm start`, mở `http://localhost:4173/simulate`.
Trong VS Code: Ctrl+Shift+P → Simple Browser: Show → nhập URL trên.
Nhấn **Tính trạng thái** trước khi thêm giọt hoặc chạy tự động.

## Điều khiển

- Kéo chuột trái: xoay 360°; con lăn: zoom; kéo chuột phải: pan.
- Điện thoại: một ngón xoay, hai ngón chụm/di chuyển để zoom/pan.
- **Góc nhìn ban đầu** đặt lại camera, không đặt lại thí nghiệm.
- Khi canvas có focus, phím mũi tên di chuyển góc nhìn.

## Tích hợp và phạm vi

Vùng `.vessel-stage` dùng WebGL cho mô hình thí nghiệm.
`inputForm.js` phát state qua callback sau render và khi đổi trạng thái.
`vesselView.js` lưu state mới nhất, cập nhật nhãn và tải `vesselScene.js`
khi viewport xuất hiện. `vesselModel.js` ánh xạ thể tích/chỉ thị hiện có sang
mô hình hiển thị; không tính lại pH hoặc thay đổi solver/runner.

Trang mô phỏng dùng vùng thông số và điều khiển chung ở trên, mô hình 3D
bên trái và đồ thị pH–V bên phải. Desktop từ 1024 px dùng hai cột bằng nhau,
khung trang tối đa 1560 px; màn hình nhỏ hơn xếp dọc. Hai panel cùng chiều
cao trên desktop, lịch sử đồ thị có vùng cuộn riêng. SVG đo kích thước thực
và ResizeObserver vẽ lại khi đổi kích thước, dùng cùng state/history hiện có.
Kiểu trang chủ giữ nguyên.

Three.js 0.186.1 và hai addon nằm ở `assets/vendor/three/`, có giấy phép MIT.
Các import tương đối chạy bằng server tĩnh hiện có. Script build copy toàn bộ
`assets` và `src` nên tự bao gồm module mới. Không đổi package.json,
package-lock.json hoặc Firebase config.

Giọt được kích hoạt khi `dropCount` tăng, không từ một timer độc lập.
Pause/reset/chuyển ca hủy hiệu ứng cục bộ. Tốc độ không tham gia hóa học.
Màu lấy từ `derivePhenolphthaleinState` theo pH: không màu ở pH 7, chuyển hồng
trong vùng 8,2–10. Audit HCl–NaOH đã sửa màu hồng sai tại điểm tương đương.
Thể tích buret lấy từ lượng chất chuẩn đã thêm sau thời điểm bắt đầu;
chiều cao dung dịch trong bình được suy từ hình học hình nón cụt.
Đây là mô hình minh họa, không phải mô phỏng cơ học chất lưu hay động học.
Với đầu vào lớn, dung tích bình minh họa được tăng; các nhãn thể tích vẫn
là số liệu từ state.

## Hiệu năng và dự phòng

- Chỉ render khi camera/giọt/hiệu ứng thay đổi; dừng khi viewport hoặc tab ẩn.
- Giới hạn DPR 1.75 desktop / 1.25 mobile, giảm số phân đoạn trên mobile.
- Mobile không bật shadow map; tái sử dụng pool sáu giọt và các material.
- Ánh sáng môi trường tạo cục bộ, không có texture HDR hoặc CDN bên ngoài.
- Hỗ trợ `prefers-reduced-motion`; dispose renderer/geometry/material.
- WebGL không khả dụng hoặc mất context: trở lại hình minh họa CSS;
  form, solver và biểu đồ vẫn hoạt động.

## Kiểm tra

`npm run check`: lint, định dạng và 92 test đều PASS sau security audit.
Audit chi tiết, lỗi đã sửa và cách tái chạy: [HCL_NAOH_AUDIT.md](HCL_NAOH_AUDIT.md).
Phát hiện bảo mật và các thay đổi đang chờ xác nhận: [SECURITY_AUDIT.md](../SECURITY_AUDIT.md).

`node tests/vessel3d.browser.mjs`: cần Playwright, Edge và server cổng 4173.
Có thể đặt `PLAYWRIGHT_MODULE` tới `index.mjs` của Playwright trong thư mục
cài đặt QA riêng. Test headless kiểm tra WebGL, thêm giọt, run/pause/reset,
thể tích, màu sau tương đương, bảng đồ thị, xoay/zoom/pan/reset camera,
cảm ứng một/hai ngón, đổi ca và fallback không có WebGL.
Không overflow tại 320/375/430/768/1023/1024/1366/1920 px. Test kiểm tra
chiều cao/căn hàng hai cột, bố cục dọc, resize SVG, lịch sử có scrollbar,
placeholder được ẩn đúng và pH của mô hình/biểu đồ/state trùng nhau.
Ảnh ở `tmp/vessel3d-qa/`, gồm `two-columns.png` và `workspace-mobile.png`.

Đã kiểm tra và xem ảnh desktop, màu hồng và mobile trên Edge headless.
Chưa benchmark FPS trên điện thoại vật lý; không suy ra tốc độ GPU thực
từ môi trường giả lập viewport/cảm ứng.
