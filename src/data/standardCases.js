import { celsiusToKelvin, mlToL } from '../chemistry/units.js';

// Boundary-facing case data uses the units shown in the UI. Convert it explicitly
// before calling the internal solver, whose contract is M, L and K.
export const standardCases = Object.freeze([
  Object.freeze({ id: 'hcl-naoh-initial', label: 'Ban đầu', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 0, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-25-percent', label: '25% Veq', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 6.25, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-50-percent', label: '50% Veq', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 12.5, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-99-percent', label: '99% Veq', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 24.75, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-equivalence', label: '100% Veq', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 25, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-101-percent', label: '101% Veq', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 25.25, temperatureC: 25 }),
  Object.freeze({ id: 'hcl-naoh-large-excess', label: 'Dư lớn', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 50, temperatureC: 25 }),
  Object.freeze({ id: 'ch3cooh-naoh-initial', label: 'CH₃COOH–NaOH · Ban đầu', systemType: 'weak-acid-strong-base', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 0, Ka: 1.8e-5, temperatureC: 25 }),
  Object.freeze({ id: 'ch3cooh-naoh-half-equivalence', label: 'CH₃COOH–NaOH · 1/2 tương đương', systemType: 'weak-acid-strong-base', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 12.5, Ka: 1.8e-5, temperatureC: 25 }),
  Object.freeze({ id: 'ch3cooh-naoh-equivalence', label: 'CH₃COOH–NaOH · Tương đương', systemType: 'weak-acid-strong-base', CaM: 0.1, VaMl: 25, CbM: 0.1, VbMl: 25, Ka: 1.8e-5, temperatureC: 25 }),
]);

export const standardCaseToSolverInput = ({ CaM, VaMl, CbM, VbMl, Ka, temperatureC }) =>
  Object.freeze({
    Ca: CaM,
    Va: mlToL(VaMl),
    Cb: CbM,
    Vb: mlToL(VbMl),
    temperature: celsiusToKelvin(temperatureC),
    ...(Ka ? { Ka } : {}),
  });

