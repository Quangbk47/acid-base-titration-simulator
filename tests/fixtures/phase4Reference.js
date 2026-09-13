// tests/fixtures/phase4Reference.js

export const phase4References = {
  "HCl-NaOH": {
    analyte: { name: "HCl", concentration: 0.1, volume: 100 },
    titrant: { name: "NaOH", concentration: 1.0 },
    points: [
      { vAdded: 0, expectedPh: 1.00, stage: "before-equivalence" },
      { vAdded: 2.5, expectedPh: 1.14, stage: "before-equivalence" },
      { vAdded: 5.0, expectedPh: 1.32, stage: "before-equivalence" },
      { vAdded: 9.0, expectedPh: 2.04, stage: "near-equivalence" },
      { vAdded: 9.9, expectedPh: 3.04, stage: "near-equivalence" },
      { vAdded: 10.0, expectedPh: 7.00, stage: "at-equivalence" },
      { vAdded: 10.1, expectedPh: 10.96, stage: "after-equivalence" },
      { vAdded: 11.0, expectedPh: 11.95, stage: "after-equivalence" }
    ]
  },
  "CH3COOH-NaOH": {
    analyte: { name: "CH3COOH", concentration: 0.1, volume: 100, pKa: 4.74 },
    titrant: { name: "NaOH", concentration: 1.0 },
    points: [
      { vAdded: 0, expectedPh: 2.87, stage: "initial" },
      { vAdded: 2.5, expectedPh: 4.27, stage: "before-equivalence" },
      { vAdded: 5.0, expectedPh: 4.74, stage: "half-equivalence" },
      { vAdded: 9.0, expectedPh: 5.69, stage: "near-equivalence" },
      { vAdded: 9.9, expectedPh: 6.74, stage: "near-equivalence" },
      { vAdded: 10.0, expectedPh: 8.85, stage: "at-equivalence" },
      { vAdded: 10.1, expectedPh: 10.96, stage: "after-equivalence" }
    ]
  },
  "NH3-HCl": {
    analyte: { name: "NH3", concentration: 0.1, volume: 100, pKb: 4.74 },
    titrant: { name: "HCl", concentration: 1.0 },
    points: [
      { vAdded: 0, expectedPh: 11.13, stage: "initial" },
      { vAdded: 2.5, expectedPh: 9.73, stage: "before-equivalence" },
      { vAdded: 5.0, expectedPh: 9.25, stage: "half-equivalence" },
      { vAdded: 9.0, expectedPh: 8.30, stage: "near-equivalence" },
      { vAdded: 9.9, expectedPh: 7.25, stage: "near-equivalence" },
      { vAdded: 10.0, expectedPh: 5.15, stage: "at-equivalence" },
      { vAdded: 10.1, expectedPh: 3.04, stage: "after-equivalence" }
    ]
  }
};