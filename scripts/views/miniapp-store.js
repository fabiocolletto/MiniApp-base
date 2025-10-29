import { getMiniAppsSnapshot, getMiniAppStatusLabel } from '../data/miniapp-store.js';

const APP_DOC_BASE_PATH = './docs/miniapps';
const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' });

function normalizeMiniAppId(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

function buildMiniAppDocPath(id) {
  const normalized = normalizeMiniAppId(id);
  return normalized ? `${APP_DOC_BASE_PATH}/${normalized}.md` : '';
}

function formatUpdatedAt(updatedAt, fallback = null) {
  const candidate = updatedAt ?? fallback;
  if (!candidate) {
    return 'Atualização pendente';
  }

  const parsed = candidate instanceof Date ? candidate : new Date(candidate);

  if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
    return 'Atualização pendente';
  }

  return `Atualizado em ${UPDATED_AT_FORMATTER.format(parsed)}`;
}

function createMiniAppCard(app, { highlightId, onHighlight } = {}) {
  const normalizedId = normalizeMiniAppId(app.id);

  const item = document.createElement('li');
  item.className = 'miniapp-store__item';
  item.dataset.appId = normalizedId;

  const card = document.createElement('article');
  card.className = 'miniapp-store__card surface-card';

  const title = document.createElement('h3');
  title.className = 'miniapp-store__title';
  title.textContent = app.name;

  const description = document.createElement('p');
  description.className = 'miniapp-store__description';
  description.textContent = app.description;

  const meta = document.createElement('p');
  meta.className = 'miniapp-store__meta';
  meta.textContent = [
    getMiniAppStatusLabel(app.status),
    formatUpdatedAt(app.updatedAt, app.releaseDate),
  ]
    .filter((value) => typeof value === 'string' && value.trim() !== '')
    .join(' • ');

  const footer = document.createElement('footer');
  footer.className = 'miniapp-store__footer';

  const categoryTag = document.createElement('span');
  categoryTag.className = 'miniapp-store__category';
  categoryTag.textContent = app.category;

  const actions = document.createElement('div');
  actions.className = 'miniapp-store__actions';

  const docLink = document.createElement('a');
  docLink.className = 'miniapp-store__action';
  docLink.href = buildMiniAppDocPath(app.id) || '#';
  docLink.textContent = 'Abrir documentação';
  docLink.title = `Abrir documentação de ${app.name}`;

  actions.append(docLink);
  footer.append(categoryTag, actions);

  card.append(title, description, meta, footer);
  item.append(card);

  const isHighlighted = normalizedId && normalizedId === highlightId;

  if (isHighlighted) {
    item.classList.add('miniapp-store__item--highlight');
    queueMicrotask(() => {
      try {
        docLink.focus();
      } catch (error) {
        console.warn('Não foi possível focar o miniapp destacado.', error);
      }
    });

    if (typeof onHighlight === 'function') {
      onHighlight({ app, link: docLink, id: normalizedId });
    }
  }

  return item;
}

function mapMiniAppToEntry(app) {
  const normalizedId = normalizeMiniAppId(app?.id);

  if (
    !app ||
    !normalizedId ||
    !Array.isArray(app.access) ||
    !app.access.includes('usuario') ||
    String(app.status ?? '').trim().toLowerCase() !== 'active'
  ) {
    return null;
  }

  const name = typeof app.name === 'string' && app.name.trim() ? app.name.trim() : 'MiniApp sem nome';
  const description =
    typeof app.description === 'string' && app.description.trim()
      ? app.description.trim()
      : 'Nenhuma descrição cadastrada ainda.';
  const category = typeof app.category === 'string' && app.category.trim()
    ? app.category.trim()
    : 'Sem categoria';

  return {
    id: normalizedId,
    name,
    description,
    category,
    status: app.status,
    updatedAt: app.updatedAt,
    releaseDate: app.releaseDate,
  };
}

export function renderMiniAppStore(viewRoot, options = {}) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const highlightId = normalizeMiniAppId(options.highlightAppId);

  viewRoot.className = 'card view auth-view view--miniapps';
  viewRoot.dataset.view = 'miniapps';

  const container = document.createElement('section');
  container.className = 'miniapp-store';

  const header = document.createElement('header');
  header.className = 'miniapp-store__header';

  const title = document.createElement('h2');
  title.className = 'miniapp-store__heading';
  title.textContent = 'MiniApp Store';

  const intro = document.createElement('p');
  intro.className = 'miniapp-store__intro';
  intro.textContent =
    'Acesse os MiniApps publicados para sua conta, explore funcionalidades e abra a documentação oficial de cada solução.';

  header.append(title, intro);

  const list = document.createElement('ul');
  list.className = 'miniapp-store__list';

  const apps = getMiniAppsSnapshot()
    .map(mapMiniAppToEntry)
    .filter((entry) => entry !== null)
    .filter((entry) => entry && entry.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  if (apps.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'miniapp-store__empty';
    emptyState.textContent =
      'Ainda não há MiniApps publicados para sua conta. Volte em breve para descobrir novas soluções.';

    container.append(header, emptyState);
    viewRoot.replaceChildren(container);
    return;
  }

  apps.forEach((app) => {
    const item = createMiniAppCard(app, { highlightId, onHighlight: options.onHighlight });
    list.append(item);
  });

  container.append(header, list);
  viewRoot.replaceChildren(container);
}

export default renderMiniAppStore;
