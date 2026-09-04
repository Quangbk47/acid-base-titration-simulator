# PHASE 1 CHECKPOINT

## DEV PASS — 2026-09-04

- Branch: `feature/phase-1-hcl-naoh-chemistry`
- PO status: `CHỜ PO TESTING` (chưa merge main, chưa deploy)
- Gate: CHEM-01 PASS; CHEM-02 PASS; CHEM-05 PASS
- Automated: `npm run check` PASS; `git diff --check` PASS; 9/9 tests PASS
- Independent fixture: `tests/fixtures/phase1Reference.js`
- Cases: initial, 25%, 50%, 99%, 100%, 101% Veq, large excess
- Veq: 25.000 mL; phenolphthalein transition-start endpoint: khoảng 25.000792 mL
- Numerical safety: không NaN/Infinity/chia 0 trong solver/curve và invalid input path
- Scope: chỉ units, strong-strong solver, milestones, curve, standard cases và tests/docs
- SHA implementation: `4bc9f0c6849b3c407b13a703cbd98bf728669b5f`

## PO checklist

1. Chạy `npm run check` trên branch.
2. Kiểm tra pH/pOH, total volume, mol dư, ion/nồng độ và stage ở toàn bộ reference.
3. Xác nhận `Veq` khác endpoint và `Vb=0` là trạng thái ban đầu hợp lệ.
4. Xác nhận branch chưa merge `main` và chưa deploy production.
