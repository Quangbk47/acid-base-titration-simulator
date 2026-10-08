# Nâng cấp phục vụ nghiên cứu khoa học — báo cáo bàn giao local

Yêu cầu tổng hợp chính thức được tiếp nhận ngày 08/10/2026; kiểm chứng cuối ngày 09/10/2026. Đây là bản nâng cấp **local, chưa commit hoặc xuất bản**.

## Bảo toàn phiên bản

- Nhánh hiện tại: main. HEAD vẫn là 85a314a26d63558788a79d83044d7249c41988ed; remote main đã được kiểm tra đọc ở đầu lượt và trùng HEAD.
- Đã sao lưu nguyên trạng 20 file có thay đổi từ lượt trước, cùng working-tree.patch, tại tmp/research-upgrade-baseline (được Git bỏ qua). Không reset hoặc xóa chúng.
- Không commit, push, force push, deploy, đổi Firestore Rules/Hosting production, đọc hay thay đổi dữ liệu production. Website công khai vẫn giữ bản trước.
- 15 file được sửa tiếp trong lượt này, 12 file được thêm; 9 file mang thay đổi cũ được giữ nguyên byte. Danh sách ở cuối báo cáo.

## Hoàn thành theo giai đoạn

| Giai đoạn | Kết quả | Kiểm chứng |
| --- | --- | --- |
| 1. Đồng bộ hệ và dự đoán | Danh mục/cặp chất dùng chung; chọn đúng bình–buret theo loại; nhãn/formula/trục/mô hình đổi đồng bộ; hủy trạng thái và dữ liệu cũ khi chỉnh input. Nút Dự đoán điểm tương đương độc lập, có mol, tỉ lượng, công thức, thể tích, pH/vùng pH và đồ thị trước khi chạy. | Unit các cặp, 25/40 mL; browser đổi đủ sáu cặp/chiều, dự đoán khi chưa chạy và khi đang chạy không tiêu hao hoặc dừng runner. |
| 2. Reset, 3D, đồ thị | Tái sử dụng Reset đã có, không tạo runner thứ hai; reset về 0, nạp lại buret, giữ setup/speed. Fullscreen native, nút thoát, Esc và fallback; renderer/camera resize. Giữ điểm/nét liền, không làm mượt; các trục có số/đơn vị, tooltip chuột/Tab/chạm, mốc hai nấc. | Browser Reset chạy/tạm dừng/hoàn thành/ca có sẵn thể tích; camera chuột/cảm ứng, 8 độ rộng và fallback WebGL; fullscreen desktop/mobile và Esc native/fallback. |
| 3. Engine và Excel | Bảo toàn ba solver cũ; bổ sung HCl–NH₃, oxalic hai nấc và canxi hai OH⁻. Giới hạn độ tan canxi. Xuất .xlsx thực với ba sheet, các mốc và nguồn/đơn vị; tách lý thuyết khỏi lịch sử mô phỏng. Sửa thể tích trong bộ xuất HTML cũ cho cả hai chiều NH₃/HCl. | Unit bảo toàn vật chất/điện tích, Ka₁/Ka₂, tỉ lượng; mở 8/8 workbook bằng Microsoft Excel thật ở chế độ read-only, gồm đủ cặp/chiều và trước/sau chạy. |
| 4. Trang chủ học tập | Hero khoa học SVG; thư viện tìm tên/công thức có/không dấu và chỉ số dưới; lọc axit/bazơ mạnh/yếu; 5 quiz có chấm và giải thích; FAQ theo quy tắc (không phải AI tạo sinh); dự đoán nhanh và chuyển input bằng query đã validation. | Browser tìm kiếm/lọc, đáp án đúng/sai, FAQ và chuỗi không đáng tin, dự đoán 40 mL, chuyển thông số, mở trực tiếp và refresh /simulate. |
| 5. Nhóm, footer, chất lượng | Đúng đề tài, giảng viên, bộ môn, bốn thành viên/lớp/ngành; chỉ ghi vai trò được cung cấp của Nguyễn Bắc Hà. Toàn bộ thông tin chính thức tại src/data/project.js. Footer © 2026, GitHub đã xác minh; không tự gán giấy phép/quyền độc quyền. Responsive, giữ màu cũ; home không tải Three/Excel exporter. | 109/109 unit, lint/format, audit project 8/8, Emulator 2/2 nhóm, browser regression, build; kiểm tra secrets theo mẫu và danh sách tài nguyên xuất bản. |

Bằng chứng được tích lũy qua các bước triển khai và chạy lại sau sửa lỗi; cấu trúc danh mục/dispatch chung được chuẩn bị cùng nhau để các giai đoạn dùng một nguồn dữ liệu. Không coi bản sao test trong thư mục backup là test của phiên bản hiện tại.

## Các hệ được kiểm chứng trong mô hình lý tưởng ở 25 °C

Các hàng đầu dùng chất phân tích 0,1 M, 25 mL và chất chuẩn 0,1 M; hàng canxi dùng HCl 0,01 M, 25 mL và Ca(OH)₂ 0,005 M.

| Bình – buret | V tương đương | pH tương đương xấp xỉ | Mô hình |
| --- | --- | --- | --- |
| HCl – NaOH | 25,00 mL | 7,00 | Axit/bazơ mạnh 1:1, solver cũ |
| CH₃COOH – NaOH | 25,00 mL | 8,72 | Cân bằng axetat/axit, Ka và điện tích |
| HCl – NH₃ | 25,00 mL | 5,28 | Cân bằng NH₃/NH₄⁺, HCl trong bình |
| NH₃ – HCl (giữ chiều cũ) | 25,00 mL | 5,28 | Solver bazơ yếu cũ, HCl trong buret |
| H₂C₂O₄ – NaOH | Nấc 1: 25,00; nấc 2: 50,00 mL | 2,90; 8,37 | Phân bố ba dạng axit, hai Ka, cân bằng điện tích đồng thời |
| HCl – Ca(OH)₂ | 25,00 mL | 7,00 | 2 OH⁻/mol, Ca²⁺ thực, không giả Na⁺ |

HCl 0,2 M, 20 mL với NaOH 0,1 M được kiểm tra: V tương đương 40,00 mL. Không hardcode thể tích này; tính từ mol và hệ số phản ứng.

Mốc pH 8,2 trên đồ thị là ngưỡng mô hình phenolphthalein, không phải một mốc tương đương khác. Hệ yếu dùng solver của chính cặp để tìm ngưỡng. Không vẽ endpoint giả cho hệ NH₃; có cảnh báo phenolphthalein không phù hợp. Hệ hai nấc phân biệt tương đương thứ nhất/toàn phần; đương lượng axit còn chuẩn độ không được gọi là H⁺ tự do.

## Nguồn hằng số

Danh mục, engine, giao diện và workbook dùng cùng nguồn tại src/data/chemicals.js:

- [OpenStax Chemistry 2e, Appendix H](https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids), 25 °C: CH₃COOH Ka = 1,8×10⁻⁵; oxalic Ka₁ = 6,0×10⁻², Ka₂ = 6,1×10⁻⁵.
- [Appendix I](https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases), 25 °C: NH₃ Kb = 1,8×10⁻⁵; axit liên hợp dùng Ka = Kw/Kb.
- [Appendix J](https://openstax.org/books/chemistry-2e/pages/j-solubility-products), 25 °C: Ca(OH)₂ Ksp = 1,3×10⁻⁶. Độ tan lý tưởng s = (Ksp/4)^(1/3) ≈ 0,006875 M; không nhận dung dịch chuẩn có C vượt giới hạn này.
- [Axit đa nấc](https://openstax.org/books/chemistry-2e/pages/14-5-polyprotic-acids): mô hình cân bằng từng nấc. pKa/pKb hiển thị được suy ra bằng −log₁₀ từ hằng số thực dùng trong engine.

Các giá trị là dữ kiện có dẫn nguồn. Câu giải thích/quiz là nội dung tự biên soạn, không sao chép văn bản/bài tập của sách. Không dùng công thức trung bình pKa để mặc định pH nấc thứ nhất oxalic ở mọi nồng độ.

## Kết quả kiểm thử

- npm run check: PASS; lint 74 file JS, format baseline 27 file, **109/109 unit test** (101 test cũ + 8 regression mới).
- npm run audit: **8/8 PASS**; đây là runner kiểm tra các phase của dự án, không phải kết luận audit dependency hay audit bảo mật mới.
- Firestore Emulator demo-acid-base-titration, local 127.0.0.1:8085: **2/2 nhóm integration PASS**, kiểm tra quyền owner, UID bất biến, published/admin và truy cập bị từ chối. Không đổi Rules, không dùng dữ liệu thật.
- tests/instructor-requirements.browser.mjs: **9 nhóm PASS**; Reset, timer cũ, 25/40 mL, weak systems, điểm/nét liền/tooltip, responsive.
- tests/vessel3d.browser.mjs: PASS; xoay/zoom/pan/camera reset trên desktop và touch, 8 độ rộng, layout hai cột, lịch sử cuộn và fallback.
- tests/titration-audit.browser.mjs: PASS; 7 mốc 0–50 mL, buret/bình/pH/indicator/đồ thị đồng bộ, chạy/dừng/reset/tốc độ.
- tests/security.browser.mjs: PASS; render/export không thực thi XSS, SVG thụ động, input không hợp lệ bị từ chối, mô phỏng tiếp tục hoạt động, không tải tài nguyên ngoài.
- tests/research-upgrade.browser.mjs: **5 nhóm mở rộng PASS**; 4 bộ lọc mạnh/yếu, catalog/quiz/FAQ/team, transfer/direct/refresh, prediction giữ state/runner, 6 pair/direction, Excel trước/sau chạy, fullscreen native/fallback/Esc và mobile tap, responsive 320/375/768/1440. Không ghi nhận pageerror.
- File Excel: .NET ZipArchive/XML parser đọc độc lập các phần OOXML của bản download; Microsoft Excel mở **8/8** file cuối ở chế độ chỉ đọc, đúng tên ba sheet và giá trị thể tích là số. Hai file download trước/sau chạy cộng sáu file cho từng cặp/chiều. Không phải đổi đuôi CSV thành .xlsx.
- npm run build: PASS, 46 file gồm release metadata. dirty=true đúng với trạng thái chưa commit; commit trong metadata là HEAD nền, không tuyên bố bản local đã xuất bản. Build cũ được giữ trong tmp/build-backups.
- git diff --check: PASS. .env/log/tmp/dist được bỏ qua; không phát hiện mẫu private key/GitHub token/AWS key/secret assignment trong các file rà soát, không in giá trị. Manifest build không chứa .git, .env, tests, docs, scripts hoặc cấu hình Firebase/Rules. Đây là kiểm tra bàn giao có giới hạn, không chứng nhận an toàn tuyệt đối.

Bằng chứng local được Git bỏ qua: tmp/research-upgrade-qa gồm results.json, ảnh desktop/mobile, check.log, emulator.log (không công khai), excel-native-results.json, change-inventory.json và các .xlsx. Bằng chứng regression cũ ở tmp/instructor-requirements, tmp/vessel3d-qa, tmp/titration-audit và tmp/security-audit.

Hai kỳ vọng browser được đổi có căn cứ: nhãn nav “Thư viện ca” thành “Trang chủ” theo thiết kế mới; nhãn pH lý thuyết bổ sung vùng trung tính và nhiệt độ. Các assert về hóa học, timer, dữ liệu và camera vẫn giữ. Script test discovery chỉ lấy tests/*.test.js để không chạy các bản backup thiếu dependency; không bỏ test hiện có.

## Giới hạn / phần tùy chọn chưa triển khai

- Các yêu cầu bắt buộc đã triển khai và kiểm thử local. Chưa xuất bản bản nâng cấp vì chưa có xác nhận commit/push/deploy cho lượt này.
- Excel chưa nhúng chart object. Workbook có toàn bộ dữ liệu số, nguồn và mốc để tạo biểu đồ XY trong Excel; đây là phương án dự phòng được đề bài cho phép. Không cài thêm dependency/CDN; exporter OOXML chỉ tải khi bấm nút.
- Trợ lý hoạt động thật theo quy tắc/FAQ; không có AI tạo sinh/backend/API key. Nếu mở rộng AI sau này cần backend, kiểm soát chi phí và kiểm tra riêng.
- Mô hình lý tưởng cố định 25 °C, không mô phỏng hoạt độ, CO₂, động học trộn, nhiệt độ biến thiên, sai số dụng cụ, huyền phù/kết tủa. Các hệ khác ngoài bảng không được công bố hỗ trợ.
- Solver mạnh cũ dùng xấp xỉ ion dư ngoài tương đương; ở nồng độ rất loãng/đặc hoặc cực gần tương đương, không khẳng định độ chính xác thực nghiệm. Giao diện có cảnh báo nồng độ ngoài vùng diễn giải tin cậy. Không thay các solver đã kiểm chứng trong lượt này.
- Ca(OH)₂ bị giới hạn độ tan lý tưởng; 0,1 M bị từ chối. Khi V cần dùng lớn hơn dung dịch có sẵn trong buret, lý thuyết vẫn tính được; mô phỏng dừng khi buret hết, không tự nạp giữa lần chạy. Reset nạp lại lượng người dùng đã thiết lập.
- Chuột/chạm được kiểm thử bằng Edge thật và mobile emulation, không phải tất cả điện thoại thực. Fullscreen phụ thuộc nền tảng, có fallback. Thiếu WebGL sẽ dùng minh họa dự phòng và vẫn tính hóa học.
- Firebase/auth/cloud giữ nguyên tình trạng tích hợp đã có; không triển khai thêm backend hay đọc dữ liệu để kiểm chứng production.

## Xem thử và phê duyệt xuất bản

Development server đang hoạt động: http://localhost:4173/ và http://localhost:4173/simulate. Khi cần chạy lại: mở terminal VS Code tại repo, dùng npm start (PORT mặc định 4173). Không chạy server thứ hai nếu cổng đã có server.

Trong VS Code: Ctrl+Shift+P → Simple Browser: Show → nhập URL localhost. Nên kiểm tra fullscreen và gesture trong Edge/Chrome khi webview hạn chế các API này. Thử 25/40 mL, Reset, đổi cặp, xuất Excel; kiểm tra danh mục, quiz và chuyển dự đoán từ trang chủ.

Bước cần người chốt phê duyệt sau khi xem local: danh sách file/commit; commit và push nhánh phù hợp; kiểm tra tích hợp GitHub mới nhất không mất thay đổi; build từ commit được duyệt và deploy Hosting. Không deploy Firestore Rules cùng bản giao diện. Các thao tác này chưa được thực hiện.

## File sửa trực tiếp trong lượt này

- assets/styles.css
- index.html
- package.json
- src/app.js
- src/simulation/state.js
- src/ui/chartView.js
- src/ui/htmlSafety.js
- src/ui/inputForm.js
- src/ui/report.js
- src/ui/validation.js
- src/ui/vesselScene.js
- src/ui/vesselView.js
- tests/vessel3d.browser.mjs
- src/ui/theoryView.js
- tests/instructor-requirements.browser.mjs

## File thêm trong lượt này

- docs/RESEARCH_UPGRADE.md
- scripts/test.mjs
- src/chemistry/pairSolver.js
- src/data/chemicals.js
- src/data/learning.js
- src/data/project.js
- src/data/titrationPairs.js
- src/ui/excelExport.js
- src/ui/fullscreen.js
- src/ui/homeView.js
- tests/research-upgrade.browser.mjs
- tests/research-upgrade.test.js

## Thay đổi có sẵn được giữ nguyên trong lượt này

- src/chemistry/weakAcidStrongBase.js
- src/chemistry/weakBaseStrongAcid.js
- src/simulation/runner.js
- src/ui/vesselModel.js
- tests/security.test.js
- tests/simulation.test.js
- tests/titration-audit.browser.mjs
- docs/INSTRUCTOR_REQUIREMENTS.md
- tests/instructor-requirements.test.js
