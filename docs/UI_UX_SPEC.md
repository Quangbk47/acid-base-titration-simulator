# UI / UX SPEC — ĐẶC TẢ TRIỂN KHAI

## Trang và quyền

- `/`: thư viện ca published, giới thiệu giới hạn mô hình, nút vào mô phỏng.
- `/simulate`: Guest chạy tất cả chức năng khoa học; login chỉ xuất hiện khi Lưu/Mở/Xóa ca.
- `/admin`: chỉ role admin; các route khác không được dựa vào việc ẩn nút để bảo mật.

## State màn mô phỏng

`idle`, `validating`, `ready`, `running`, `paused`, `input-error`, `solver-error`, `saving`, `saved`. UI phải disable/enabled controls theo state; không để bấm Run nhiều lần tạo nhiều timer.

## Layout desktop/mobile

Desktop ≥1024px: hai panel ngang bằng nhau: trái thí nghiệm + controls + chemistry panel; phải graph. 768–1023px vẫn ưu tiên dễ đọc, có thể giảm panel. <768px: một cột, experiment/control trước graph; chemistry panel accordion; không dùng tooltip duy nhất cho thông tin bắt buộc.

## Component bắt buộc

1. Case selector + form chất/nồng độ/thể tích/Ka-Kb/chỉ thị.
2. Buret: thể tích còn lại, giọt đang rơi; bình: volume tăng đúng drop.
3. pH meter pH 0,01 + nhãn Axit/Trung tính/Bazơ; bảng pH, V, mol/ion, reaction, excess, stage.
4. Controls: Add drop, Run/Pause, Reset, drop-size, speed Slow/Medium/Fast, Restore sample.
5. Chart: axis/unit, current point, half-eq/eq/endpoint legend riêng, bảng dữ liệu/text alternative.
6. Guided: chỉ một prompt đúng milestone hiện tại; feedback sau quan sát, không làm thay đổi chemistry.

## Quy tắc tương tác

- `addDrop` là single source of truth; không cập nhật graph/meter bằng event riêng.
- Speed chỉ thay delay; test cùng volume cho output giống nhau.
- Reset dừng timer/animation, hủy local effect, xóa history và tải sample/input hiện tại.
- Error message gần input, có aria-live; chart/màu không là kênh thông tin duy nhất.

## Admin

Danh sách có filter draft/published; form có Preview, Save draft, Publish/Unpublish; publish phải validate dữ liệu hóa và hiện ảnh hưởng. Không cho learner nhìn/nạp draft qua client query.
