import { titrationKnowledge } from '../data/learningContent.js';

const make = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value) node.textContent = value;
  return node;
};

const cards = (title, entries) => {
  const section = make('section', 'knowledge-section');
  section.append(make('h2', null, title));
  const grid = make('div', 'knowledge-card-grid');
  for (const entry of entries) {
    const card = make('article', 'knowledge-card');
    card.append(make('h3', null, entry.title), make('p', null, entry.description));
    if (entry.emphasis) card.append(make('p', 'knowledge-emphasis', entry.emphasis));
    grid.append(card);
  }
  section.append(grid);
  return section;
};

export const renderKnowledge = (root, content = titrationKnowledge) => {
  if (!root) return;
  root.replaceChildren();
  const heading = make('div', 'page-heading knowledge-heading');
  const copy = make('div');
  copy.append(make('p', 'eyebrow', 'Phase 5 · Scientific readiness'), make('h1', null, content.title), make('p', 'lead', content.introduction));
  heading.append(copy);
  root.append(heading, cards('Phân biệt ba khái niệm', content.concepts));

  const regions = make('section', 'knowledge-section');
  regions.append(make('h2', null, 'Cách đọc đường cong pH–V'));
  const list = make('ol', 'knowledge-region-list');
  for (const region of content.curveRegions) {
    const item = make('li');
    item.append(make('strong', null, region.title), document.createTextNode(` — ${region.description}`));
    list.append(item);
  }
  regions.append(list);
  root.append(regions);

  const indicator = make('section', 'knowledge-callout');
  indicator.append(make('h2', null, content.indicator.title), make('p', null, content.indicator.description), make('p', 'knowledge-emphasis', content.indicator.note));
  root.append(indicator, cards('Giới hạn mô hình', content.modelLimits));
};
