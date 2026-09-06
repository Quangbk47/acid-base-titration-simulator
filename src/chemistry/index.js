export { solveStrongStrong } from './strongStrong.js';
export { solveWeakAcidStrongBase } from './weakAcidStrongBase.js';
export { solveStrongAcidWeakBase } from './strongAcidWeakBase.js';
export { generateCurve } from './curve.js';
export { generateWeakAcidCurve } from './weakCurve.js';
export {
  calculateEndpointMl,
  calculateEquivalenceMolTolerance,
  calculateEquivalenceMl,
  calculateMilestones,
  classifyStage,
} from './milestones.js';
export {
  ChemistryInputError,
  isFiniteNumber,
  lToMl,
  mlToL,
  celsiusToKelvin,
  isSupportedTemperatureK,
  validateStrongStrongInput,
} from './units.js';

export const chemistryModuleStatus = 'phase-1-strong-strong-verified';

