export const PHASE_4_PH_TOLERANCE = 0.02;

// Fixed values transcribed from the Phase 4 hand-calculation sheet. Tests must
// never generate these expected values from production solvers.
export const phase4Nh3HclReference = Object.freeze([
  Object.freeze({ id: 'NH3-HCl-standard-initial', Ca: 0.1, Va: 0, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 11.1247, expectedVeqMl: 25, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-standard-half', Ca: 0.1, Va: 0.0125, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 9.2548, expectedVeqMl: 25, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-standard-equivalence', Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 5.2781, expectedVeqMl: 25, expectedStage: 'at-equivalence', expectedExcessSpecies: null }),
  Object.freeze({ id: 'NH3-HCl-standard-after', Ca: 0.1, Va: 0.02525, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 3.3031, expectedVeqMl: 25, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
  Object.freeze({ id: 'NH3-HCl-standard-excess', Ca: 0.1, Va: 0.05, Cb: 0.1, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 1.4771, expectedVeqMl: 25, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
  Object.freeze({ id: 'NH3-HCl-different-initial', Ca: 0.02, Va: 0, Cb: 0.01, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 10.6184, expectedVeqMl: 12.5, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-different-half', Ca: 0.02, Va: 0.00625, Cb: 0.01, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 9.2514, expectedVeqMl: 12.5, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-different-equivalence', Ca: 0.02, Va: 0.0125, Cb: 0.01, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 5.7152, expectedVeqMl: 12.5, expectedStage: 'at-equivalence', expectedExcessSpecies: null }),
  Object.freeze({ id: 'NH3-HCl-different-after', Ca: 0.02, Va: 0.01275, Cb: 0.01, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 3.8779, expectedVeqMl: 12.5, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
  Object.freeze({ id: 'NH3-HCl-different-excess', Ca: 0.02, Va: 0.025, Cb: 0.01, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 2.301, expectedVeqMl: 12.5, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
  Object.freeze({ id: 'NH3-HCl-dilute-initial', Ca: 1e-6, Va: 0, Cb: 1e-6, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 7.9822, expectedVeqMl: 25, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-dilute-half', Ca: 1e-6, Va: 0.0125, Cb: 1e-6, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 7.5432, expectedVeqMl: 25, expectedStage: 'before-equivalence', expectedExcessSpecies: 'NH₃' }),
  Object.freeze({ id: 'NH3-HCl-dilute-equivalence', Ca: 1e-6, Va: 0.025, Cb: 1e-6, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 6.9941, expectedVeqMl: 25, expectedStage: 'at-equivalence', expectedExcessSpecies: null }),
  Object.freeze({ id: 'NH3-HCl-dilute-after', Ca: 1e-6, Va: 0.02525, Cb: 1e-6, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 6.9835, expectedVeqMl: 25, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
  Object.freeze({ id: 'NH3-HCl-dilute-excess', Ca: 1e-6, Va: 0.05, Cb: 1e-6, Vb: 0.025, Kb: 1.8e-5, temperature: 298.15, expectedPH: 6.4419, expectedVeqMl: 25, expectedStage: 'after-equivalence', expectedExcessSpecies: 'H⁺' }),
]);

export const PHASE_4_REFERENCE_METADATA = Object.freeze({
  source: 'Independent hand calculation documented in docs/PHASE_4_REFERENCE_REPORT.md',
  reviewer: 'Pending group/PO sign-off',
  temperatureK: 298.15,
  kw: 1e-14,
  endpointConvention: 'Endpoint is indicator-derived and is not treated as Veq.',
});
