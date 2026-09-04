# TEST CASES — CHECKLIST THỰC THI

## Chemistry fixtures

| ID | Bước | PASS |
|---|---|---|
| CHEM-01 | HCl–NaOH equal M/V, kiểm trước/eq/sau | pH và mol dư khớp tính tay; eq=7,00 ở 25 °C |
| CHEM-02 | 25/50/99/100/101% Veq, dư lớn | curve/stage/excess đổi đúng, không nhảy sai |
| CHEM-03 | CH3COOH–NaOH đầu/buffer/half/eq | solver hội tụ; half ≈ pKa; bảng reference pass |
| CHEM-04 | HCl–NH3 khi mở scope | solver Kb/reference pass |
| CHEM-05 | 0/âm/NaN/nhiệt độ khác 298,15 K/Ka sai/drop sai | chặn, message rõ, không crash |
| CHEM-06 | PP HCl–NaOH | hồng local pre-eq 0,5s; eq không màu; post-eq hồng bền |

Mỗi fixture lưu input, output expected, tolerance, nguồn/tính tay. Phase 1 có
thêm edge case số mol rất nhỏ để tolerance không phân loại nhầm equivalence;
curve phải không rỗng, tăng dần, không có volume gần trùng và chứa các checkpoint
0/25/50/99/100/101% cùng ca dư lớn. Không dùng snapshot UI thay chemistry assertion.

## Simulation/UI

- SIM-01: một addDrop đồng bộ buret, bình, pH, table, curve, color.
- SIM-02: Slow/Medium/Fast cùng addedVolume cho output bằng nhau.
- SIM-03: Pause/Reset không có timer/animation còn chạy.
- UI-01: 320/375/430/768/1366 px: không overflow/cover/mất control.
- UI-02: keyboard focus/label/aria error; chart có text/table alternative.
- UI-03: equivalence và endpoint khác label/legend/tooltip.

## Firebase/release

- FB-01 guest simulate; FB-02 sign-in only when save; FB-03 50 cap manual delete; FB-04 delete account; FB-05 ownership/role; FB-06 draft/publish.
- Release: check project ID, SHA, preview then production URL, hard refresh, CHEM-01 smoke, mobile smoke, Firebase scope (Hosting/Rules) đúng lệnh.
