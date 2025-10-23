import eventBus from '../events/event-bus.js';
import { getMiniAppStatusLabel, subscribeMiniApps as subscribeMiniAppCatalog } from '../data/miniapp-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

function formatUpdatedAt(value) {
  if (!value) {
    return 'Atualização pendente';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Atualização pendente';
  }

  return `Atualizado em ${UPDATED_AT_FORMATTER.format(date)}`;
}

function createSummaryEntry(term, value) {
  if (!term || !value) {
    return null;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'user-dashboard__summary-item';

  const termElement = document.createElement('dt');
  termElement.className = 'user-dashboard__summary-label';
  termElement.textContent = term;

  const valueElement = document.createElement('dd');
  valueElement.className = 'user-dashboard__summary-value';
  valueElement.textContent = value;

  wrapper.append(termElement, valueElement);
  return wrapper;
}

function mapMiniAppToEntry(app) {
  if (!app) {
    return null;
  }

  const name = typeof app.name === 'string' && app.name.trim() !== '' ? app.name.trim() : 'Miniapp sem nome';
  const description =
    typeof app.description === 'string' && app.description.trim() !== ''
      ? app.description.trim()
      : 'Nenhuma descrição cadastrada ainda.';
  const category = typeof app.category === 'string' && app.category.trim() !== '' ? app.category.trim() : '—';
  const statusLabel = getMiniAppStatusLabel(app.status);
  const updatedAtLabel = formatUpdatedAt(app.updatedAt ?? app.releaseDate);

  const details = {
    id: app.id ?? '',
    name,
    description,
    category,
    status: statusLabel,
    updatedAt: updatedAtLabel,
  };

  if (typeof app.version === 'string' && app.version.trim() !== '') {
    details.version = app.version.trim();
  }

  return {
    id: details.id,
    name,
    description,
    category,
    statusLabel,
    updatedAtLabel,
    details,
  };
}

function renderMiniAppCatalogItem(entry) {
  const item = document.createElement('li');
  item.className = 'home-dashboard__list-item carousel-item miniapp-store__catalog-item';
  item.dataset.appId = entry.id;
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Abrir detalhes de ${entry.name}`);

  const name = document.createElement('h3');
  name.className = 'home-dashboard__action-label';
  name.textContent = entry.name;

  const description = document.createElement('p');
  description.className = 'home-dashboard__action-description';
  description.textContent = entry.description;

  const metaList = document.createElement('dl');
  metaList.className = 'user-dashboard__summary-list';

  [
    ['Categoria', entry.category],
    ['Status', entry.statusLabel],
    ['Atualização', entry.updatedAtLabel],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((element) => {
      metaList.append(element);
    });

  const openDetails = (trigger) => {
    const detailTrigger = trigger instanceof HTMLElement ? trigger : item;
    eventBus.emit('miniapp:details', { app: entry.details, trigger: detailTrigger });
  };

  item.addEventListener('click', () => {
    openDetails(item);
  });

  item.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails(item);
    }
  });

  item.append(name, description, metaList);
  return item;
}

export function renderMiniAppStore(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupCallbacks = [];

  registerViewCleanup(viewRoot, () => {
    while (cleanupCallbacks.length > 0) {
      const cleanup = cleanupCallbacks.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar a Mini App Store.', error);
      }
    }
  });

  viewRoot.className = 'view dashboard-view view--user miniapp-store-view';
  viewRoot.dataset.view = 'miniapps';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout user-dashboard__layout';

  const widget = document.createElement('section');
  widget.className =
    'surface-card user-panel__widget user-dashboard__widget user-dashboard__widget--full layout-stack layout-stack--md miniapp-store__widget';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Miniapps disponíveis';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = 'Acesse rapidamente todos os miniapps liberados para a sua organização.';

  const catalog = document.createElement('ul');
  catalog.className = 'miniapp-store__catalog carousel-list';

  const emptyState = document.createElement('p');
  emptyState.className = 'user-widget__description miniapp-store__empty';
  emptyState.textContent = 'Nenhum miniapp disponível no momento.';
  emptyState.hidden = true;

  widget.append(title, description, catalog, emptyState);
  layout.append(widget);
  viewRoot.replaceChildren(layout);

  function renderCatalog(miniApps) {
    const entries = Array.isArray(miniApps)
      ? miniApps
          .map((app) => mapMiniAppToEntry(app))
          .filter((entry) => entry !== null)
      : [];

    if (entries.length === 0) {
      catalog.replaceChildren();
      catalog.hidden = true;
      emptyState.hidden = false;
      return;
    }

    const items = entries.map((entry) => renderMiniAppCatalogItem(entry));
    catalog.replaceChildren(...items);
    catalog.hidden = false;
    emptyState.hidden = true;
  }

  const unsubscribe = subscribeMiniAppCatalog((apps) => {
    try {
      renderCatalog(apps);
    } catch (error) {
      console.error('Erro ao renderizar a lista de miniapps.', error);
    }
  });

  cleanupCallbacks.push(() => {
    try {
      unsubscribe?.();
    } catch (error) {
      console.error('Erro ao encerrar assinatura dos miniapps.', error);
    }
  });
}
