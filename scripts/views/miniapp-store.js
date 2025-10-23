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

function createImageSlot(label, { variant = 'default', ariaHidden = false } = {}) {
  const slot = document.createElement('div');
  slot.className =
    variant === 'compact'
      ? 'miniapp-store__image-slot miniapp-store__image-slot--compact'
      : 'miniapp-store__image-slot';

  const slotLabel = document.createElement('span');
  slotLabel.className = 'miniapp-store__image-slot-label';
  slotLabel.textContent = label;

  if (ariaHidden) {
    slot.setAttribute('aria-hidden', 'true');
  } else {
    slot.setAttribute('role', 'img');
    slot.setAttribute('aria-label', label);
  }

  slot.append(slotLabel);
  return slot;
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

function renderMiniAppPageItem(entry, index) {
  const item = document.createElement('li');
  item.className = 'miniapp-store__pages-item';
  item.dataset.appId = entry.id;
  item.setAttribute('aria-label', `MiniAppPage sugerida a partir do miniapp ${entry.name}`);

  const imageSlot = createImageSlot(`Prévia da MiniAppPage para ${entry.name}`, {
    variant: 'compact',
  });

  if (Number.isInteger(index)) {
    imageSlot.dataset.position = String(index + 1);
  }

  const content = document.createElement('div');
  content.className = 'miniapp-store__pages-content';

  const name = document.createElement('h3');
  name.className = 'miniapp-store__pages-name';
  name.textContent = entry.name;

  const description = document.createElement('p');
  description.className = 'user-widget__description miniapp-store__pages-description';
  description.textContent = entry.description;

  const metaList = document.createElement('dl');
  metaList.className = 'user-dashboard__summary-list';

  const metaEntries = [
    ['Categoria', entry.category],
    ['Status', entry.statusLabel],
    ['Atualização', entry.updatedAtLabel],
  ];

  if (entry.details?.version) {
    metaEntries.push(['Versão', entry.details.version]);
  }

  metaEntries
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((element) => {
      metaList.append(element);
    });

  const elementsToAppend = [name, description];
  if (metaList.childElementCount > 0) {
    elementsToAppend.push(metaList);
  }

  content.append(...elementsToAppend);
  item.append(imageSlot, content);
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

  const pagesWidget = document.createElement('section');
  pagesWidget.className =
    'surface-card user-panel__widget user-dashboard__widget user-dashboard__widget--full layout-stack layout-stack--md miniapp-store__pages-widget';

  const pagesTitle = document.createElement('h2');
  pagesTitle.className = 'user-widget__title';
  pagesTitle.textContent = 'MiniAppPages disponíveis';

  const pagesDescription = document.createElement('p');
  pagesDescription.className = 'user-widget__description';
  pagesDescription.textContent =
    'Organize os atalhos dos miniapps em páginas dedicadas e prepare conteúdos personalizados para cada time.';

  const pagesList = document.createElement('ul');
  pagesList.className = 'miniapp-store__pages-list';

  const pagesPlaceholder = (() => {
    const placeholder = document.createElement('li');
    placeholder.className = 'miniapp-store__pages-item';

    const placeholderImage = createImageSlot('Prévia das MiniAppPages indisponível no momento', {
      variant: 'compact',
      ariaHidden: true,
    });

    const placeholderContent = document.createElement('div');
    placeholderContent.className = 'miniapp-store__pages-content';

    const placeholderTitle = document.createElement('h3');
    placeholderTitle.className = 'miniapp-store__pages-name';
    placeholderTitle.textContent = 'MiniAppPages em configuração';

    const placeholderText = document.createElement('p');
    placeholderText.className = 'user-widget__description miniapp-store__pages-description';
    placeholderText.textContent =
      'Assim que as MiniAppPages forem publicadas, você poderá destacar coleções de miniapps e conteúdos visuais neste espaço.';

    placeholderContent.append(placeholderTitle, placeholderText);
    placeholder.append(placeholderImage, placeholderContent);
    return placeholder;
  })();

  pagesList.append(pagesPlaceholder);

  pagesWidget.append(pagesTitle, pagesDescription, pagesList);

  const illustrationWidget = document.createElement('section');
  illustrationWidget.className =
    'surface-card user-panel__widget user-dashboard__widget user-dashboard__widget--full layout-stack layout-stack--md miniapp-store__image-widget';

  const illustrationTitle = document.createElement('h2');
  illustrationTitle.className = 'user-widget__title';
  illustrationTitle.textContent = 'Imagem destacada das MiniAppPages';

  const illustrationDescription = document.createElement('p');
  illustrationDescription.className = 'user-widget__description';
  illustrationDescription.textContent =
    'Reserve este espaço para a arte principal das MiniAppPages e mantenha um visual consistente na vitrine.';

  const illustrationPlaceholder = createImageSlot('Imagem das MiniAppPages em breve');

  illustrationWidget.append(illustrationTitle, illustrationDescription, illustrationPlaceholder);

  layout.append(widget, pagesWidget, illustrationWidget);
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

  function renderPages(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      pagesList.replaceChildren(pagesPlaceholder);
      return;
    }

    const items = entries.map((entry, index) => renderMiniAppPageItem(entry, index));
    pagesList.replaceChildren(...items);
  }

  const unsubscribe = subscribeMiniAppCatalog((apps) => {
    try {
      const entries = createMiniAppEntries(apps);
      renderCatalog(entries);
      renderPages(entries);
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
