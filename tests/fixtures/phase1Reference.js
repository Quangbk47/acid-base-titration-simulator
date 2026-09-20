// Hand calculations for 0.100 M HCl (25.00 mL) titrated with 0.100 M NaOH
// at 25 °C. Values use n/V and pH=-log10([H+]) or pH=14+log10([OH-]).
export const phase1Reference = Object.freeze([
  Object.freeze({ id: 'hcl-naoh-initial', totalVolumeL: 0.025, pH: 1, pOH: 13, excessSpecies: 'H⁺', excessMoles: 0.0025, stage: 'before-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-25-percent', totalVolumeL: 0.03125, pH: 1.2218487496163564, pOH: 12.778151250383644, excessSpecies: 'H⁺', excessMoles: 0.001875, stage: 'before-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-50-percent', totalVolumeL: 0.0375, pH: 1.4771212547196624, pOH: 12.522878745280338, excessSpecies: 'H⁺', excessMoles: 0.00125, stage: 'before-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-99-percent', totalVolumeL: 0.04975, pH: 3.298853076409706, pOH: 10.701146923590294, excessSpecies: 'H⁺', excessMoles: 0.000025, stage: 'before-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-equivalence', totalVolumeL: 0.05, pH: 7, pOH: 7, excessSpecies: null, excessMoles: 0, stage: 'at-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-101-percent', totalVolumeL: 0.05025, pH: 10.696803942579509, pOH: 3.3031960574204917, excessSpecies: 'OH⁻', excessMoles: 0.000025, stage: 'after-equivalence' }),
  Object.freeze({ id: 'hcl-naoh-large-excess', totalVolumeL: 0.075, pH: 12.522878745280338, pOH: 1.4771212547196624, excessSpecies: 'OH⁻', excessMoles: 0.0025, stage: 'after-equivalence' }),
]);
