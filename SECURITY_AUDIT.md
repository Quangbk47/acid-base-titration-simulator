# Security Audit — Acid–Base Titration Simulator

Ngày: **2026-10-08**. Phạm vi: working tree của `main`, HEAD
`31036396c40dece032f6081a82b705e97d97d387`, gồm các thay đổi 3D/bố cục/chuẩn độ
chưa commit từ trước. Không kiểm thử phá hoại hoặc đọc/ghi dữ liệu production.

**Kết luận tại thời điểm chốt audit: chưa đạt gate triển khai với cấu hình lúc đó.**
Chức năng mô phỏng vẫn đạt kiểm thử. Đã sửa các lỗi nhỏ được phép, nhưng còn
Hosting quá rộng, thiếu bảo vệ đường dẫn UID trong Rules, schema/quota chưa
đủ và dependency advisories. Không khẳng định hệ thống an toàn tuyệt đối.

**Cập nhật theo yêu cầu tiếp tục audit:** có thể tiếp tục phát triển Free Lab và
Guided Lab **ở local/Emulator với dữ liệu giả**, giữ chemistry engine làm nguồn
trạng thái. Chưa đủ điều kiện bật lưu/mở Firebase hoặc triển khai công khai.
Phân tích năm FAIL, so sánh CRUD, tương thích schema, phát hiện Hosting mới và
kế hoạch sao lưu/rollback nằm ở mục 9–14. Chưa áp dụng Rules mới; cấu hình dự án
và hai bản nháp chờ duyệt được kiểm tra SHA-256 trước/sau và giữ nguyên.

Quyền xuất bản Hosting và thay đổi cấu hình cho bản bàn giao được phê duyệt
sau audit được ghi riêng ở mục 16. Gate Auth/persistence/backend vẫn chưa đạt;
bản phát hành guest không đồng nghĩa các phát hiện Firestore đã được khắc phục.

## 1. Phương pháp và giới hạn

- Rà soát `src/**`, script preview/build/CI, HTML, dependency manifest/lock,
  `.firebaserc`, `firebase.json`, `firestore.rules`, indexes và tài liệu hợp đồng.
- Kiểm tra mọi sink HTML động, export HTML/SVG, đầu vào số, đường dẫn/Host,
  resource ngoài, dữ liệu được lưu và các điều kiện phân quyền.
- Playwright/Edge: payload XSS vô hại chỉ đặt biến đánh dấu, kiểm thử đầu vào,
  mạng ngoài và hồi quy mô phỏng. Không gửi dữ liệu thật tới dịch vụ ngoài.
- Firestore/Hosting Emulator với project **demo-acid-base-security-audit**,
  bind loopback, dữ liệu fixture dùng một lần. Admin trong test chỉ là document
  fixture ở Emulator, không phải tài khoản Auth/quản trị được tạo trên Firebase.
- `npm audit --package-lock-only --json` truy vấn advisory theo lockfile;
  kiểm tra Three.js vendored bằng manifest QA riêng. Không dùng `audit fix --force`.
- Quét theo mẫu 77 file Git theo dõi, chỉ ghi tên file/dòng/loại nếu có kết quả.
  Không đưa giá trị credentials vào báo cáo. Không có `.env` thật tại root;
  có `.env.example`. Không quét toàn bộ lịch sử Git hoặc xác minh secret đã thu hồi.

Các package QA/Emulator được dùng trong TEMP; root không có `node_modules`.
Không kiểm tra cấu hình đang triển khai trong Firebase Console, IAM, trạng thái
Auth provider, API restrictions hay Storage bucket thật. Các kết luận về Rules
và Hosting là của **file hiện tại và Emulator**, không phải chứng nhận production.

## 2. Phân loại phát hiện

Mức độ dưới đây tách tác động với bằng chứng. Advisory dependency xác nhận
phiên bản bị ảnh hưởng; chưa chứng minh điều kiện khai thác tồn tại trong website.

| ID | Mức độ | File / nguyên nhân | Tác động và bằng chứng | Trạng thái / khắc phục |
| --- | --- | --- | --- | --- |
| SEC-01 | Critical theo advisory | `package-lock.json`, `proxy-addr` 2.0.7 | IP spoofing khi ứng dụng cấu hình trust subnet sai; phiên bản trong lock xác nhận bị ảnh hưởng. Không phải lỗ hổng website đã khai thác được. | **Đã sửa lock:** 2.0.8, chỉ một package thay đổi. |
| SEC-02 | High | `firebase.json:3`, `hosting.public = "."`, ignore thiếu chặn con của thư mục ẩn | Emulator trả 200 cho docs/package/QA. Bộ lọc upload CLI 15.30.2 thuần local còn đưa **296 file `.git/`** vào manifest hiện tại, gồm HEAD/config/index; bản nháp cấu hình trong `tmp/` cũng có mặt. Có thể lộ lịch sử mã nguồn, metadata hoặc secrets nếu chúng tồn tại trong lịch sử/log. Chưa truy cập production hoặc xác nhận credential bị lộ. | **Chờ xác nhận:** chỉ đóng gói web assets vào `dist`; kiểm tra manifest, chặn toàn bộ thư mục ẩn, không dựa `.gitignore` làm Hosting policy. |
| SEC-03 | High | `firestore.rules:25`, `:28`, `:34` | Rules kiểm tra UID dữ liệu nhưng không kiểm tra `{uid}` của đường dẫn. Bob tạo được `users/Alice/savedExperiments/x` với UID Bob. Đây là ghi sai namespace; đọc/sửa/xóa document thật có UID Alice vẫn bị từ chối. | **Chờ xác nhận:** ràng buộc auth UID, path UID và document UID ở mọi thao tác. |
| SEC-04 | High / Medium theo advisory | `package-lock.json`, 24 mục package còn ảnh hưởng | Sau patch Critical: 14 High, 10 Moderate; gồm vulnerability gián tiếp của Firebase CLI/SDK/testing. Chưa chứng minh đường khai thác ở frontend. | **Còn mở:** nâng cấp có kiểm soát; không downgrade Firebase hoặc dùng `--force` theo gợi ý máy móc. |
| SEC-05 | Medium, sink đã xác nhận; đường khai thác từ UI chưa xác nhận | `src/ui/report.js:23`, `experimentView.js`, `chartView.js` | Metadata/history/reaction/species chèn vào HTML; SVG raw có thể mang nội dung chủ động. Payload qua API module thực thi trong browser trước sửa. UI hiện chỉ dùng kết quả solver, chưa có import/cloud-load nối tới các sink này. | **Đã sửa:** escape text; SVG chỉ chấp nhận primitive đồ thị thụ động; từ chối script/event/URL/style/foreignObject. |
| SEC-06 | Medium | `firestore.rules:8`, saved write allowlist; `src/firebase/repository.js:8` | Allowlist tên field không kiểm tra kiểu/giá trị. Emulator cho phép displayName object, photoURL JavaScript, input string, modelVersion số và Ca/Cb NaN/Infinity. Validator client không bảo vệ direct SDK writes. | **Chờ xác nhận:** type/URL/number guards; thống nhất schema lưu trước khi siết hoàn toàn. |
| SEC-07 | Medium | `src/firebase/repository.js:1`, `:27`; `firestore.rules` | `maxSavedExperiments = 50` chỉ là thuộc tính, không có cơ chế quota đáng tin cậy. User riêng trong Emulator ghi thành công bản thứ 51. Có nguy cơ lạm dụng lưu trữ/chi phí. | **Còn mở, cần quyết định kiến trúc:** authoritative quota hoặc cơ chế slot/counter chống bypass; không tự xóa bản cũ. |
| SEC-08 | Medium, defense-in-depth | `firebase.json`, không có `hosting.headers` | Emulator trang 200 không có CSP, nosniff, frame protection, Referrer-Policy. Chưa chứng minh một exploit riêng từ việc thiếu header. | **Chờ xác nhận:** headers/CSP đề xuất đã qua browser regression. |
| SEC-09 | Low do chỉ bind loopback | `scripts/serve.mjs:30` và xử lý file | Trước sửa phục vụ `.git/HEAD`, docs/QA; `/%ZZ` làm tiến trình QA crash. Guard lexical cũng cần kiểm tra junction/realpath. | **Đã sửa:** allowlist web assets/routes, chặn dotfile/Host sai/junction, 400/403/404/405, HEAD, nosniff; favicon không có trả 204. |
| SEC-10 | Low | `src/ui/validation.js:29` | Lookup object chấp nhận `__proto__`, `constructor`, `toString` như system type. Xác nhận bypass allowlist; không có bằng chứng prototype pollution hay RCE. | **Đã sửa:** `Object.hasOwn`; regression reject cả ba giá trị. |
| SEC-11 | Medium, integration/availability | `src/firebase/repository.js:10`, `firestore.rules:32`, `docs/DATA_MODEL.md` | Emulator xác nhận snapshot hợp lệ từ cả ba solver, thêm UID/timestamp, đều bị Rules cũ và mới từ chối vì currentAddedVolumeMl/currentStage/summary ngoài allowlist. Schema tài liệu còn thiếu UID mà Rules yêu cầu. Chưa có adapter lưu thật. | **Chờ thống nhất contract:** không bỏ trường tiến độ/kết quả để ép PASS, không tự nới Rules hoặc thay flow Auth/lưu dữ liệu. |
| SEC-12 | Low, thiếu bằng chứng QA | Fixture CSP và matcher của Hosting Emulator trên Windows | `glob-slasher` biến source `**` thành `\\**`, không match các URL ở môi trường này. Browser không ghi CSP violation trước đó không chứng minh CSP có hiệu lực. Chưa xác nhận lỗi tương tự trên Hosting production. | **Đã sửa riêng cấu hình QA trong TEMP:** regex `.*`; HTTP xác nhận headers rồi chạy lại browser. Bản nháp chờ duyệt giữ nguyên. |

Advisory SEC-01 ghi nhận bản vá 2.0.8 và điều kiện trust proxy liên quan;
không áp CVSS Critical đó cho toàn bộ frontend tĩnh.
[GitHub advisory GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h).

Firebase Hosting sử dụng `public` làm thư mục nội dung triển khai và cấu hình
response headers trong `hosting.headers`.
[Firebase Hosting configuration](https://firebase.google.com/docs/hosting/full-config).

## 3. Authentication, phân quyền, dữ liệu và injection

`src/firebase/auth.js` hiện là adapter skeleton: `configured: false`; khi chưa
inject implementation, currentUser là null và signIn báo AUTH_NOT_CONFIGURED.
`src/app.js` không khởi tạo Firebase SDK, không nối sign-in/save/load; mô phỏng
guest là chức năng local có chủ đích. Không kết luận Google Sign-In production
đã được kiểm tra chỉ từ test adapter. Không thay logic Authentication.

Ma trận Emulator đã kiểm chứng:

| Thao tác | Guest | Learner | Admin fixture |
| --- | --- | --- | --- |
| Đọc published content | Cho phép | Cho phép | Cho phép |
| Đọc draft | Từ chối | Từ chối | Cho phép |
| Ghi content | Từ chối / không có quyền write | Từ chối create/update/delete | Cho phép cập nhật |
| Đọc/sửa/xóa experiment có UID người khác | Từ chối | Từ chối | Không được cấp quyền mặc định vượt chủ sở hữu |
| Tạo/đọc/sửa/xóa experiment own hợp lệ | Từ chối | Cho phép | Tuân theo cùng owner rule |
| Tự create/update role admin, extra profile field | Từ chối | Từ chối | Role được seed riêng trong Emulator |
| Ghi own-UID vào namespace người khác | Từ chối | **Cho phép sai — SEC-03** | Cùng thiếu path check |

Không tin role do client/custom claim `role: admin` gửi vào: role source of truth
của Rules là document `users/{uid}.role`. Claim giả không đọc được draft trong
cả bốn content collection. Queries guest không filter status bị từ chối; query
`status == published` đạt. Không thấy wildcard mở toàn database.
Các điều kiện Auth/Rules phải được đánh giá ở backend, không dựa UI.
[Firebase Rules and Authentication](https://firebase.google.com/docs/rules/rules-and-auth).

Đầu vào mô phỏng kiểm tra số hữu hạn, nồng độ/thể tích analyte dương, lượng
titrant/buret không âm, Ka/Kb hợp lệ; payload markup/Infinity/NaN/1e309 bị từ
chối. Không tìm thấy SQL backend, eval/new Function từ dữ liệu người dùng,
hoặc command construction từ input web. Các tọa độ SVG là phép tính số;
các nhãn dynamic đã được escape. Không có bằng chứng SQL/OS injection trong
luồng hiện tại. Rủi ro persisted data được đánh giá riêng ở SEC-06.

Export SVG dùng grammar rất hẹp cho svg/g/circle/line/polyline/polygon/rect/path,
attribute số/màu/class và metadata cần cho SVG thật. Không phải bộ sanitizer
SVG tổng quát: markup không hỗ trợ bị từ chối bằng INVALID_REPORT_GRAPH trước
khi bắt đầu tải file. SVG đồ thị hiện tại được giữ nguyên trong browser test.
Text escaping và giới hạn markup phù hợp với cách xử lý các sink HTML nguy hiểm.
[OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

## 4. Secrets, tài nguyên ngoài, Storage, CSP và CORS

- Pattern scan 77 tracked file: **0 match** cho private key/service account,
  token GitHub/AWS/Slack, credential URL và assignment secret phổ biến.
  Đây không phải bảo đảm không có secrets; chưa chạy Gitleaks/TruffleHog hay
  scan history. Công cụ đó chưa cài trên máy. Không phát hiện credential đặc
  quyền từ phần cấu hình được đọc. Bổ sung `tmp/` vào `.gitignore` để QA logs
  và manifest thử nghiệm không vô tình bị commit; các file vẫn tồn tại.
- Firebase web apiKey/appId/projectId ở client là cấu hình public theo thiết kế,
  không tự gọi đó là secret bị lộ. Chưa kiểm tra API restrictions/quota thực tế;
  cần owner kiểm tra trong Console. Không đưa giá trị key vào báo cáo.
  [Firebase API keys](https://firebase.google.com/docs/projects/api-keys).
- Three.js 0.186.1/OrbitControls/RoomEnvironment được phục vụ local; không có
  CDN, font/texture/HDR ngoài trong luồng đã chạy. Security browser ghi nhận
  **0 external request** và không page error. Namespace XML trong SVG không
  phải tài nguyên mạng được tải.
- Không có `storage.rules`, entry Storage trong firebase.json hay flow Storage
  trong app. Có storageBucket ở public config nhưng **chưa biết deployed rules**.
  Không kết luận bucket public/private. Nếu không dùng Storage, cân nhắc deny-all
  sau khi kiểm kê dữ liệu/quyền hiện có và được xác nhận; không áp dụng tự động.
- Hosting hiện thiếu headers theo SEC-08. CSP đề xuất cho module local không
  cần `unsafe-eval`; `style-src 'unsafe-inline'` còn cần vì UI/3D dùng inline
  style properties. Chính sách `connect-src 'self'` phù hợp luồng hiện tại;
  khi nối Google Auth/Firebase SDK phải kiểm tra lại các domain chính xác.
- Không có Access-Control-Allow-Origin `*` trong Hosting Emulator. App không có
  API cross-origin riêng. Không xem việc thiếu CORS allow-header như lỗ hổng,
  và không mở CORS rộng để thay thế Auth/Rules. Preview kiểm tra Host loopback.
- CI dùng action tags @v4 và chưa khai báo permissions tối thiểu trong YAML:
  nguy cơ supply-chain/quyền kế thừa cần review; chưa chứng minh token CI bị
  lạm dụng. Không sửa workflow hoặc tạo tài khoản quản trị.
- Curve sampler chưa có trần số điểm cho volume cực lớn: nguy cơ treo tab do
  input local; chưa chứng minh remote/multi-user DoS. Không thay giới hạn hóa
  học hoặc độ phân giải trong audit này.

## 5. Bản sửa đã áp dụng

1. `src/ui/htmlSafety.js`: helper escape text, validation SVG thụ động.
2. `src/ui/experimentView.js`, `chartView.js`, `report.js`: escape nhãn và
   metadata; kiểm tra SVG ở create/render/download; tên file SVG cố định.
3. `src/ui/validation.js`: own-key whitelist system type.
4. `scripts/serve.mjs`: giới hạn serving, xử lý URL lỗi không crash, thực thi
   realpath/Host/method checks và headers cơ bản của **preview local**.
5. `package-lock.json`: chỉ `proxy-addr` 2.0.7 → 2.0.8; package.json không đổi.
   Bản vá có hiệu lực cho lần `npm ci` tiếp theo; không thay Firebase CLI global
   hoặc các cài đặt QA trong TEMP. Không tuyên bố các binary đó đã được vá.
6. `.gitignore`: bỏ QA `tmp/` khỏi tracking; không xóa artifact.

Không sửa `src/chemistry/**`, simulation engine, layout/CSS, Authentication,
repository, Firestore Rules, Storage policy hoặc file Firebase config trong
đợt audit này. Thay đổi `firebase.json` đã staged từ trước vẫn được giữ nguyên.

## 6. Kiểm thử và bằng chứng

| Bộ kiểm tra | Kết quả |
| --- | --- |
| `npm run check` | **92/92 PASS**, 0 skip; lint 57 file, format 27 file |
| `npm run audit` (audit các phase, không phải npm vulnerability scan) | **8/8 PASS** |
| `npm run peer-run` trên Edge | **11/11 PASS**, không console/runtime error |
| `tests/security.browser.mjs` | **PASS**, text/SVG attack bị chặn, SVG thật giữ nguyên; simulation/3D hoạt động, 0 external request |
| `tests/titration-audit.browser.mjs` | **PASS**, bảy mốc pH/thể tích/state/chart/3D, run/pause/reset/buret |
| `tests/vessel3d.browser.mjs` | **PASS**, camera, touch, tám viewport, đồng bộ, fallback |
| Hai Firestore integration test cũ | **2/2 PASS** trên Emulator demo |
| `tests/firestore-security.audit.mjs`, Rules hiện tại | **66/71**, gate **FAIL (exit 1)** do năm unexpected allow trong SEC-03/06/07 |
| Rules bản nháp, chỉ Emulator | **70/71**, gate **FAIL (exit 1)** vì quota chưa xử lý |
| Hosting bản nháp, lượt kiểm tra ban đầu | App/browser PASS và các đường dẫn nội bộ không tồn tại trả 404; **chưa đủ bằng chứng CSP hoặc ignore**. Mục 12–13 bổ sung sentinel có thật và xác nhận headers, thay thế kết luận CSP ban đầu. |
| `git diff --check` | **PASS** |

Thêm sáu security unit/integration regressions trong `tests/security.test.js`
(bao gồm server/junction trên fixture TEMP), browser XSS regression và audit
71 thao tác Rules. Thêm biến SIMULATOR_BASE_URL cho hai browser suite để chạy
cùng kiểm tra trên Hosting Emulator; không thay behavior của website.

HCl 0,1 M 25 mL và NaOH 0,1 M ở 25°C vẫn đạt 25 mL/pH 7, không màu, buret
còn 25 mL, tổng trong bình 50 mL; 25,1 mL chuyển hồng/pH 10,30. Camera/reset,
desktop/mobile vẫn đạt. Chưa benchmark điện thoại vật lý hoặc Safari/iOS.

Artifact local trong `tmp/security-audit/`: baseline.json, secret-scan.json,
npm-audit.json, npm-audit-after.json, vendor-npm-audit.json, browser-results.json,
firestore-results.json, proposed-rules-results.json, hosting-results.json,
proposed-hosting-results.json, check.log, existing-emulator.log, peer-run.md và
browser logs. QA log giữ local; không đưa log môi trường vào nội dung báo cáo.

Tái chạy: npm start; npm run check; npm run audit. Browser test cần Edge và
Playwright (PLAYWRIGHT_MODULE có thể trỏ tới cài QA riêng). Rules audit cần
Emulator và devDependencies; chạy dưới `firebase emulators:exec --project
demo-acid-base-security-audit --only firestore`, không dùng project production.
SECURITY_AUDIT_BASELINE=1 chỉ ghi bằng chứng; mặc định strict phải trả lỗi nếu
unexpected allow/deny còn tồn tại. SECURITY_RULES_PATH chọn bản Rules nháp và
SECURITY_AUDIT_OUTPUT chọn artifact; không đổi file Rules đang triển khai.

## 7. Dependency detail

Trước sửa: **25 mục = 1 Critical, 14 High, 10 Moderate**. Sau sửa: **24 mục =
0 Critical, 14 High, 10 Moderate**. Đây là số package entries của npm (có mục
gián tiếp), không phải số CVE độc lập. Root manifest chỉ khai báo devDependencies;
frontend hiện không bundle Firebase SDK/CLI. Three.js vendored audit riêng:
**0 advisory được npm báo tại thời điểm kiểm tra**, không bảo đảm không có lỗi.

Bản thử `npm audit fix --package-lock-only --ignore-scripts` trên bản sao QA
giảm xuống 16 mục (12 High, 4 Moderate), vẫn chưa sạch. Không áp dụng bản đó
vào root vì phạm vi thay đổi lớn hơn patch đơn và có dependencies chưa có
đường nâng cấp an toàn rõ ràng. Không dùng đề xuất downgrade Firebase 12.x
xuống 9.x chỉ để làm npm audit xanh.

Bảng các mục còn ảnh hưởng trong lockfile hiện tại:

| Package | Version | Mức npm | Advisory / chuỗi ảnh hưởng | Hướng xử lý |
| --- | --- | --- | --- | --- |
| @firebase/firestore | 4.17.2 | high | Gián tiếp qua @grpc/grpc-js | Review upstream; không tự downgrade |
| @firebase/firestore-compat | 0.4.14 | high | Gián tiếp qua @firebase/firestore | Review upstream; không tự downgrade |
| @firebase/rules-unit-testing | 5.0.2 | high | Gián tiếp qua firebase | Review upstream; không tự downgrade |
| @google-cloud/pubsub | 5.3.1 | Medium | Gián tiếp qua @opentelemetry/core | Thử update tương thích, kiểm tra lại |
| @grpc/grpc-js | 1.14.4, 1.9.16 | high | [@grpc/grpc-js: In certain configurations, getAuthContext can return unauthorized certificates as though they were authorized](https://github.com/advisories/GHSA-m9gg-hp2v-232j); [@grpc/grpc-js: The server transmits some error messages thrown by method handlers to the client in status messages](https://github.com/advisories/GHSA-f596-whhp-79r4) | Review upstream; không tự downgrade |
| @modelcontextprotocol/sdk | 1.30.0 | high | [MCP TypeScript SDK: OAuth client could send credentials to an authorization server chosen by the MCP server](https://github.com/advisories/GHSA-6qxp-vccf-f47h) | Thử update tương thích, kiểm tra lại |
| @opentelemetry/core | 1.30.1 | Medium | [OpenTelemetry Core: Unbounded memory allocation in W3C Baggage propagation](https://github.com/advisories/GHSA-8988-4f7v-96qf) | Thử update tương thích, kiểm tra lại |
| basic-ftp | 5.3.1 | high | [basic-ftp: Quadratic-time CPU denial of service in Client.list() Unix directory-listing parser (RE_LINE backtracking)](https://github.com/advisories/GHSA-c475-qrg2-pj4r) | Thử update tương thích, kiểm tra lại |
| brace-expansion | 1.1.18, 2.1.4 | high | [brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr); [brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion](https://github.com/advisories/GHSA-qhr7-859c-m2p7); [brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | Thử update tương thích, kiểm tra lại |
| braces | 3.0.3 | high | [braces vulnerable to stack-exhaustion denial of service through deeply nested patterns](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Thử update tương thích, kiểm tra lại |
| chokidar | 3.6.0 | high | Gián tiếp qua braces | Thử update tương thích, kiểm tra lại |
| csv-parse | 5.6.0 | Medium | [node-csv: Prototype replacement still reachable via columns path](https://github.com/advisories/GHSA-8cw4-87c7-c6xx) | Thử update tương thích, kiểm tra lại |
| express | 4.22.2 | Medium | Gián tiếp qua qs | Thử update tương thích, kiểm tra lại |
| fast-uri | 3.1.7 | Medium | [fast-uri vulnerable to inconsistent host case normalization via percent-encoded octets](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) | Thử update tương thích, kiểm tra lại |
| firebase | 12.19.0 | high | Gián tiếp qua @firebase/firestore, @firebase/firestore-compat | Review upstream; không tự downgrade |
| firebase-tools | 15.30.0 | high | Gián tiếp qua @google-cloud/pubsub, chokidar, csv-parse, gaxios, proxy-agent, stream-json | Thử update tương thích, kiểm tra lại |
| gaxios | 6.7.1 | Medium | Gián tiếp qua uuid | Thử update tương thích, kiểm tra lại |
| get-uri | 6.0.5 | high | Gián tiếp qua basic-ftp | Thử update tương thích, kiểm tra lại |
| ip-address | 10.7.0 | Medium | [ip-address: isInSubnet() and isHostInSubnet() compare addresses of different families as if they shared an address space, allowing an allowlist check to admit an address outside its range](https://github.com/advisories/GHSA-j6r3-76f7-8jcv); [ip-address: Address6 builds a parse diagnostic proportional to the input with no length bound, allowing a single long string to stall or crash the process](https://github.com/advisories/GHSA-h3mg-xc3c-68pw) | Thử update tương thích, kiểm tra lại |
| pac-proxy-agent | 7.2.0 | high | Gián tiếp qua get-uri | Thử update tương thích, kiểm tra lại |
| proxy-agent | 6.5.0 | high | Gián tiếp qua pac-proxy-agent | Thử update tương thích, kiểm tra lại |
| qs | 6.15.3 | Medium | [qs array-limit bypass via bracket-key comma parsing](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx); [qs: Denial of Service via Attacker Controlled isBuffer](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g) | Thử update tương thích, kiểm tra lại |
| stream-json | 1.9.1 | Medium | [stream-json: pick/ignore/filter/replace filters are O(depth²) on nested input — small crafted JSON blocks the event loop for seconds→minutes (DoS)](https://github.com/advisories/GHSA-528h-pc64-c93x); [stream-json: JSONC parser and verifier re-scan the whole accumulated comment on every input chunk](https://github.com/advisories/GHSA-hqr4-qq8f-hg3x); [stream-json has a prototype pollution issue: Assembler writes this.current[this.key] on plain objects](https://github.com/advisories/GHSA-mjw6-4jj6-33hc) | Thử update tương thích, kiểm tra lại |
| uuid | 9.0.1 | Medium | [uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | Thử update tương thích, kiểm tra lại |

## 8. Phương án chờ xác nhận

Các file sau là **bản nháp để review**, chưa được chép vào cấu hình dự án:

- [Rules đề xuất](tmp/security-audit/proposed-firestore.rules): bổ sung kiểm tra
  `request.auth.uid == uid` cho create/read/update/delete; giữ document UID
  immutable; input phải là map, modelVersion chuỗi hợp lệ; Ca/Cb/Va/Vb nếu có
  phải hữu hạn với dấu phù hợp; displayName/photoURL có kiểu/độ dài/URL hợp lệ.
  Đã kiểm chứng 70/71. Đây chưa phải schema đầy đủ cho mọi hệ/snapshot: còn
  cần thống nhất required fields, timestamps, summary và quota.
- [Hosting đề xuất](tmp/security-audit/proposed-firebase.json): `public: dist`,
  nosniff, Referrer-Policy, Permissions-Policy, frame protection và CSP cho
  tài nguyên local. Browser suite đã chạy trên TEMP dist/Hosting Emulator.
  Kiểm tra tiếp theo phát hiện header glob không có hiệu lực trong Emulator
  Windows; chỉ cấu hình QA riêng dùng regex đã xác nhận CSP hoạt động. Không
  đổi bản nháp, project ID/Firestore entry hoặc cấu hình dự án, không deploy.

Ảnh hưởng cần duyệt trước khi áp dụng Rules: documents có path UID khác data
UID sẽ không còn truy cập được theo policy mới; dữ liệu sai kiểu hiện có có
thể không update được. Cần kiểm kê/migration riêng có xác nhận trước khi
deploy, không tự ghi đè/chuyển/xóa dữ liệu cũ. Read document hợp lệ và các test
owner/content hiện tại vẫn đạt trong Emulator.

Ảnh hưởng Hosting/CSP: cần build dist trước deploy; sẽ không phục vụ tài liệu,
scripts và QA artifacts. CSP/frame protection chặn embed trang Hosting trong
iframe; preview local 4173 vẫn dùng được Simple Browser. Luồng Auth/Firebase
SDK chưa nối phải được kiểm tra lại CSP khi triển khai sau này.

Quota 50 chưa sửa trong bản nháp: không thể coi constant client là enforcement.
Cần chốt authoritative counter/transaction/backend hoặc slot policy, làm rõ
dữ liệu cũ và test ghi đồng thời; đây là thay đổi kiến trúc/phân quyền, cần
quyết định riêng. Không tạo admin mặc định hoặc tự xóa bản thứ 51.

Các gate còn mở trước công khai: duyệt/áp dụng bản sửa Hosting và Rules local,
giải quyết quota/schema theo phạm vi Firebase dự kiến bật, review dependency
advisories, kiểm tra Console/Auth/Storage/IAM/API restrictions và chạy lại gate
strict. Nếu chỉ public mô phỏng guest thì vẫn cần giới hạn Hosting; không
suy ra an toàn backend từ việc UI chưa nối đăng nhập/lưu.

**Không commit/push, không deploy Hosting/Rules/Firebase, không thay dữ liệu thật.**

## 9. Phân tích chi tiết năm FAIL của 66/71

Nguồn: `tests/firestore-security.audit.mjs` và artifact `firestore-results.json`.
**Cả năm đều expected deny nhưng Rules hiện tại allow. Không trường hợp nào là
Rules mới từ chối một thao tác hợp lệ trong bộ 71 này.** Bản nháp chạy cùng bộ
test được 70/71, vẫn FAIL. Không sửa assertion hoặc chuyển gate sang baseline
để đạt PASS.

| Test | Thao tác fixture / nguyên nhân | Phân loại, mức độ và tác động | Rules nháp |
| --- | --- | --- | --- |
| `profile-malformed-fields-denied` | Alice update profile của mình: displayName là object, photoURL dùng scheme JavaScript. `safeUserFields()` cũ chỉ lọc tên trường. | **Lỗi validation thực sự, Medium (SEC-06)**. Không phải leo quyền hay XSS hiện đang khai thác được qua UI: Auth/profile chưa nối vào app. Cần validation khi ghi và render URL an toàn khi phát triển profile. | Cố ý deny: name phải null/string, URL phải null hoặc HTTP(S) string. |
| `saved-cross-path-create-denied` | Bob create dưới `users/Alice/savedExperiments/...`, nhưng data.uid = Bob. Rules cũ chỉ so UID trong data với Auth, bỏ qua path. | **Lỗi phân quyền namespace thực sự, High (SEC-03)**. Ghi trái namespace; Bob đọc/sửa/xóa bản ghi mang UID Bob ở path này. Chưa chứng minh Bob đọc/ghi được bản ghi thật mang UID Alice. | Cố ý deny vì path UID phải bằng Auth UID. |
| `saved-malformed-input-denied` | Own create với input string và modelVersion số. Allowlist cũ không kiểm tra kiểu. | **Lỗi schema thực sự, Medium (SEC-06)**. Có thể làm load/solver lỗi khi nối persistence; không chứng minh mất dữ liệu hay remote execution. | Cố ý deny: input map và modelVersion string hợp pattern. |
| `saved-nonfinite-chemistry-denied` | Own create với Ca = NaN, Cb = Infinity, direct SDK bypass UI validator. | **Lỗi validation persisted data thực sự, Medium (SEC-06)**. Input không tái lập được hóa học hợp lệ; không phải lỗi của solver. | Cố ý deny: số hiện diện phải hữu hạn, dấu phù hợp. |
| `saved-quota-51-denied` | User quota fixture đã có 50 docs, direct SDK create doc 51 được phép. Không có counter/slot/backend enforcement. | **Khoảng trống quota thực sự, Medium (SEC-07), đồng thời kỳ vọng chưa đúng tầng triển khai**: tài liệu yêu cầu flow lưu chặn vượt 50, không nói Rules hiện có tự đếm collection. Test là target acceptance chưa được triển khai, không chứng minh lỗi cú pháp Rules. | Vẫn allow; bản nháp chưa triển khai quota. Không thể tuyên bố đã sửa. |

Đối chiếu `docs/FIREBASE_SECURITY.md` mục 5 và `docs/DATA_MODEL.md`: giới hạn 50
phải có cơ chế lưu đáng tin cậy, không chỉ constant/UI. Rules không có phép đếm
toàn bộ collection theo yêu cầu này; cần quyết định counter/slot với atomic
write được Rules kiểm soát hoặc backend xác thực. Check client query/count rồi
create riêng lẻ vẫn có race và direct SDK bypass. Không tự thêm counter vào
profile, backend, hoặc thay schema/quyền truy cập trong đợt này.

Kiểm chứng thêm bằng repository thật với adapter mock: advertised limit = 50,
**51 lần create đều đi qua callback**. Đây là bằng chứng thiếu enforcement ở
skeleton, không phải 51 lần ghi production. Chỉ đổi tên test
`tests/firebase.test.js` để nói đúng rằng nó kiểm tra contract và quota
configuration; giữ nguyên toàn bộ assertion. Bản ghi 51 FAIL trong gate gốc giữ
nguyên, cần tách acceptance flow quota với Rules tests khi kiến trúc được duyệt.

## 10. So sánh Rules cũ và nháp: CRUD, UID và vai trò

Gọi A = `request.auth.uid`, P = `{uid}` trong path, O = UID document hiện có,
N = UID document sau write. Mọi saved operation đều yêu cầu đã xác thực.

| Saved operation | Rules hiện tại | Rules nháp | Ảnh hưởng |
| --- | --- | --- | --- |
| Read / list | A = O | A = P = O | Bản ghi UID own nằm sai path sẽ bị chặn. |
| Create | A = N; chỉ năm field cho phép | A = P = N; cùng allowlist; thêm validation input/modelVersion/số | Chặn ghi sai namespace và dữ liệu sai kiểu. |
| Update | A = O = N; cùng allowlist | A = P = O = N; thêm validation toàn bộ document sau update | UID vẫn immutable; cập nhật metadata cũng bị chặn nếu dữ liệu cũ sai schema. |
| Delete | A = O | A = P = O | Không yêu cầu schema write hợp lệ; vẫn chặn sai path/missing UID. |

| Profile/content policy | Cũ và mới | Khác biệt nháp |
| --- | --- | --- |
| Profile read | Chỉ own path, kể cả user role admin | Không đổi. |
| Profile create | Own path, role learner, năm field allowlist | Thêm type/URL/length cho name/photo. |
| Profile update | Own path, role không đổi, allowlist | Thêm type/URL/length; admin cũng không được tự thay role qua client. |
| Profile delete | Luôn deny | Không đổi. |
| Published content read | Guest/learner/admin được đọc | Không đổi. |
| Draft read; content create/update/delete | Chỉ role admin lấy từ `users/{A}.role` | Không đổi ở cả bốn content collection. |
| Admin đọc saved của người khác | Không có quyền mặc định | Không đổi; không thêm tài khoản/quyền admin. |

Kiểm chứng hai biến thể bằng **98 quan sát Emulator (49 mỗi biến thể)** trong
`tests/firestore-compatibility.audit.mjs`: tất cả khớp hành vi đã phân tích.
Đây là success của phép so sánh, **không phải 98 security gate PASS**: nó cũng
ghi nhận allow không an toàn và deny snapshot hợp lệ.

Quyền query cần kiểm tra riêng: list saved ở own path không filter bị cả hai
Rules từ chối; `where('uid', '==', A)` được phép. Tương tự published content
phải filter status. Không đổi test thành query tùy ý rồi xem Rules như filter.
[Firebase: Rules không phải bộ lọc dữ liệu](https://firebase.google.com/docs/firestore/security/rules-query).

## 11. Tương thích schema và chức năng hiện dùng

| Dữ liệu/thao tác fixture | Cũ | Nháp | Kết luận |
| --- | --- | --- | --- |
| Ba solver HCl–NaOH, CH₃COOH–NaOH, NH₃–HCl; wire tối thiểu uid/input/modelVersion/timestamp | Own CRUD allow | Own CRUD allow | Các modelVersion hiện tại hợp lệ, nhưng wire này chưa chứa đủ snapshot repository. |
| Full snapshot solver hợp `validateSavedExperiment`, có thêm uid/timestamp | Create deny cả ba | Create deny cả ba | **SEC-11 có trước bản nháp**: currentAddedVolumeMl/currentStage/summary bị allowlist chặn. Không được bỏ chúng để ép PASS. |
| Legacy input sai kiểu, own path và own UID | Read/update/delete allow | Read/delete allow, update deny | Cố ý siết write; cần UI thông báo và kế hoạch xử lý legacy trước khi bật lưu/mở. |
| Legacy thiếu data.uid, dù path own | Read/delete deny | Read/delete deny | Schema tài liệu thiếu UID không tương thích cả hai Rules. Không thể khẳng định dữ liệu thật có UID đầy đủ. |
| Legacy data.uid own nhưng path người khác | Read/update/delete allow | Cả ba deny | Rủi ro mất quyền truy cập thực sự khi đổi policy; phải kiểm kê có phê duyệt, không tự di chuyển/xóa. |
| displayName/photoURL null; name string và URL HTTPS hợp lệ | Allow | Allow | Null profile được hỗ trợ. |
| displayName 257 ký tự; modelVersion 81 ký tự | Allow | Deny | Giới hạn 256/80 mới là policy nháp, chưa nằm trong contract client; phải thống nhất trước khi áp dụng. |
| input thiếu số; Ka NaN; Kb Infinity; temperature 0 | Allow | Allow | **Validation nháp chưa hoàn chỉnh**; kiểm tra Ca/Cb/Va/Vb nếu hiện diện không đủ. |

Nháp cũng chưa kiểm tra đầy đủ system/IDs/indicator, required chemistry fields,
tính tương thích modelVersion, timestamps, summary hay payload content do admin
publish. URL HTTP(S) regex hiện chỉ kiểm tra scheme/độ dài, không xác thực host
hoặc nội dung ảnh. Không coi 70/71 là chứng nhận schema hoàn chỉnh.
Field allowlist cần đi cùng kiểm tra kiểu/giá trị trên document sau update.
[Firebase field validation](https://firebase.google.com/docs/firestore/security/rules-fields).

`src/app.js` hiện chỉ nối navigation, form và vessel view; không initialize
Firebase SDK/Auth/repository cloud. Auth adapter vẫn unconfigured; chưa có
luồng lưu/mở thực tế, query hydration hay cấp role admin để kiểm thử end to end.
Mô phỏng guest, 3D, đồ thị và báo cáo local không đọc Firestore; schema mismatch
không phá chức năng hiện đang nối. Điều này **không bảo đảm** Free/Guided Lab
với sign-in, cloud scenarios, lưu tiến độ hoặc chấm điểm đã hoạt động an toàn.

Trước tích hợp cloud, phải duyệt một contract versioned dùng chung giữa client,
adapter và Rules; xác định UID lấy từ authenticated session, đơn vị L/mL,
required fields theo từng hệ, tiến độ, summary và timestamps. Khi load dữ liệu
không hợp lệ/khác modelVersion phải báo lỗi rõ; không tin summary/pH/điểm client
lưu làm kết quả có thẩm quyền. Không migration dữ liệu thật trong audit này.

## 12. Hosting: mã nguồn, cấu hình và giới hạn phép thử

Kiểm tra bằng bản sao đại diện và sentinel giả có thật, không chứa credential;
HTTP chỉ lưu status/headers, không lưu nội dung phản hồi. Kiểm tra upload dùng
**duy nhất helper filesystem `firebase-tools/lib/listFiles.js`**, được gọi bởi
`lib/deploy/hosting/deploy.js:41`. Không gọi deploy/uploader/API release.

| Loại tài nguyên | Manifest current CLI local | Emulator | Đánh giá |
| --- | --- | --- | --- |
| src/app.js, src/firebase/config.js, HTML/assets | Có trong root và dist | 200 | Mã frontend và Firebase web config vốn public; không đặt private key/service account/token ở đây. |
| package/lock, scripts, tests, docs, SECURITY_AUDIT.md, QA kết quả, hai bản nháp tmp | Có trong root, không trong dist sạch | Root fixture 200; dist 404 | **SEC-02**: lộ nội dung phục vụ phát triển và cấu hình review ngoài ý định. |
| firebase.json/firestore.rules/indexes ở root, .env/.firebaserc | Không trong upload manifest | Sentinel có thật vẫn 200 ở Emulator | `ignore` là bộ lọc upload, không phải HTTP ACL của Emulator này. 200 local không chứng minh production lộ các file này. |
| .git/HEAD/config/index và file con .git | **Có trong root manifest** | Sentinel HEAD 200 | **SEC-02 High**, bộ lọc `**/.*` không chặn descendants với glob hiện dùng. Không suy ra cả thư mục ẩn đã được bảo vệ. |

Manifest working tree ở lượt kiểm tra: 446 file, **296 file `.git/`**, 297 file
bên trong thư mục ẩn. Chỉ ghi số lượng và path kiểm tra, không đọc nội dung
`.git/config`, objects hoặc in giá trị bí mật. Số lượng thay đổi khi thêm QA
artifacts; rủi ro không phụ thuộc con số cố định này.
Lịch sử Git có thể làm lộ code đã xóa hoặc secrets cũ nếu chúng tồn tại; audit
pattern trước đó chỉ quét tracked files hiện tại, chưa chứng minh history sạch.
Chưa xác nhận dữ liệu này từng được upload hoặc truy cập trên Hosting thật.

Theo tài liệu Firebase, public/ignore chọn file **để deploy**, không thay thế
Auth/Firestore Rules. `.gitignore` không điều khiển Hosting upload.
[Firebase Hosting public và ignore](https://firebase.google.com/docs/hosting/full-config).

Bản sao mới chỉ chứa index.html/src/assets: **37 file, 0 file ẩn, 0 nội dung
nội bộ ngoài allowlist**. JS/config client vẫn được tải, đúng thiết kế. Đây là
bằng chứng phương án dist giảm phạm vi; không phải deploy hay thay firebase.json.
Cần thêm manifest gate từ chối `.git`, QA, secrets, source map không chủ định và
junction/symlink ngoài web assets, kể cả khi thư mục build vô tình bị nhiễm file.

Bản nháp Hosting gốc còn pattern header `**`. Trên Windows hiện tại,
glob-slasher chuẩn hóa thành dấu backslash, matcher không match /, /simulate
hoặc src; cả bốn URL thiếu header. **Chưa chứng minh CSP có hiệu lực ở lượt
browser ban đầu**; không có violation cũng có thể là CSP chưa được bật.
Đây là lỗi bằng chứng QA/khả năng tương thích Emulator, chưa chứng minh Hosting
production có cùng lỗi. Phải kiểm tra Linux CI và response headers ở môi trường
staging được phép trước release.

Chỉ cấu hình QA riêng `TEMP/acid-base-hosting-security-audit/followup-local-only.json`
được đổi: thêm `**/.*/**` để chặn descendants và dùng header regex `.*` để tránh
matcher Windows. Sentinel `.git/HEAD` bị loại khỏi manifest; HTTP xác nhận CSP,
nosniff và frame header trên cả bốn URL trước khi chạy browser. Cả hai browser
suite mô phỏng/3D đều đạt dưới CSP này. Root configuration và hai bản nháp chờ
duyệt không bị sửa. Emulator vẫn có thể phục vụ sentinel bị ignore; cần giữ
Emulator loopback, không chia sẻ nó như website public.

## 13. Kết quả lượt kiểm chứng tiếp theo và thay đổi được phép

| Kiểm tra | Kết quả / giới hạn |
| --- | --- |
| Unit/lint/format | **92/92 PASS**, 0 skip; lint 59 file, format 27. |
| So sánh Rules cũ/nháp | **98/98 quan sát khớp**, gồm dữ liệu được phép và dữ liệu cố ý bị chặn; không phải security acceptance. |
| Strict Rules security gate gốc | Giữ nguyên **66/71 current**, **70/71 draft**, cả hai FAIL; không đổi kỳ vọng. |
| Hosting root fixture | 19 đường dẫn được quan sát, 9 nội dung nội bộ trả 200; ignored-file upload gate **FAIL vì .git/HEAD**. |
| Hosting draft với sentinel có thật | Nội bộ ngoài dist 404; gate **FAIL vì .git/HEAD lọt ignore và header không có hiệu lực ở Windows**. Sentinel Git này là fixture, không khẳng định dist build sạch chứa Git. |
| Cấu hình QA riêng sửa ignore/matcher | **19 đường dẫn khớp, 0 ignored upload leak, 0 missing header**. HTTP ignore không phải ACL nên chỉ kiểm tra loại khỏi upload. |
| Dist copy sạch | **37 file, 0 file ẩn/nội bộ ngoài web assets**. |
| Browser trên Hosting QA với CSP thực | Titration suite PASS; 3D/layout PASS ở tám viewport, camera/touch/fallback và đồng bộ engine/chart. |
| Cấu hình actual/draft SHA-256 | Trước/sau giống nhau; không áp dụng policy mới. |

Test Hosting ban đầu kỳ vọng ignored sentinel trả 404 đã thất bại. Đã sửa
**đúng lớp kiểm chứng** dựa mã CLI và tài liệu: kiểm tra exclusion trong upload
manifest, đồng thời vẫn ghi HTTP của Emulator. Giữ log thất bại và giữ gate FAIL
cho `.git`/headers thật sự có vấn đề; không đổi assertion của bộ 71 để ép PASS.

Thay đổi lượt này: thêm `tests/firestore-compatibility.audit.mjs`,
`tests/hosting-security.audit.mjs`, đổi tên một test repository (assertion không
đổi), cập nhật báo cáo/progress. Không đổi code app, thiết kế, công thức, Rules
actual, Hosting actual, draft proposal hoặc dữ liệu người dùng.
Artifact trong `tmp/security-audit/followup/`: compatibility-results.json,
hosting-current-results.json, hosting-draft-results.json,
hosting-local-check-results.json, upload-manifest-current.json,
upload-manifest-clean-dist.json, configuration-baseline.json,
configuration-verification.json, check.log và hosting-browser.log.
Raw Emulator log có thể ghi môi trường tiến trình: giữ local/ignored, không
đưa lên Hosting, report chia sẻ hoặc commit. Không coi `.gitignore` là mã hóa
hay quyền truy cập cho log trên máy.

## 14. Sao lưu, rollback và điều kiện tiếp tục Free Lab / Guided Lab

**Đây là phương án, chưa thực hiện với production.** Repo Rules cũ không nhất
thiết là Rules đang triển khai. Không gọi Console/API production để giả định
trạng thái. Trước một release được phê duyệt, người có quyền cần chuẩn bị:

1. **Bản sao local/release:** lưu snapshot working tree gồm file chưa commit/
   untracked, lockfile và build artifact đã kiểm tra; giữ diff và SHA-256 của
   Rules, indexes, Hosting config. Không chỉ backup HEAD vì nhiều thay đổi đang
   chưa commit. Lưu private ngoài public/dist; không chạy reset/clean hay ghi
   đè code hiện có. Audit hiện chỉ ghi fingerprints, chưa tạo backup dữ liệu thật.
2. **Baseline production được xác nhận riêng:** lưu Rules đang deployed cùng
   version/release ID, indexes, Storage Rules, Auth provider/authorized domain,
   IAM/API restrictions và Hosting release/version còn giữ được. Bản snapshot
   cấu hình không chứa credential trong báo cáo. Quyền/role không được coi là
   khôi phục đầy đủ chỉ từ repository file.
3. **Backup dữ liệu, chỉ sau phê duyệt:** chọn managed Firestore export hoặc
   cơ chế backup/PITR phù hợp; bao gồm users và savedExperiments subcollection,
   bốn content collection. Lưu vào bucket riêng có quyền tối thiểu, retention
   và kiểm tra hoàn tất/số lượng; không Hosting public. Export có phí và không
   phải snapshot đúng một thời điểm nếu có write khi chạy; chọn cửa sổ kiểm
   soát write hoặc PITR nếu được hỗ trợ/cấu hình. Không bật billing/PITR tự ý.
   [Firebase export/import và giới hạn snapshot](https://firebase.google.com/docs/firestore/manage-data/export-import).
4. **Kiểm kê legacy có phê duyệt:** thống kê path/data UID lệch, thiếu UID,
   kiểu/field/version sai, tên dài và user trên quota. Thiết kế migration không
   phá hủy, có mapping IDs và bản sao; không tự thay UID bằng Auth của người
   đang đọc, không tự xóa ca vượt 50. Thử restore/migration trên database staging
   rỗng với dữ liệu được bảo vệ trước. Import có thể ghi đè document trùng ID,
   còn export không chứa index definitions: không dùng import vào production
   làm rollback mù. [Firebase import behavior](https://firebase.google.com/docs/firestore/manage-data/export-import).
5. **Rollback tách ba lớp:** Hosting rollback về release/version đã kiểm chứng
   từ release history; Rules khôi phục snapshot policy đã duyệt bằng quy trình
   deploy Rules riêng; data rollback là kế hoạch restore/repair riêng có phê
   duyệt. Hosting rollback không tự sửa Rules/dữ liệu. Không chọn Rules cũ có
   lỗ UID chỉ để hết permission-denied; phải đánh giá lại rủi ro và khả năng đọc
   legacy trước khi release. [Hosting rollback](https://firebase.google.com/docs/hosting/manage-hosting-resources),
   [quản lý và deploy Rules](https://firebase.google.com/docs/rules/manage-deploy).
6. **Gate trước triển khai:** contract full snapshot round trip cho cả ba hệ;
   owner/outsider/guest CRUD, UID/path đổi, query constraints, legacy load/update/
   delete, required fields/Ka/Kb/temperature/timestamps và null profile; quota
   49/50/51 với nhiều tab, concurrent writes, offline queue và direct SDK
   bypass; Auth/roles/content publish schema. Không chấp nhận chỉ mock adapter
   hoặc constant. Chạy unit/integration/strict Emulator và browser 3D/pH–V/
   mobile/export; kiểm tra **headers có thật** rồi kiểm CSP với Auth/domain
   tương lai, export và embed. Kiểm upload manifest/dist + dependency/security
   scan trước khi duyệt đúng Project ID và từng thao tác release riêng.

**Quyết định tiếp tục phát triển:** có thể phát triển Free Lab và Guided Lab
local/Emulator với fixtures, guest engine/state và nội dung tin cậy. Giữ engine
làm nguồn hóa học chung cho model 3D và chart, không để persistence đổi công
thức hoặc tin giá trị pH/score nhập từ client. Không cần áp dụng Rules nháp để
phát triển phần này. Chưa đủ điều kiện nối Firebase production, bật lưu/mở,
quyền quản trị hoặc triển khai website công khai với cấu hình hiện tại.

Các rủi ro còn mở: SEC-02/03 High, dependency advisories, schema/quota và
khả năng truy cập legacy; production Auth/Storage/IAM/API restriction chưa được
kiểm tra, Git history/secret scan chưa đầy đủ, CSP cho Auth tương lai chưa kiểm
chứng. Khi các gate đó được giải quyết và có phê duyệt riêng mới đánh giá lại
release. **Không khẳng định hệ thống an toàn tuyệt đối.**

## 15. Chốt audit theo phạm vi dự án giáo dục đang phát triển

Theo yêu cầu mới nhất, audit được **hoàn tất cho việc tiếp tục phát triển local**;
không kéo dài để xử lý mọi advisory hoặc dựng hạ tầng production chưa dùng.
Gate triển khai công khai vẫn chưa đạt, tách biệt với quyết định phát triển.

| Ưu tiên | Quyết định hiện tại |
| --- | --- |
| Critical dependency xác nhận trong lock | Patch proxy-addr 2.0.8 đã có; không tự nâng cấp lớn toàn toolchain. |
| High Hosting / nguy cơ secrets | Preview local đã chỉ phục vụ web assets, chặn .git/docs/QA. Kiểm chứng packaging root không an toàn; không deploy. Phương án dist/hidden-directory guard đã thử riêng, actual config chờ duyệt giữ nguyên. |
| High Firestore UID/path | Đã chứng minh, so sánh draft và đánh giá nguy cơ mất quyền legacy. Chưa áp dụng vì chưa được phê duyệt; chỉ dùng fixtures/Emulator, không nối production. |
| Secrets | Không ghi giá trị bí mật vào báo cáo; logs/artifact giữ local. Quét history và kiểm tra IAM/API/Storage thật chuyển sang gate trước release với quyền phù hợp. |
| Schema/quota/Auth/cloud, advisories toolchain còn lại | Ghi nhận và ưu tiên trước khi bật luồng Firebase liên quan; không chặn phát triển engine/UI local hiện tại. Không coi lỗi chưa có exploit frontend là Critical/High đã khai thác trên website. |

Chuẩn bị chuyển sang hai chế độ, chưa thêm tính năng trong audit:

- **Free Lab:** tiếp tục từ state/chemistry engine và UI mô phỏng hiện có; giữ
  nguyên camera, nhỏ giọt, run/pause/reset, thể tích, màu và đồ thị pH–V.
- **Guided Lab:** bắt đầu bằng scenario/prompt local có dữ liệu tin cậy, dùng
  cùng engine/state; kiểm thử trình tự hướng dẫn và không sửa công thức hóa học.
- Thống nhất contract snapshot/version/quota trước một giai đoạn riêng cho
  đăng nhập, lưu/mở cloud hoặc dữ liệu người dùng; review Rules là gate riêng.
- Giữ bộ hồi quy hóa học/3D/responsive làm điều kiện cho mỗi thay đổi; không
  sửa thiết kế hoặc chức năng đang chạy chỉ để đáp ứng security checklist.

Các thay đổi lượt tiếp tục này giới hạn ở test, báo cáo và cấu hình QA trong
TEMP. Không sửa code app, Rules actual/nháp hoặc Hosting actual/nháp; không
truy cập dữ liệu production, deploy, push hay tạo tài khoản quản trị.

## 16. Phạm vi bàn giao được phê duyệt sau khi audit kết thúc

Các kết quả và trạng thái “chưa được duyệt” ở mục trước là lịch sử audit.
Người chốt dự án sau đó đã phê duyệt commit/push và **chỉ deploy Hosting**
để gửi giảng viên nhận xét. Quyền đó không bao gồm áp dụng Rules nháp.

Bản bàn giao sửa `hosting.public` thành `dist`, chặn file con thư mục ẩn/log/
source map, dùng regex header tương thích Emulator Windows và giữ CSP cho app
guest hiện có. Build dùng allowlist tài nguyên web, từ chối symlink/junction,
giữ bản build cũ và tạo metadata commit/file hash để đối chiếu bản công khai.
Patch thay đổi Hosting cũ và baseline release được giữ local, không commit log.
Các kiểm tra trước và sau deploy phải gắn với commit cụ thể của bản bàn giao;
không suy ra toàn bộ backend đã an toàn từ việc website guest chạy đúng.

Firestore Rules giữ nguyên, không migration/xóa/ghi đè dữ liệu production.
SEC-03/06/07/11 và các advisory còn lại vẫn được ghi nhận; luồng Auth/lưu/mở cloud
chưa bật. SEC-02/08 được xử lý cho **gói xuất bản website**, không phải bằng một
deploy Rules. Xem `docs/RELEASE_HANDOFF.md` và báo cáo bàn giao cuối để kiểm tra
URL, commit và giới hạn thực tế. Không bổ sung tính năng mới trong release này.
