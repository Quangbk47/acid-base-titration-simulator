import { renderProject, initHomeView } from './ui/homeView.js';
import { chemistryModuleStatus } from './chemistry/index.js';
import { standardCases } from './data/standardCases.js';
import { firebaseModuleStatus } from './firebase/index.js';
import { baselineState } from './simulation/state.js';
import { initNavigation } from './ui/navigation.js';
import { initInputForm } from './ui/inputForm.js';
import { initVesselView } from './ui/vesselView.js';

const route = initNavigation({
  links: document.querySelectorAll('[data-route]'),
  views: document.querySelectorAll('[data-view]'),
});

const status = document.querySelector('#app-status');
if (status) {
  status.textContent = 'Phòng thí nghiệm số';
  status.dataset.state = baselineState.screen;
}

renderProject();
if (route === 'home') initHomeView();
const vesselView = initVesselView();
const inputForm = initInputForm({ form: document.querySelector('#titration-form'), onStateChange: (state) => vesselView.update(state) });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) { inputForm?.dispose(); vesselView.dispose(); }
});

document.documentElement.dataset.appReady = 'true';
window.__acidBaseBaseline = Object.freeze({
  route,
  chemistry: chemistryModuleStatus,
  firebase: firebaseModuleStatus,
  standardCaseCount: standardCases.length,
});
