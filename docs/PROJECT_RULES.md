# PROJECT RULES — HƯỚNG DẪN LÀM VIỆC CHO SV

## Đọc trước khi code

Đọc `ROADMAP.md`, `CHEMISTRY_MODEL.md`, `UI_UX_SPEC.md`, `TEST_CASES.md` và phase đang làm. Không dán code AI chưa đối chiếu các file này.

## Quyền và trách nhiệm

- GVHD/PO nghiệm thu kết quả thực, quyết định phạm vi; không là nút chờ kỹ thuật hàng ngày.
- Trưởng nhóm điều phối, không độc quyền merge/deploy.
- Thành viên được branch/push/merge nhưng phải tự test và ghi bằng chứng; production deploy bắt buộc có PO approval.

### Firebase/Deployment Owner — Bắc Hà

Ownership chính:

- `src/firebase/**`
- `.firebaserc`, `firebase.json`
- Firebase Hosting config
- Firestore Rules/indexes
- Firebase emulator/tests
- `DEPLOYMENT_TARGETS.md`
- deploy/rollback docs

Không tự ý sửa `src/chemistry/**` hoặc lõi `src/simulation/**`. Nếu cần
interface mới giữa simulation/app và Firebase, thay đổi phải nhỏ, ghi rõ
contract, có regression test và không âm thầm sửa chemistry.

Không được sử dụng Firebase project của dự án khác.

## Quy trình một task

1. Chọn task trong Roadmap/TODO, ghi người phụ trách trong PROGRESS.
2. Fetch/pull, kiểm tra branch/working tree.
3. Task lớn/chemistry/Firebase/UI chung: branch `feature/<phase>-<mo-ta>` → PR → test/review chéo.
4. Chạy ca test liên quan; UI kiểm tra desktop/mobile; Firebase chạy emulator test.
5. Tạo preview cho task lớn; ghi URL/SHA/test/rủi ro.
6. Sau review nội bộ, bất kỳ thành viên nào merge/deploy; smoke đúng URL rồi cập nhật checkpoint.

### Phase gate convention from Phase 3 onward

- **Pre-merge gate:** technical validation/checks phải PASS và required peer
  review hoặc peer run phải PASS.
- Khi hai điều kiện trên đạt, PR có thể merge; PO/GVHD acceptance không phải là
  pre-merge gate.
- **Post-merge phase acceptance:** PO/GVHD PASS vẫn bắt buộc trước khi phase
  được đánh dấu `DONE` hoặc `CLOSED`.
- **Production:** PO approval vẫn bắt buộc trước production deploy, theo quy tắc
  deploy của project này.

Việc nhỏ/khẩn cấp có thể vào main sau tự test/ghi lý do, nhưng không được đổi Rules/data Firebase.

## Quy ước

- Branch: `feature/`, `fix/`, `docs/`, `test/`, `chore/`.
- Commit: `feat:`, `fix:`, `docs:`, `test:`, `chore:` + mô tả rõ.
- PR: mục tiêu, module, ảnh hưởng chemistry/UI/Firebase, test, preview, rollback/rủi ro.
- Không force-push main/rewrite history chung; không commit build output, password, private key, service account, token quản trị hay dữ liệu cá nhân.

## Khoa học, Firebase, báo cáo

- UI chỉ hiển thị dữ liệu chemistry engine; tốc độ ≠ động học; equivalence ≠ endpoint; màu tạm ≠ pH cân bằng.
- Công thức mới phải có tính tay/reference + test; cập nhật Chemistry/Test khi đổi logic.
- Luôn xác nhận Project ID riêng của repo. Chỉ sửa web dùng `firebase deploy --only hosting`; Rules là task/review/deploy riêng và production deploy cần PO approval.
- Firebase web config có thể nằm phía client; quyền do Auth + Rules. Private key/token không vào repo.
- Báo cáo mẫu: **Done / Files / Tests / Preview-URL / Risk / Next / Branch-SHA**. `DEV PASS` không thay `PO PASS`.
