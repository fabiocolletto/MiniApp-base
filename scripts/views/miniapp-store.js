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

function createCatalogAvatar(name) {
  const avatar = document.createElement('div');
  avatar.className = 'miniapp-store__catalog-avatar';
  avatar.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'miniapp-store__catalog-avatar-label';

  if (typeof name === 'string' && name.trim() !== '') {
    label.textContent = name.trim().charAt(0).toUpperCase();
  } else {
    label.textContent = 'M';
  }

  avatar.append(label);
  return avatar;
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
  item.className = 'carousel-item miniapp-store__catalog-item';
  item.dataset.appId = entry.id;

  const card = document.createElement('article');
  card.className = 'miniapp-store__catalog-card';

  const header = document.createElement('div');
  header.className = 'miniapp-store__catalog-header';

  const avatar = createCatalogAvatar(entry.name);

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'miniapp-store__catalog-action';
  action.setAttribute('aria-label', `Abrir ficha técnica do miniapp ${entry.name}`);
  action.title = `Abrir ficha técnica de ${entry.name}`;

  const actionSymbol = document.createElement('span');
  actionSymbol.setAttribute('aria-hidden', 'true');
  actionSymbol.textContent = '+';
  action.append(actionSymbol);

  const openDetails = (trigger) => {
    const detailTrigger = trigger instanceof HTMLElement ? trigger : action;
    eventBus.emit('miniapp:details', { app: entry.details, trigger: detailTrigger });
  };

  action.addEventListener('click', () => {
    openDetails(action);
  });

  header.append(avatar, action);

  const name = document.createElement('h3');
  name.className = 'miniapp-store__catalog-name';
  name.textContent = entry.name;

  const description = document.createElement('p');
  description.className = 'miniapp-store__catalog-description';
  description.textContent = entry.description;

  const elements = [header, name];

  const metaText = [entry.statusLabel, entry.updatedAtLabel]
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .join(' · ');

  elements.push(description);

  if (metaText) {
    const meta = document.createElement('p');
    meta.className = 'miniapp-store__catalog-meta';
    meta.textContent = metaText;
    elements.push(meta);
  }

  if (entry.category) {
    const category = document.createElement('span');
    category.className = 'miniapp-store__catalog-tag';
    category.textContent = entry.category;
    elements.push(category);
  }

  card.append(...elements);

  item.append(card);
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
        console.error('Erro ao limpar o painel MiniApps.', error);
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

  function createMiniAppEntries(miniApps) {
    return Array.isArray(miniApps)
      ? miniApps
          .map((app) => mapMiniAppToEntry(app))
          .filter((entry) => entry !== null)
      : [];
  }

  function renderCatalog(entries) {
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
      const entries = createMiniAppEntries(apps);
      renderCatalog(entries);
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
