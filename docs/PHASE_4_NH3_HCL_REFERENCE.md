# Phase 4 — NH₃–HCl reference validation

## Constants and equilibrium equation

The model is ideal aqueous solution at 25 °C: `Kw = 1.00 × 10⁻¹⁴` and
`Kb(NH₃) = 1.80 × 10⁻⁵`. Therefore, `Ka(NH₄⁺) = Kw/Kb = 5.556 × 10⁻¹⁰`.
For total ammonia `CT = n(NH₃)₀/VT`, chloride `CX = n(HCl)/VT` and `h = [H⁺]`,
the solver uses the charge balance

```text
f(h) = h + CT·Kb/(Kb + Kw/h) - Kw/h - CX = 0.
```

The acceptance condition for every fixture row is `|ΔpH| ≤ 0.02`.

## Hand calculation: standard case

For 25.00 mL NH₃ 0.1000 M titrated by HCl 0.1000 M,
`n(NH₃)₀ = 2.500 × 10⁻³ mol`, `Veq = 25.00 mL`, and `V½eq = 12.50 mL`.

- Initial: `[OH⁻] ≈ √(Kb C) = 1.342 × 10⁻³ M`, hence `pH ≈ 11.13`.
- Half-equivalence: `[NH₃] = [NH₄⁺]`, so `pOH = pKb = 4.7447` and `pH ≈ 9.2553`.
- Equivalence: `[NH₄⁺] = 0.05000 M`; `h ≈ √(Ka C) = 5.270 × 10⁻⁶ M`, hence `pH ≈ 5.278`.
- At 25.25 mL HCl, `[H⁺]excess = 4.975 × 10⁻⁴ M`, hence `pH ≈ 3.303`.

The fixed fixtures in `tests/fixtures/phase4Reference.js` preserve pH to four
decimal places; tests calculate the website/reference error for each row.

| Case | HCl added (mL) | Reference pH |
|---|---:|---:|
| Standard 0.1000 M NH₃ / 0.1000 M HCl | 0; 12.50; 25.00; 25.25; 50.00 | 11.1247; 9.2548; 5.2781; 3.3031; 1.4771 |
| Different concentration: 0.01000 M NH₃ / 0.02000 M HCl | 0; 6.25; 12.50; 12.75; 25.00 | 10.6184; 9.2514; 5.7152; 3.8779; 2.3010 |
| Dilute-model boundary: 1.000 × 10⁻⁶ M NH₃ / 1.000 × 10⁻⁶ M HCl | 0; 12.50; 25.00; 25.25; 50.00 | 7.9822; 7.5432; 6.9941; 6.9835; 6.4419 |

## Additional cases and limitations

`NH3-HCl-REF-02-concentration` changes concentrations to 0.01000 M NH₃ and
0.02000 M HCl. `NH3-HCl-REF-03-*` uses 1.000 × 10⁻⁶ M solutions, a near-limit
case where water autoionisation must remain in the equation. At this dilution,
activity, absorbed CO₂ and volumetric error can make real measurements differ
from this ideal model by more than 0.02 pH.

If a row fails, inspect dilution (`VT`), the `Kb`/`Ka` relation, ammonia versus
ammonium ratio in the buffer, and HCl excess after equivalence. A pH of 7 at
equivalence is also incorrect: NH₄⁺ is a weak acid.

The reported stoichiometric excess is NH₃ before equivalence, none at
equivalence, and H⁺ after equivalence. Equilibrium species remain available
separately in `concentrations` and `species`; they must not be confused with the
stoichiometric excess field.
