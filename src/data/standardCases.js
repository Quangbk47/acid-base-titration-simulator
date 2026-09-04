// Public, verified Phase 1 cases. Expected values live in tests/fixtures and are
// intentionally not generated from the solver, so tests retain an independent reference.
export const standardCases = Object.freeze([
  Object.freeze({ id: 'hcl-naoh-initial', label: 'Ban đầu', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 0, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-25-percent', label: '25% Veq', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 6.25, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-50-percent', label: '50% Veq', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 12.5, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-99-percent', label: '99% Veq', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 24.75, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-equivalence', label: '100% Veq', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 25, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-101-percent', label: '101% Veq', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 25.25, temperature: 25 }),
  Object.freeze({ id: 'hcl-naoh-large-excess', label: 'Dư lớn', Ca: 0.1, Va: 25, Cb: 0.1, Vb: 50, temperature: 25 }),
]);

