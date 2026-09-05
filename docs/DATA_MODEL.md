# DATA MODEL — FIRESTORE CONTRACT

```text
users/{uid}
  displayName, photoURL?, role: "learner"|"admin", createdAt, updatedAt
users/{uid}/savedExperiments/{id}
  input, modelVersion, currentAddedVolumeMl, currentStage, summary,
  createdAt, updatedAt
substances/{id}, indicators/{id}, scenarios/{id}, guidedPrompts/{id}
  status: "draft"|"published", payload, createdAt, updatedAt, updatedBy
```

## Saved experiment contract

`input` đủ tái lập solver (system, analyte/titrant IDs, C/V, Ka/Kb, indicator, temperature); `summary` gồm pH/endpoints/equivalence/report title có kiểm soát. Không ghi curve arrays, ảnh, animation, mật khẩu, access token hay dữ liệu người khác. Khi load: kiểm tra `modelVersion`; nếu không tương thích phải báo rõ thay vì âm thầm đổi kết quả.

## Ràng buộc

- client tạo profile chỉ với role learner; không update role.
- mỗi user tối đa 50 docs saved; trước write thứ 51 query/count có phân trang/transaction phù hợp và UI yêu cầu chọn xóa. Không auto-delete.
- content ID không dựa tên hiển thị; IDs ổn định để ca saved còn tái lập khi đổi title.
- Admin publish chỉ khi payload schema valid; published content versioned bằng `updatedAt`/`modelVersion`.

## Phase 4A boundary

- Phase 4A có thể xây schema/repository skeleton song song với Phase 2–3.
- Firebase không là source of truth cho chemistry/simulation.
- Repository nhận và lưu snapshot do application layer cung cấp.
- Phase 4A không tự phát minh chemistry fields.
- Phase 4B mới nối vào state thật sau khi interface ổn định.
- Guest không cần login; login chỉ khi Lưu/Mở.
- Tối đa 50 ca, không auto-delete.
- Không lưu curve arrays, ảnh, animation, secret/token.
