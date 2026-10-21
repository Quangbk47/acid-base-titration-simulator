# Hoàn thiện cảnh thí nghiệm 3D — 21/10/2026

Chỉ thay `vesselModel.js`, `vesselScene.js` và kiểm thử liên quan. Giữ nguyên chemistry engine, state, indicator, camera/zoom/pan/fullscreen, đánh giá dữ liệu, tài khoản, lịch sử và Excel. Không đổi thông tin nhóm, dependency hoặc Firebase.

- Tách đế giá khỏi bình; đáy bình và đế tiếp xúc mặt bàn. Kẹp chuyển về mặt phẳng ngang để ôm buret, tay nối chạy đúng từ trụ đến phía sau kẹp, chừa phía trước cho vạch chia.
- Thủy tinh giữ thân rỗng, đáy kín và cổ mở. Profile lòng bình dùng chung với chất lỏng; có khoảng hở nhỏ tránh xuyên thành và z-fighting. Thể tích hình học là tích phân chính xác từng đoạn nón cụt, đảo bằng bisection; unit test đối chiếu tích phân số độc lập, sai số tỉ phần <2×10⁻⁶. Không thay đổi thể tích hóa học.
- Mặt khum, đường tiếp xúc chất lỏng và viền cổ bình rõ hơn; chất lỏng buret đi liên tục từ ống đến vòi, nằm trong lòng thủy tinh. Mặt chất lỏng đầy trùng vạch 0, mức cạn trùng đáy thang. Màu nền trung tính là biểu diễn quang học cho chất lỏng không màu; màu hồng vẫn lấy từ phenolphthalein hiện có, không bổ sung chất chỉ thị mới.
- Khóa buret giữ thân cố định, chỉ tay vặn chuyển trạng thái. Giọt rơi tăng tốc theo thời gian, hình giọt dãn nhẹ; gợn cục bộ khi chạm được giới hạn trong lòng bình. Không tô hồng toàn bộ bình bởi hiệu ứng thoáng qua trước tương đương. Reset/pause/hide/reduced-motion tiếp tục hủy hiệu ứng theo cơ chế cũ.
- Sáu giọt dùng chung một geometry. Chỉ dựng lại geometry chất lỏng khi mức thay đổi và dispose geometry cũ; không render liên tục khi idle. Không thêm texture tải ngoài, đèn hoặc particle system.

## Kiểm thử

- `npm run check`: 130/130 PASS, lint/format PASS.
- `npm run build`: PASS.
- Unit: volume–height, biên thành bình/mặt khum, vị trí đế/đầu vòi, thang buret, đồng bộ thể tích/pH và lazy loader.
- Browser mới `vessel-quality.browser.mjs`: 500 giọt từ đầy đến 0,10 mL và cạn; mực bình 25→75 mL; giọt/va chạm; không màu tại tương đương và hồng sau tương đương; Reset; fullscreen; mobile; không rò geometry và idle ngừng render.
- Browser cũ: vessel3d, instructor-requirements, research-upgrade, titration-audit PASS, gồm xoay/zoom/pan/reset camera, run/pause/reset, màu/pH/đồ thị, các cặp, touch, WebGL fallback và 8 chiều rộng 320–1920 px.
- Đã xem ảnh desktop/mobile, đầy/gần cạn/hồng/fullscreen. Bằng chứng được gitignore tại `tmp/vessel-quality-qa`.

Đối chiếu render cùng 1440×1000, cùng trạng thái ban đầu trên Edge headless: bản trước 74 draw calls / 20.950 tam giác; bản mới 72 / 20.886. Đây không phải benchmark FPS hoặc bảo đảm mọi GPU/điện thoại. Mobile vẫn giới hạn segment/DPR và tắt shadow như trước. Kiểm thử 500 giọt xác nhận số geometry không tăng tích lũy (chỉ thêm geometry giọt và ripple khi lần đầu hiện).

Mô hình là minh họa tương tác, không phải bản CAD hoặc mô phỏng động lực học chất lỏng. Thông số hóa học, mL, pH và màu chỉ thị vẫn lấy từ engine hiện có. Bản source và test được push GitHub; không deploy Hosting/Rules trong tác vụ này. Giữ nguyên file có sẵn `git-contributions.txt` ngoài commit.
