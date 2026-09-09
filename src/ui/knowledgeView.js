import { titrationKnowledge } from '../data/learningContent.js';

const element = (tagName, className, text) => {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

const appendText = (parent, tagName, className, text) => {
  parent.append(element(tagName, className, text));
};

export const renderKnowledge = (root, content = titrationKnowledge) => {
  if (!root) return;
  root.replaceChildren();

  const heading = element('div', 'page-heading knowledge-heading');
  const headingCopy = element('div');
  appendText(headingCopy, 'p', 'eyebrow', 'Phase 5 · Knowledge');
  appendText(headingCopy, 'h1', null, content.title);
  appendText(headingCopy, 'p', 'lead', content.introduction);
  heading.append(headingCopy);
  root.append(heading);

  const concepts = element('section', 'knowledge-section', null);
  concepts.setAttribute('aria-labelledby', 'knowledge-concepts-title');
  appendText(concepts, 'h2', 'knowledge-section-title', 'Phân biệt ba khái niệm');
  concepts.lastElementChild.id = 'knowledge-concepts-title';
  const cards = element('div', 'knowledge-card-grid');
  for (const concept of content.concepts) {
    const card = element('article', 'knowledge-card');
    appendText(card, 'h3', null, concept.title);
    appendText(card, 'p', null, concept.description);
    appendText(card, 'p', 'knowledge-emphasis', concept.emphasis);
    cards.append(card);
  }
  concepts.append(cards);
  root.append(concepts);

  const example = element('section', 'knowledge-callout');
  example.setAttribute('aria-labelledby', 'knowledge-example-title');
  appendText(example, 'h2', null, content.example.title);
  example.lastElementChild.id = 'knowledge-example-title';
  appendText(example, 'p', null, content.example.description);
  appendText(example, 'p', 'knowledge-note', content.example.note);
  root.append(example);

  const regions = element('section', 'knowledge-section');
  regions.setAttribute('aria-labelledby', 'knowledge-curve-title');
  appendText(regions, 'h2', 'knowledge-section-title', 'Cách đọc đường cong pH–V');
  regions.lastElementChild.id = 'knowledge-curve-title';
  const regionList = element('ol', 'knowledge-region-list');
  for (const region of content.curveRegions) {
    const item = element('li');
    const title = element('strong', null, region.title);
    item.append(title, document.createTextNode(` — ${region.description}`));
    regionList.append(item);
  }
  regions.append(regionList);
  root.append(regions);

  const indicator = element('section', 'knowledge-callout knowledge-callout-secondary');
  indicator.setAttribute('aria-labelledby', 'knowledge-indicator-title');
  appendText(indicator, 'h2', null, content.indicator.title);
  indicator.lastElementChild.id = 'knowledge-indicator-title';
  appendText(indicator, 'p', null, content.indicator.description);
  appendText(indicator, 'p', 'knowledge-note', content.indicator.note);
  root.append(indicator);

  const checks = element('section', 'knowledge-section');
  checks.setAttribute('aria-labelledby', 'knowledge-check-title');
  appendText(checks, 'h2', 'knowledge-section-title', 'Tự kiểm tra');
  checks.lastElementChild.id = 'knowledge-check-title';
  const checkList = element('ol', 'knowledge-check-list');
  for (const check of content.checks) {
    const item = element('li');
    appendText(item, 'p', null, check.question);
    appendText(item, 'p', 'knowledge-answer', `Đáp án: ${check.answer}`);
    checkList.append(item);
  }
  checks.append(checkList);
  root.append(checks);
};
