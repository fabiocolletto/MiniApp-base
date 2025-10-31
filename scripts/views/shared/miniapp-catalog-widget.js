import { normalizeMiniAppId } from '../miniapp-store.js';
import { MINI_APP_BILLING_OPTIONS } from '../../data/miniapp-store.js';

const BILLING_LABELS = new Map(MINI_APP_BILLING_OPTIONS.map((option) => [option.value, option.label]));

const FILTERS = [
  {
    id: 'free',
    label: 'MiniApps gratuitos',
    icon: 'M10 2l2.09 4.24 4.68.68-3.39 3.3.8 4.63L10 12.9 5.82 14.85l.8-4.63-3.39-3.3 4.68-.68Z',
  },
  {
    id: 'subscription',
    label: 'MiniApps por assinatura',
    icon: 'M5 4h10a1 1 0 0 1 1 1v2h-2V6H6v8h8v-1h2v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm9 5 3 3-3 3v-2H8v-2h6V9Z',
  },
  {
    id: 'product',
    label: 'MiniApps vinculados a produtos',
    icon: 'M6.5 6V5a3.5 3.5 0 1 1 7 0v1H15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.5Zm2-1a1.5 1.5 0 1 0 3 0v1h-3V5Z',
  },
];

function toBillingLabel(value) {
  return BILLING_LABELS.get(value) ?? BILLING_LABELS.get('free') ?? 'Grátis';
}

function sanitizeMiniApps(apps) {
  if (!Array.isArray(apps)) {
    return [];
  }

  const seen = new Set();
  const sanitized = [];

  apps.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const id = normalizeMiniAppId(entry.id);
    if (!id || seen.has(id)) {
      return;
    }

    seen.add(id);

    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : 'MiniApp sem nome';
    const description =
      typeof entry.description === 'string' && entry.description.trim() ? entry.description.trim() : '';
    const category = typeof entry.category === 'string' && entry.category.trim() ? entry.category.trim() : null;
    const billing = typeof entry.billing === 'string' ? entry.billing.trim().toLowerCase() : 'free';
    const billingLabel =
      typeof entry.billingLabel === 'string' && entry.billingLabel.trim()
        ? entry.billingLabel.trim()
        : toBillingLabel(billing);

    sanitized.push({ id, name, description, category, billing, billingLabel });
  });

  sanitized.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return sanitized;
}

function createFilterButton(doc, { id, label, icon }, { isActive = false, onToggle } = {}) {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'miniapp-catalog-widget__filter';
  if (isActive) {
    button.classList.add('is-active');
  }
  button.dataset.filterId = id;
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  button.setAttribute('title', label);
  button.setAttribute('aria-label', label);

  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('miniapp-catalog-widget__filter-icon');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('role', 'presentation');
  svg.setAttribute('aria-hidden', 'true');

  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', icon);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);

  const srLabel = doc.createElement('span');
  srLabel.className = 'sr-only';
  srLabel.textContent = label;

  button.append(svg, srLabel);

  if (typeof onToggle === 'function') {
    button.addEventListener('click', () => {
      onToggle(id);
    });
  }

  return button;
}

function createMiniAppItem(doc, app, { onOpenMiniApp } = {}) {
  const item = doc.createElement('li');
  item.className = 'miniapp-catalog-widget__item';
  item.dataset.appId = app.id;

  const header = doc.createElement('header');
  header.className = 'miniapp-catalog-widget__item-header';

  const title = doc.createElement('h4');
  title.className = 'miniapp-catalog-widget__item-title';
  title.textContent = app.name;

  const badge = doc.createElement('span');
  badge.className = 'miniapp-catalog-widget__badge';
  badge.textContent = app.billingLabel;

  header.append(title, badge);

  const description = doc.createElement('p');
  description.className = 'miniapp-catalog-widget__item-description';
  description.textContent = app.description;

  const footer = doc.createElement('footer');
  footer.className = 'miniapp-catalog-widget__item-footer';

  if (app.category) {
    const category = doc.createElement('span');
    category.className = 'miniapp-catalog-widget__category';
    category.textContent = `Categoria: ${app.category}`;
    footer.append(category);
  }

  const action = doc.createElement('button');
  action.type = 'button';
  action.className = 'miniapp-catalog-widget__open';
  action.textContent = 'Ver detalhes';
  action.addEventListener('click', () => {
    if (typeof onOpenMiniApp === 'function') {
      onOpenMiniApp(app.id);
    }
  });

  footer.append(action);

  item.append(header, description, footer);
  return item;
}

export function createMiniAppCatalogWidget({
  doc,
  widgetId,
  apps = [],
  onOpenMiniApp,
} = {}) {
  if (!doc || typeof doc.createElement !== 'function') {
    throw new Error('createMiniAppCatalogWidget requer um document válido.');
  }

  const sanitizedApps = sanitizeMiniApps(apps);
  const root = doc.createElement('article');
  root.className = 'auth-widget miniapp-catalog-widget miniapp-catalog-widget--floating';

  if (widgetId) {
    root.dataset.widget = widgetId;
  }

  const header = doc.createElement('header');
  header.className = 'miniapp-catalog-widget__header';

  const title = doc.createElement('h3');
  title.className = 'miniapp-catalog-widget__title';
  title.textContent = 'MiniApps disponíveis';

  const subtitle = doc.createElement('p');
  subtitle.className = 'miniapp-catalog-widget__subtitle';
  subtitle.textContent = 'Use os filtros para focar em MiniApps gratuitos, por assinatura ou ligados a produtos.';

  const counter = doc.createElement('span');
  counter.className = 'miniapp-catalog-widget__counter';

  const filters = doc.createElement('div');
  filters.className = 'miniapp-catalog-widget__filters';

  let activeFilter = null;
  const filterButtons = new Map();
  let listContainer = null;
  let emptyState = null;

  function updateCounter(total) {
    const quantity = Number.isFinite(total) ? total : sanitizedApps.length;
    const suffix = quantity === 1 ? 'MiniApp disponível' : 'MiniApps disponíveis';
    counter.textContent = `${quantity} ${suffix}`;
  }

  function renderList() {
    const listItems = activeFilter
      ? sanitizedApps.filter((app) => app.billing === activeFilter)
      : sanitizedApps.slice();

    const list = doc.createElement('ul');
    list.className = 'miniapp-catalog-widget__list';
    list.setAttribute('role', 'list');

    const empty = doc.createElement('p');
    empty.className = 'miniapp-catalog-widget__empty';
    empty.hidden = true;

    if (listItems.length === 0) {
      empty.hidden = false;
      empty.textContent = activeFilter
        ? `Nenhum MiniApp disponível na modalidade ${toBillingLabel(activeFilter)}.`
        : 'Nenhum MiniApp disponível no momento.';
    } else {
      const fragment = doc.createDocumentFragment();
      listItems.forEach((app) => {
        fragment.append(createMiniAppItem(doc, app, { onOpenMiniApp }));
      });
      list.append(fragment);
    }

    updateCounter(listItems.length);
    return { list, empty };
  }

  function handleFilterToggle(filterId) {
    if (!filterButtons.has(filterId)) {
      return;
    }

    const nextFilter = activeFilter === filterId ? null : filterId;
    activeFilter = nextFilter;

    filterButtons.forEach((button, id) => {
      const isActive = id === activeFilter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const { list, empty } = renderList();
    if (listContainer) {
      listContainer.replaceChildren(list);
    }
    if (emptyState) {
      emptyState.replaceWith(empty);
    }
    emptyState = empty;
  }

  FILTERS.forEach((filter) => {
    const button = createFilterButton(doc, filter, {
      isActive: false,
      onToggle: handleFilterToggle,
    });
    filterButtons.set(filter.id, button);
    filters.append(button);
  });

  header.append(title, subtitle, counter, filters);

  let { list, empty } = renderList();
  emptyState = empty;
  listContainer = doc.createElement('div');
  listContainer.className = 'miniapp-catalog-widget__content';
  listContainer.append(list);

  root.append(header, listContainer, emptyState);
  return root;
}
