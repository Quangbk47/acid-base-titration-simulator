# CHEMISTRY MODEL — ĐẶC TẢ LẬP TRÌNH

## Hợp đồng đầu vào/đầu ra

Mọi solver nhận đơn vị nội bộ M, L, K và trả object thuần:

```js
{ pH, pOH, totalVolumeL, stage, dominantReaction,
  excess: { species, moles, concentration },
  species: [{ id, moles, concentration }],
  milestones: { halfEqMl, equivalenceMl, endpointMl },
  diagnostics: { solver, converged, residual } }
```

Không làm tròn khi tính; UI dùng `toFixed(2)` riêng. Nếu input/solver không hợp lệ, trả lỗi có mã/message; không trả `NaN`.

## Giả thiết chung

25 °C: `Kw=1e-14`, `pH+pOH=14`; dung dịch lý tưởng; phản ứng/cân bằng nhanh sau mỗi giọt; bỏ qua hoạt độ, CO₂, nhiệt và động học. Volume tổng luôn bao gồm thể tích titrant đã thêm.

## Axit mạnh–bazơ mạnh

`nH=Ca×Va`, `nOH=Cb×Vb`, `VT=Va+Vb`.

- `nH>nOH`: `pH=-log10((nH-nOH)/VT)`.
- bằng nhau trong tolerance mol đã công bố: `pH=7.00`.
- `nOH>nH`: `pH=14+log10((nOH-nH)/VT)`.

`Veq=nH/Cb`; stage dùng margin thể tích/tolerance, không so sánh số thực bằng `===`. Reaction hiển thị `H⁺ + OH⁻ → H₂O`.

## Axit yếu một nấc–bazơ mạnh

Không chỉ dùng Henderson–Hasselbalch. Sau khi thêm NaOH, `CT=nHA0/VT`, `CNa=nNaOH/VT`, `h=[H+]`; giải nghiệm dương:

`f(h)=h+CNa-Kw/h-CT×Ka/(Ka+h)=0`.

Dùng bisection trên log10(h) từ -14 đến 0, tối đa iteration và `residual` định nghĩa trong code. Nếu không hội tụ, dừng mô phỏng và báo lỗi kỹ thuật, không hiển thị kết quả gần đúng như đúng. Henderson chỉ dùng để giải thích vùng đệm khi `nHA>0` và `nA->0`: `pH=pKa+log10(nA-/nHA)`; nửa eq có `pH≈pKa`.

## Axit mạnh–bazơ yếu

Khi triển khai HCl–NH₃: `CT=nB0/VT`, `CX=nHCl/VT`, `h=[H+]`, `OH=Kw/h`; giải:

`f(h)=h+CT×Kb/(Kb+Kw/h)-Kw/h-CX=0`.

Chỉ mở ca công khai sau CHEM-04 PASS. Axit yếu–bazơ yếu bị khóa `DEFERRED`.

## Chỉ thị và endpoint

Indicator là data: `{id, name, transitionStart, transitionEnd, acidColor, baseColor}`. PP: 8,2–10,0. Global color dùng pH cân bằng; endpoint là điểm đường cong vào vùng đổi màu bền, không phải `Veq`. Với HCl–NaOH: effect hồng local 0,5 s sau khi giọt chạm bình khi trước eq; effect chỉ là UI overlay và phải bị reset/cancel đúng khi pause/reset.

## Validation

`C>0`, `V>0`, `0<Ka/Kb<1`, drop `[0.05,0.10] mL`, loại hệ/chất tương thích. Chặn chạy ở client; server/content validation lặp lại khi Admin publish.
