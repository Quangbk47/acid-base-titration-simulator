# Phase 4 Reference Tables

Dùng một block cho mỗi hệ. Giữ nguyên số liệu Tuấn/Nhật Anh cung cấp; không làm tròn thêm ngoài bảng gốc.

## Metadata

- Người tính:
- Người review:
- Ngày:
- Nguồn/phép tính:
- Nhiệt độ: `25 °C` / `298.15 K`
- Tolerance pH:
- Tolerance volume:
- Tolerance mol/concentration:
- Quy ước endpoint/indicator:

## HCl-NaOH

- Model: strong acid + strong base
- `Ca` (M):
- `Va` (mL):
- `Cb` (M):
- `Veq` tính tay (mL):
- `Veq` từ bảng (mL):

| ID | `Vb` (mL) | % Veq | pH | pOH | excess species | excess mol | stage | ghi chú |
|---|---:|---:|---:|---:|---|---:|---|---|
| initial |  | 0 |  |  |  |  |  |  |
| quarter |  | 25 |  |  |  |  |  |  |
| half |  | 50 |  |  |  |  |  |  |
| near-before |  | 99 |  |  |  |  |  |  |
| equivalence |  | 100 |  |  |  |  |  |  |
| near-after |  | 101 |  |  |  |  |  |  |
| large-excess |  | 200 |  |  |  |  |  |  |

## CH3COOH-NaOH

- Model: weak acid + strong base
- `Ca` (M):
- `Va` (mL):
- `Cb` (M):
- `Ka`:
- `pKa`:
- `Veq` tính tay (mL):
- `Veq` từ bảng (mL):

| ID | `Vb` (mL) | % Veq | pH | pOH | HA mol | A- mol | excess species | stage | ghi chú |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| initial |  | 0 |  |  |  |  |  |  |  |
| buffer |  | 25 |  |  |  |  |  |  |  |
| half |  | 50 |  |  |  |  |  |  |  |
| equivalence |  | 100 |  |  |  |  |  |  |  |
| near-after |  | 101 |  |  |  |  |  |  |  |
| large-excess |  | 200 |  |  |  |  |  |  |  |

## NH3-HCl

- Model: weak base + strong acid
- `Cb` (M):
- `Vb` (mL):
- `Ca` (M):
- `Va` (mL):
- `Kb`:
- `pKb`:
- `Veq` tính tay (mL):
- `Veq` từ bảng (mL):

| ID | `Va` HCl (mL) | % Veq | pH | pOH | NH3 mol | NH4+ mol | excess species | stage | ghi chú |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| initial |  | 0 |  |  |  |  |  |  |  |
| buffer |  | 25 |  |  |  |  |  |  |  |
| half |  | 50 |  |  |  |  |  |  |  |
| equivalence |  | 100 |  |  |  |  |  |  |  |
| near-after |  | 101 |  |  |  |  |  |  |  |
| large-excess |  | 200 |  |  |  |  |  |  |  |

## Curve shape review

Cho mỗi hệ, gửi thêm các checkpoint đường cong nếu có:

| `V` (mL) | pH tính tay | stage | expected trend/shape | tolerance | ghi chú |
|---:|---:|---|---|---:|---|
|  |  |  |  |  |  |

- Có bắt buộc curve đi qua `V = 0`, `V = Veq`, `V = endpoint` không?
- Có vùng buffer/đoạn dốc nào cần kiểm tra riêng không?
- Có discrepancy nào đã được reviewer xác nhận không?
