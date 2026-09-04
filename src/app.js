import { chemistryModuleStatus } from './chemistry/index.js';
import { standardCases } from './data/standardCases.js';
import { firebaseModuleStatus } from './firebase/index.js';
import { baselineState } from './simulation/state.js';
import { initNavigation } from './ui/navigation.js';
import { initInputForm } from './ui/inputForm.js';

const route = initNavigation({
  links: document.querySelectorAll('[data-route]'),
  views: document.querySelectorAll('[data-view]'),
});

const status = document.querySelector('#app-status');
if (status) {
  status.textContent = 'Phase 2 · Nhập liệu';
  status.dataset.state = baselineState.screen;
}

initInputForm({ form: document.querySelector('#titration-form') });

document.documentElement.dataset.appReady = 'true';
window.__acidBaseBaseline = Object.freeze({
  route,
  chemistry: chemistryModuleStatus,
  firebase: firebaseModuleStatus,
  standardCaseCount: standardCases.length,
});

