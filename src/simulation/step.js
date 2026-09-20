import { addDrop as addDropState } from './state.js';

// A simulation step only advances volume. Chemistry is evaluated by the caller.
export const stepSimulation = (state, dropSizeMl) => addDropState(state, dropSizeMl);
export const addDrop = stepSimulation;
