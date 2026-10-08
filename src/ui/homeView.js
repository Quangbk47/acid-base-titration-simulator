import { initChemicalLibrary } from './chemicalLibraryView.js';
import { chemicalById } from '../data/chemicals.js';
import { titrationPairs } from '../data/titrationPairs.js';
import { project } from '../data/project.js';
import { quizQuestions, faqItems, faqAnswer } from '../data/learning.js';
import { calculateTheory } from './theoryView.js';
import { escapeHtml } from './htmlSafety.js';

export function renderProject(root = document) {
  for (const target of root.querySelectorAll('[data-project-title]')) target.textContent = project.title;
  for (const target of root.querySelectorAll('[data-project-adviser]')) target.textContent = project.adviser + ' · Bộ môn ' + project.department;
  const team = root.querySelector('[data-project-team]');
  if (team) team.innerHTML = project.members.map((member) => `<article class="team-card"><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.className)} · ${escapeHtml(member.major)}</p>${member.role ? `<small>${escapeHtml(member.role)}</small>` : ''}</article>`).join('');
  for (const target of root.querySelectorAll('[data-project-copyright]')) target.textContent = project.copyright;
  const link = root.querySelector('[data-project-repository]'); if (link) link.href = project.repository;
}

export function initHomeView(root = document) {
  initChemicalLibrary(root);
  const quick = root.querySelector('#quick-prediction'); const quickPair = quick.elements.pairId;
  quickPair.replaceChildren(...titrationPairs.map((pair) => new Option(pair.analyte + ' – ' + pair.titrant, pair.id)));
  const quickOutput = root.querySelector('[data-quick-output]'); const transfer = root.querySelector('[data-quick-transfer]');
  const invalidate = () => { transfer.hidden = true; quickOutput.textContent = 'Thông số đã thay đổi. Tính lại để xem dự đoán.'; };
  quick.addEventListener('input', invalidate); quickPair.addEventListener('change', () => { invalidate(); const pair = titrationPairs.find((p) => p.id === quickPair.value); root.querySelector('[data-quick-labels]').textContent = 'Bình: ' + pair.analyte + ' · Buret: ' + pair.titrant; });
  quick.addEventListener('submit', (event) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(quick)); const pair = titrationPairs.find((p) => p.id === values.pairId);
    const theory = calculateTheory({ ...values, systemType: pair.systemType, Ka: chemicalById('acetic').Ka, Kb: chemicalById('ammonia').Kb, buretVolumeMl: 50 });
    if (!theory.ok) { quickOutput.textContent = Object.values(theory.errors ?? {}).join(' ') || theory.solverError?.message || 'Thông số chưa hợp lệ.'; transfer.hidden = true; return; }
    quickOutput.textContent = theory.reaction + ' · n ban đầu = ' + theory.analyteMoles.toPrecision(5) + ' mol · ' + theory.equivalents.map((p, i) => `Tương đương ${i + 1}: ${p.volumeMl.toFixed(2).replace('.', ',')} mL; pH ${p.pH.toFixed(2).replace('.', ',')}`).join(' · ');
    transfer.href = '/simulate?' + new URLSearchParams(values); transfer.hidden = false;
  });
  let questionIndex = 0; const answers = new Map(); const quiz = root.querySelector('[data-quiz-form]');
  const renderQuestion = () => {
    const item = quizQuestions[questionIndex]; root.querySelector('[data-quiz-progress]').textContent = `Câu ${questionIndex + 1}/${quizQuestions.length} · Đúng ${[...answers.values()].filter(Boolean).length}/${answers.size} đã trả lời`;
    root.querySelector('[data-quiz-question]').textContent = item.question;
    root.querySelector('[data-quiz-options]').innerHTML = item.options.map((option, i) => `<label class="quiz-option"><input type="radio" name="answer" value="${i}" required />${escapeHtml(option)}</label>`).join('');
    root.querySelector('[data-quiz-feedback]').textContent = ''; const link = root.querySelector('[data-quiz-link]'); const pair = titrationPairs.find((p) => p.id === item.pairId); link.href = '/simulate?' + new URLSearchParams({ pairId: pair.id, analyteConcentrationM: 0.1, analyteVolumeMl: 25, titrantConcentrationM: pair.id === 'hcl-calcium' ? 0.005 : 0.1 });
    root.querySelector('[data-quiz-prev]').disabled = questionIndex === 0; root.querySelector('[data-quiz-next]').disabled = questionIndex === quizQuestions.length - 1;
  };
  quiz.addEventListener('submit', (event) => { event.preventDefault(); const item = quizQuestions[questionIndex]; const answer = new FormData(quiz).get('answer'); if (answer === null) return; const correct = Number(answer) === item.correct; answers.set(questionIndex, correct); root.querySelector('[data-quiz-feedback]').textContent = (correct ? 'Đúng. ' : 'Chưa đúng. ') + item.explanation; root.querySelector('[data-quiz-progress]').textContent = `Câu ${questionIndex + 1}/${quizQuestions.length} · Đúng ${[...answers.values()].filter(Boolean).length}/${answers.size} đã trả lời`; });
  root.querySelector('[data-quiz-prev]').addEventListener('click', () => { if (questionIndex > 0) { questionIndex--; renderQuestion(); } }); root.querySelector('[data-quiz-next]').addEventListener('click', () => { if (questionIndex < quizQuestions.length - 1) { questionIndex++; renderQuestion(); } }); renderQuestion();
  const faq = root.querySelector('[data-faq-form]'); const faqOutput = root.querySelector('[data-faq-output]');
  root.querySelector('[data-faq-topics]').replaceChildren(...faqItems.map((item) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'button button-quiet'; button.textContent = item.title; button.addEventListener('click', () => { faqOutput.textContent = item.answer; }); return button; }));
  faq.addEventListener('submit', (event) => { event.preventDefault(); faqOutput.textContent = faqAnswer(faq.elements.question.value); });
}
