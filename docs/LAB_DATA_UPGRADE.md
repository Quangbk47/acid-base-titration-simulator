# Nâng cấp đánh giá số liệu, lịch sử và Excel — 21/10/2026

## Phạm vi đã triển khai

- Tái sử dụng 36 mục tra cứu và 5 cặp hóa học / 6 chiều lựa chọn. Không kích hoạt axit yếu–bazơ yếu, H₃PO₄, H₂CO₃, H₂SO₄ hoặc chất tra cứu khác thành mô hình chuẩn độ mới.
- Giữ nguyên Ka/Kb, điều kiện 25 °C, nguồn và pK suy từ K. Xem `ACID_BASE_LIBRARY.md` và dữ liệu `src/data/chemicals.js`. Urea Kb, hydrazine Kb₂ vẫn cần xác minh. Boric Lewis, sulfuric nấc đầu mạnh, oxalic hai nấc và cacbonic biểu kiến vẫn được phân biệt.
- Giải thích ban đầu, trước/sau tương đương, vùng đệm (tỉ lệ hai loài liên hợp 0,1–10, chỉ là quy ước), tương đương. Không dùng mô tả vùng để thay thế solver pH.
- Mục **Đánh giá số liệu** trên `/simulate`: nhập bảng, thêm/sửa/xóa, CSV hoặc XLSX; chọn worksheet/header, xem trước và xác nhận đơn vị mL trước khi thay bảng. Không tự sửa hoặc loại điểm lỗi, không tự sắp xếp dữ liệu gốc. Hai cột đầu là V (mL), pH.
- Tối đa 2000 điểm, tệp 5 MB; XLSX giới hạn kích thước giải nén/tài nguyên, không thực thi công thức hoặc tham chiếu XML bên ngoài. Công thức Excel phải có cached value. Có thể chọn sheet dữ liệu trong workbook nhiều sheet.
- Đánh giá bằng engine ở cùng thể tích: ΔpH = pH nhập − pH lý thuyết; MAE, RMSE, max |ΔpH|; đồ thị so sánh và bảng từng điểm. Phân biệt nguồn đo do người dùng khai báo với nguồn mô phỏng. Không có dữ liệu thực nghiệm nào được cung cấp hoặc chế tạo cho sản phẩm; dữ liệu trong test chỉ là fixture QA.
- Ngưỡng mặc định tham khảo: RMSE ≤ 0,2 pH = phù hợp tốt, ≥ 0,5 pH = đáng chú ý; có thể chỉnh. Ít nhất 5 điểm và phủ hai phía tương đương mới nhận xét tổng quát. Khoảng giữa hai ngưỡng được ghi là trung gian. Đây không phải tiêu chuẩn đo lường.
- RMSE nhỏ không chứng minh độ tin cậy hay độ lặp lại. Luôn ghi thiếu cơ sở khi không có thiết kế đo lặp, độ không đảm bảo và thông tin thiết bị.
- Ước lượng V tương đương: trung điểm khoảng có |ΔpH/ΔV| lớn nhất; cần ≥5 thể tích phân biệt, phủ <0,9Veq và >1,1Veq, khoảng dốc nhất ≤0,1Veq, gần Veq trong 20%, dốc ≥0,5 pH/mL, không có đỉnh cạnh tranh cách xa. Sai lệch có dấu và phân giải tối thiểu ±ΔV/2. Đây chỉ là ước lượng tham khảo, không phải endpoint chỉ thị hoặc độ không đảm bảo đo. Chưa ước lượng thực nghiệm cho oxalic hai nấc.

## Tài khoản và lịch sử: trạng thái chính xác

**Mặc định: khách/offline. Không tuyên bố đồng bộ production đã hoạt động.**

1. Lịch sử local hoạt động không cần đăng nhập: lưu phiên mới, liệt kê, mở lại trạng thái dừng, xóa sau xác nhận. Không ghi đè ID cũ. Lưu tùy chọn bảng đánh giá và ghi chú; số liệu mở lại phải Đánh giá lại với engine hiện tại. Tối đa 50 phiên, 700 KB UTF-8/phiên. Trình duyệt có thể xóa local storage; đây không phải sao lưu hay đồng bộ tài khoản.
2. Luồng Email/Password đăng ký (chỉ khi cấu hình cho phép), đăng nhập, đăng xuất và lịch sử Firestore đã được kiểm chứng bằng **Auth + Firestore demo Emulators thật**, không mock thành công, không request production. Mật khẩu chỉ đưa cho SDK Auth, không đưa vào session/local storage/Firestore.
3. Firebase SDK 12.19.0 (dependency đã khai báo) được bundle local tại `assets/vendor/firebase-lab.js` bằng esbuild 0.25.0; lazy-load chỉ khi explicit opt-in. Không CDN, không thêm dependency runtime. Công cụ QA được cài trong `tmp/lab-upgrade-tools`, không commit. License notices của SDK được giữ ở cuối bundle.
4. Mặc định `src/firebase/labOptions.js`: enabled=false, rulesConfirmed=false, allowRegistration=false. Không tự bật provider, đổi Rules, đổi CSP production hoặc tạo tài khoản thật.
5. Session cloud giữ schema top-level hiện có: `uid`, `input`, `modelVersion`, `createdAt`, `updatedAt`. Payload version 1, thông số, dự đoán, snapshot mô phỏng, history và đánh giá nằm trong `input`; mỗi lần lưu dùng addDoc ID mới. Danh sách lọc UID, tối đa 50 tài liệu, sắp xếp thời gian trong tập đã tải. **Không bảo đảm đây là 50 phiên mới nhất nếu tài khoản có hơn 50 tài liệu** (chưa phân trang/index thời gian).
6. Phiên schema cũ/không nhận diện được giữ nguyên và hiện nhãn không hỗ trợ mở, không tự migrate hoặc ghi đè. Việc xóa luôn do người dùng chủ động.

### Phát hiện Rules và bước phải được chủ dự án xác nhận

Rules local hiện hành (`firestore.rules`) kiểm tra trường uid nhưng thiếu ràng buộc uid với `/users/{uid}` ở savedExperiments: Alice có thể tạo tài liệu mang uid Alice trong namespace Bob. Đây là phát hiện đã tái hiện bằng Emulator, **không phải xác nhận trạng thái Rules đang deploy trên production**. Không truy cập dữ liệu thật để kiểm tra.

Ứng viên `docs/firestore-history.rules` thêm kiểm tra `request.auth.uid == uid` vào đọc/tạo/sửa/xóa, giữ chính sách content/profile còn lại. Emulator chứng minh chặn guest, người khác đọc/xóa, giả UID, chuyển chủ và tạo chéo namespace. File ứng viên **không được firebase.json tham chiếu**, không deploy.

Trước khi bật online cần chủ dự án:

1. Xác nhận Email/Password provider và authorized domains trong Firebase Auth; chỉ bật đăng ký khi được chấp thuận. Google login skeleton cũ không được coi là provider đang hoạt động.
2. Sao lưu và rà soát schema/UID/path dữ liệu hiện có bằng quy trình được phê duyệt. Không mặc định triển khai ứng viên tương thích mọi dữ liệu: tài liệu nằm sai namespace có thể mất khả năng truy cập sau khi siết Rules; cần phương án sửa dữ liệu/rollback riêng nếu có.
3. Review/approve Rules ứng viên, chạy lại Emulator và chỉ triển khai Rules bằng tác vụ được cho phép riêng. Không đổi admin/profile policy trong nâng cấp này.
4. Cho phép kết nối SDK trong CSP Hosting: hiện `connect-src 'self'` sẽ chặn Auth/Firestore production. Khi được duyệt, thêm đúng các endpoint cần cho Email/Password và Firestore (`https://identitytoolkit.googleapis.com`, `https://securetoken.googleapis.com`, `https://firestore.googleapis.com`), không mở wildcard. Xác nhận provider/CSP thực tế trước khi đổi. Chưa sửa firebase.json.
5. Chỉ sau các bước trên mới đặt enabled=true, rulesConfirmed=true trong labOptions; allowRegistration tùy provider. Firebase web config hiện có là cấu hình client, không phải service account. Không thêm secrets. Không dùng emulator config cho production.
6. Kiểm thử online với tài khoản thử được phê duyệt trong một tác vụ riêng, sau đó mới xác nhận lịch sử cloud production hoạt động. Nâng cấp này không thực hiện bước đó.

Hướng dẫn local QA: cấu hình `globalThis.__LAB_FIREBASE__` trước app load với enabled=true, allowRegistration=true, project demo, `emulators: {auth:9099, firestore:8085}`; adapter bắt buộc hostname localhost/127.0.0.1 và project bắt đầu demo-. `tests/lab-upgrade.browser.mjs` thực hiện luồng này. Chỉ dùng project demo, không tài khoản production.

Tài liệu Firebase chính thức: [Password Authentication](https://firebase.google.com/docs/auth/web/password-auth), [Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth), [Rules gắn với Auth](https://firebase.google.com/docs/rules/rules-and-auth), [Secure queries](https://firebase.google.com/docs/firestore/security/rules-query).

## Excel

Exporter OOXML cũ được mở rộng, không viết lại bằng thư viện khác. Có các sheet Thông số, Lý thuyết (giữ lại), Dữ liệu pH-V, Đồ thị và Đánh giá số liệu khi có đánh giá hợp lệ.

**Đồ thị native XY nằm thực sự trong XLSX**: worksheet → drawing relationship → chart XML; cached numeric series, đường lý thuyết không smoothing, điểm mô phỏng/đo phân biệt, các đường tương đương lý thuyết. Trục X mL, Y pH 0–14, số trục, tiêu đề, legend. Không phải URL hoặc ảnh ngoài file. Số vẫn numeric; chuỗi bắt đầu = được lưu inline string, không tự biến thành công thức.

Đã mở read-only trong Microsoft Excel: 5 sheet, 1 embedded chart, 3 series ở fixture đánh giá; trục X/Y, nhãn và legend được kiểm tra bằng ảnh `tmp/lab-upgrade-qa/excel-chart.png`. Phát hiện trục mặc định bị Excel ẩn khi thiếu delete=false; đã khai báo rõ và thêm regression. Không chỉnh workbook bằng Excel để giả lập export thành công: file được kiểm tra là file exporter tạo.

## Kết quả và giới hạn kiểm thử

- `npm run check`: **128/128 PASS**, bao gồm 118 test trước và 10 test mới; lint/format đạt.
- `npm run audit`: **8/8 nhóm PASS**, đây là runner tích hợp phases 0–6, không phải dependency security audit.
- Test mới: metrics đối chiếu tính tay; dữ liệu thiếu/không hợp lệ/trùng/sai thứ tự; CSV quoted/BOM/decimal comma; workbook/chart/relationships/escaping; local sessions/schema; default cloud off; vùng chuẩn độ; cân bằng vật chất/điện tích cho các hệ yếu với sai số tuyệt đối <10⁻¹⁰ mol/L hoặc mol tùy đại lượng.
- Toàn bộ 6 browser suite cũ PASS: research, instructor, chemical-library, vessel3d, titration-audit, security. Kiểm tra 3D/camera/fullscreen/touch, Reset/run/pause, pH–V, 6 chiều, tra cứu/quiz/home, Excel, XSS và responsive.
- Browser mới PASS: preview/import/đánh giá/xuất/import XLSX thật, dữ liệu trống, invalidation, lịch sử local, mobile 320/375/768/1440; Auth/Firestore demo đăng ký/đăng nhập/đăng xuất/create/list/open/delete, không request production.
- Emulator Rules: **3/3 nhóm PASS** (2 regression cũ + 1 nhóm so sánh Rules). Lỗi permission-denied trong log là các trường hợp cần bị từ chối, không tính là ca thành công giả.
- Production build PASS; chỉ index/assets/src được xuất. SDK local nằm trong assets. Chưa deploy Hosting hoặc Rules; không thay Auth/config/dữ liệu production.
- Các hệ mô phỏng không thay số: HCl–NaOH 25 mL, axetic–NaOH 25 mL, oxalic–NaOH 50 mL toàn phần (0,1 M, mẫu 25 mL). HCl–Ca(OH)₂ theo hệ số là 12,5 mL nhưng 0,1 M Ca(OH)₂ vượt độ tan và bị chặn; ca hòa tan 0,01 M HCl/0,005 M Ca(OH)₂ cho 25 mL.
- Strong/strong vẫn theo mô hình lý tưởng hiện có; nồng độ cực loãng/đặc, hoạt độ, CO₂, động học và sai số thiết bị ngoài phạm vi kiểm chứng. Không khẳng định dữ liệu đo đáng tin cậy chỉ từ fit.

Không sửa giới thiệu nhóm. Không sửa hoặc commit `git-contributions.txt` đã có trước tác vụ. File QA/log/workbook/dữ liệu người dùng chỉ trong tmp hoặc local storage, không vào commit. Giới hạn còn lại: chưa bật/kiểm chứng cloud production; chưa có weak–weak, endpoint nhiều nấc thực nghiệm, phân trang cloud hoặc suy độ không đảm bảo từ thiết bị.
