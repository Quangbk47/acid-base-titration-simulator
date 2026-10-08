# Kiểm tra mô phỏng HCl–NaOH — 2026-10-08

Kết quả: các kiểm tra trong phạm vi bên dưới đều PASS sau khi sửa những lỗi
đã tái hiện. Kiểm tra trên working tree của nhánh `main`, HEAD
`31036396c40dece032f6081a82b705e97d97d387`, tại
`http://localhost:4173/simulate`. Đây là kiểm tra local bằng công cụ tự động,
không thay thế nghiệm thu của nhóm hoặc kiểm tra trên điện thoại vật lý.

## Hóa học và đồng bộ

Đầu vào: HCl 0,1 M, 25 mL; NaOH 0,1 M; 25°C; buret ban đầu 50 mL;
mỗi giọt giao diện 0,10 mL. Tham chiếu được tính từ số mol dư và tổng thể
tích, độc lập với dữ liệu hiển thị. Có 250 giọt tới điểm tương đương.

| NaOH đã thêm (mL) | pH tham chiếu | pH hiển thị | Buret còn (mL) | Bình chứa (mL) | Màu cân bằng |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 1,00 | 50 | 25 | Không màu |
| 0,1 | 1,003474 | 1,00 | 49,9 | 25,1 | Không màu |
| 12,5 | 1,477121 | 1,48 | 37,5 | 37,5 | Không màu |
| 24,9 | 3,698101 | 3,70 | 25,1 | 49,9 | Không màu |
| 25 | 7 | 7,00 | 25 | 50 | Không màu |
| 25,1 | 10,300162 | 10,30 | 24,9 | 50,1 | Hồng |
| 50 | 12,522879 | 12,52 | 0 | 75 | Hồng |

Ở cả bảy mốc, nhãn kết quả, state dùng cho 3D, hàng lịch sử và tọa độ điểm
hiện tại trên SVG đều khớp. 3D không có solver hóa học riêng. Kiểm thử unit
kiểm tra pH chưa làm tròn; giao diện chỉ hiển thị hai chữ số thập phân nên
giọt đầu tiên chưa làm nhãn pH thay đổi rõ rệt.

Phenolphthalein không màu ở pH 7 và bắt đầu hồng trong vùng chuyển màu
8,2–10. Không dùng nhãn “tương đương” để quyết định màu cho mọi hệ hóa học.
Hiệu ứng hồng cục bộ trước tương đương là hiệu ứng giọt tạm thời, khác màu
cân bằng; hiệu ứng đang chờ được hủy khi tạm dừng hoặc đặt lại.

## Thao tác, camera và hiển thị

- Tính trạng thái: tạo state hợp lệ, vẽ kết quả/3D/đồ thị; tính lại trong khi
  chạy hủy lịch chạy cũ. Trước khi tính, các nút mô phỏng bị vô hiệu hóa.
- Thêm giọt: tăng NaOH 0,10 mL, giảm buret đúng lượng đó, tăng tổng thể tích
  trong bình; cập nhật pH và lịch sử. Không thêm được khi buret không đủ giọt.
- Chạy tự động: kiểm tra cả ba tốc độ, cập nhật từ cùng state; buret 0,2 mL
  dừng sau hai giọt. Giới hạn chạy tự động hiện có là 2 × V tương đương.
- Tạm dừng: thể tích/lịch sử ổn định và không còn timer chỉ thị xuất hiện muộn.
- Đặt lại: khôi phục đầu vào ban đầu của phiên và lịch sử, kể cả khi đang chạy.
- Ca mẫu 100% V tương đương: khởi tạo đúng 25 mL, pH 7 và 50 mL trong bình.
- Camera: kéo xoay, con lăn zoom, chuột phải pan, đặt lại góc nhìn đều PASS;
  thao tác camera không thay đổi trạng thái hóa học. Một/hai ngón cũng PASS
  trong giả lập cảm ứng.
- Responsive: PASS tại 320/375/430/768/1023/1024/1366/1920 px; không tràn
  ngang, hai cột cân đối từ 1024 px, xếp dọc dưới 1024 px, SVG resize đúng.
  WebGL không khả dụng vẫn dùng hình dự phòng và thao tác mô phỏng bình thường.

## Lỗi tái hiện và bản sửa

Baseline ghi nhận bảy kiểm tra thất bại, không có exception trình duyệt:

| Lỗi trước sửa | Cách sửa và kiểm tra lại |
| --- | --- |
| pH 7 bị tô hồng tại tương đương | Quyết định màu theo pH; 25 mL không màu, 25,1 mL hồng |
| Buret hết vẫn thêm được tới 50,1 mL | Chặn giọt vượt lượng còn lại ở tầng state và vô hiệu hóa nút |
| Timer chỉ thị xuất hiện sau Pause | Chỉ giữ một timer; hủy timer và hiệu ứng khi Pause/Reset |
| Tính lại khi auto vẫn tiếp tục tăng thể tích | Pause runner trước khi đánh giá đầu vào mới |
| Ca mẫu 100% V tương đương nạp 0 mL | Nạp VbMl của ca mẫu, xác nhận 25 mL/pH 7 |
| Chấp nhận buret âm | Kiểm tra số hữu hạn không âm và hiển thị lỗi ở trường nhập |
| Buret 0 mL bị thay bằng 50 mL | Giữ đúng giá trị 0 trong state và mô hình 3D |

Bộ peer-run cũ cũng có lỗi kiểm tra: dùng Promise của `isDisabled()` như
boolean, kỳ vọng mọi nút luôn bật, kỳ vọng giọt 0,05 mL, chọn nhầm hai nút
đặt lại và tìm thuộc tính chỉ có trong hàng placeholder phản ứng. Đã sửa
các kiểm tra theo DOM/hành vi hiện tại; không thêm phần giao diện mới.

Không sửa công thức trong `src/chemistry/`, thiết kế/CSS, dependency manifest
hoặc cấu hình Firebase trong đợt kiểm tra này. Thay đổi `firebase.json` đã
staged từ trước được giữ nguyên. Không commit, push hoặc deploy.

## Kết quả và tái chạy

| Bộ kiểm tra | Kết quả |
| --- | --- |
| `npm run check` | Lint 53 file, format 27 file; 86/86 test PASS, 0 skip |
| `npm run audit` | 8/8 kiểm tra phase PASS |
| `node tests/titration-audit.browser.mjs` | PASS, findings rỗng, không page error |
| `node tests/vessel3d.browser.mjs` | PASS: camera, cảm ứng, responsive, đồng bộ, fallback |
| `npm run peer-run` | 11/11 kiểm tra PASS; không console/runtime error |
| Firestore emulator integration | 2/2 PASS trên project demo local, cổng 8085 |
| `git diff --check` | PASS |

Bổ sung sáu unit test trong `tests/titration-audit.test.js` và một kịch bản
trình duyệt có kiểm tra trước/sau sửa. Server phải chạy trước các browser test.
Nếu Playwright ở thư mục QA riêng, đặt `PLAYWRIGHT_MODULE` tới `index.mjs`.
Browser test dùng Edge; peer-run nhận `PLAYWRIGHT_CHANNEL=msedge` và có thể
đặt `PEER_RUN_REPORT_PATH` để giữ nguyên báo cáo peer lịch sử.

Máy chưa cài các devDependency tại root, nên lệnh `npm run security:test`
ban đầu thiếu `@firebase/rules-unit-testing`. Đã cài đúng các package cần
thiết vào thư mục TEMP, sao chép nguyên test/rules sang đó và chạy cùng test
qua `firebase emulators:exec` với project `demo-acid-base-titration`. Cả hai
test đạt; emulator đã dừng. Không dùng dữ liệu Firebase thật, không thay đổi
package.json/package-lock.json. Log ở `%TEMP%/acid-base-firestore-audit/emulator-test.log`.

Bằng chứng local (chưa commit): `tmp/titration-audit/baseline.json`,
`results.json`, `baseline-equivalence.png`, `equivalence.png`, `peer-run.md`;
ảnh responsive/camera ở `tmp/vessel3d-qa/`.

## Giới hạn còn lại

Không còn lỗi tái hiện trong các kịch bản đã chạy. Chưa kiểm tra Safari/iOS,
điện thoại vật lý hoặc benchmark GPU/FPS. Hình học chất lỏng là minh họa thể
tích, không phải mô phỏng dòng chảy. Cần cài devDependency thông thường nếu
muốn chạy trực tiếp các lệnh Playwright/Firestore tại root mà không dùng
thư mục QA riêng. Kết quả này không xác nhận production hay nghiệm thu PO.
