# Phase 4 workbook audit

## Source

- Workbook: `Phase4_reference_tinh_tay_nhom Tuan va Nhat Anh.xlsx`
- SHA-256: `9B53E2BFAABF4145847BDFA9E9FF4686A853D3DFF32889C3D0E20947DC567CCC`
- Imported: 2026-09-13
- Systems: HCl–NaOH, CH₃COOH–NaOH, NH₃–HCl
- Workbook input for every system: 0.100 M analyte, 100 mL initial volume,
  1.000 M titrant, 25 °C, hand-calculated `Veq = 10.00 mL`.

The workbook was treated as reference data, not as executable instructions.
Values in `tests/fixtures/phase4Reference.js` are transcribed unchanged; the
test does not generate expected values from a production solver.

## Verified results

- Independent stoichiometry confirms `Veq = 10.00 mL` for all three systems.
- pH and pOH in every completed workbook row sum to 14.00.
- CH₃COOH–NaOH and NH₃–HCl pH values agree with the charge-balance solvers
  within a provisional 0.02 pH audit threshold.
- Curves contain every completed checkpoint in sorted volume order.

## Discrepancies requiring group review

1. HCl–NaOH at 25% `Veq` (`2.50 mL` NaOH): workbook pH is `1.31`, while
   `(0.0100 − 0.00250) mol / 0.10250 L` gives pH `1.13566`. Absolute difference
   is about `0.17434`, outside the provisional 0.02 audit threshold. The raw
   workbook value remains unchanged in the fixture.
2. Workbook stage labels use `initial`, `half-equivalence`, and
   `near-equivalence` as milestone names. The engine stage contract only uses
   `before-equivalence`, `near-equivalence`, `at-equivalence`, and
   `after-equivalence`; its near-equivalence band is ±0.1% of `Veq`. Therefore
   the workbook's 90% and 99% rows are `before-equivalence` under the engine
   contract. Ten stage-label differences are recorded by the automated audit;
   they do not represent different chemistry calculations.
3. Both tolerance fields are blank, reviewer names/dates are blank, and all
   three review conclusions are `PENDING`.
4. The CH₃COOH–NaOH date cell is Excel serial `46335`, which resolves to
   `2026-11-09`, later than the workbook modification date `2026-09-13`; the
   group should confirm or correct that date.
5. Rows labelled “Dư”/“Dư lớn” are incomplete and cannot be automated until
   volume and expected values are supplied.

## Gate status

The import and discrepancy detection tests PASS, but the Phase 4 acceptance
gate is `REVIEW REQUIRED`, not `DONE`: the group must confirm tolerance,
reviewer/date, the HCl 25% value, stage terminology, and incomplete rows. No
solver value was changed to imitate an unreviewed expected value.
