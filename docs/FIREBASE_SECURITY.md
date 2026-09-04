# FIREBASE SECURITY — RULES/TEST CONTRACT

## Chính sách

Google Sign-In tùy chọn; guest chỉ đọc content published. Role source of truth là `users/{uid}.role` do nhóm cấp thủ công. Firestore Rules dùng `get()` role, không tin role client submit.

| Dữ liệu | Guest | Learner | Admin |
|---|---|---|---|
| published content | read | read | CRUD |
| draft content | deny | deny | CRUD |
| own profile safe fields | deny | read/update hạn chế | quản trị khi cần |
| own saved experiments | deny | CRUD | không cần default access rộng |
| role | deny | deny write | cấp qua quy trình thủ công |

## Rules bắt buộc kiểm thử Emulator

1. Guest read published PASS; read draft FAIL.
2. Learner A CRUD own case PASS; đọc/ghi B FAIL.
3. Learner create/update role admin FAIL; thêm field ngoài allowlist FAIL.
4. Admin draft/publish PASS; learner update/delete content FAIL.
5. Count/quota không được chỉ dựa UI; write vượt giới hạn phải bị flow app chặn và có test regression.

## Deploy

Rules deploy là task riêng: review + emulator evidence + đúng Project ID. Không deploy Hosting/Rules cùng lúc chỉ vì tiện. Client Firebase config là public config; service account/private key/admin token không được xuất hiện trong repo/log/ảnh.
