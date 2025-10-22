import eventBus from '../events/event-bus.js';
import { getActiveUser, subscribeSession } from '../data/session-store.js';
import {
  MINI_APP_STATUS_OPTIONS,
  getMiniAppsSnapshot,
  subscribeMiniApps,
} from '../data/miniapp-store.js';
import {
  MAX_FAVORITE_MINI_APPS,
  getUserMiniAppPreferences,
  subscribeMiniAppPreferences,
} from '../data/miniapp-preferences-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

const BASE_CLASSES = 'card view view--home';

const USER_TYPE_LABELS = {
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuário',
};

const VALID_USER_TYPES = new Set(Object.keys(USER_TYPE_LABELS));

const statusLabelMap = new Map(MINI_APP_STATUS_OPTIONS.map((option) => [option.value, option.label]));
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function normalizeUserType(user) {
  const rawType = typeof user?.userType === 'string' ? user.userType.trim().toLowerCase() : '';
  return VALID_USER_TYPES.has(rawType) ? rawType : 'usuario';
}

function formatUserTypeLabel(user) {
  const type = normalizeUserType(user);
  return USER_TYPE_LABELS[type] ?? USER_TYPE_LABELS.usuario;
}

function filterMiniAppsForUser(miniApps, user) {
  const type = normalizeUserType(user);

  return miniApps
    .filter((app) => Array.isArray(app?.access) && app.access.includes(type))
    .sort((a, b) => collator.compare(a?.name ?? '', b?.name ?? ''));
}

function formatStatus(value) {
  if (typeof value !== 'string') {
    return '—';
  }

  const normalized = value.trim().toLowerCase();
  return statusLabelMap.get(normalized) ?? statusLabelMap.get('deployment') ?? '—';
}

function formatUpdatedAt(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return dateTimeFormatter.format(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return dateTimeFormatter.format(date);
    }
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return dateTimeFormatter.format(parsed);
    }
  }

  return '—';
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

function renderMiniAppListItem(app) {
  const item = document.createElement('li');
  item.className = 'home-dashboard__list-item';
  item.dataset.appId = app?.id ?? '';

  const name = document.createElement('h3');
  name.className = 'home-dashboard__action-label';
  name.textContent = app?.name ?? 'Mini-app sem nome';

  const description = document.createElement('p');
  description.className = 'home-dashboard__action-description';
  description.textContent =
    typeof app?.description === 'string' && app.description.trim()
      ? app.description.trim()
      : 'Nenhuma descrição cadastrada ainda.';

  const detailApp = {
    id: app?.id ?? '',
    name: name.textContent,
    description: description.textContent,
    category:
      typeof app?.category === 'string' && app.category.trim() !== ''
        ? app.category.trim()
        : '—',
    status: formatStatus(app?.status),
    updatedAt: formatUpdatedAt(app?.updatedAt),
  };

  if (typeof app?.version === 'string' && app.version.trim() !== '') {
    detailApp.version = app.version.trim();
  }

  const metaList = document.createElement('dl');
  metaList.className = 'user-dashboard__summary-list';

  [
    ['Categoria', typeof app?.category === 'string' ? app.category : '—'],
    ['Status', formatStatus(app?.status)],
    ['Atualização', formatUpdatedAt(app?.updatedAt)],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((entry) => {
      metaList.append(entry);
    });

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'user-dashboard__summary-edit';
  detailsButton.textContent = 'Ver detalhes';
  detailsButton.addEventListener('click', () => {
    eventBus.emit('miniapp:details', { app: detailApp, trigger: detailsButton });
  });

  item.append(name, description, metaList, detailsButton);
  return item;
}

function createMiniAppListContainer(emptyMessage, modifier) {
  const list = document.createElement('ul');
  list.className = 'home-dashboard__miniapps';

  if (modifier) {
    list.classList.add(`home-dashboard__miniapps--${modifier}`);
  }

  if (typeof emptyMessage === 'string' && emptyMessage.trim() !== '') {
    list.dataset.emptyMessage = emptyMessage.trim();
  }

  return list;
}

function renderFavoriteMiniAppsWidget(user, accessibleMiniApps, preferences) {
  const widget = document.createElement('section');
  widget.className =
    'user-panel__widget home-dashboard__widget home-dashboard__widget--favorites home-dashboard__widget-row';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Miniapps favoritados';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = `Organize até ${MAX_FAVORITE_MINI_APPS} favoritos para acesso rápido no perfil ${formatUserTypeLabel(
    user,
  )}.`;

  const list = createMiniAppListContainer('Você ainda não favoritou mini-apps.', 'favorites');

  const accessibleMap = new Map(accessibleMiniApps.map((app) => [app.id, app]));
  const favoriteIds = Array.isArray(preferences?.favorites) ? preferences.favorites : [];

  favoriteIds
    .slice(0, MAX_FAVORITE_MINI_APPS)
    .map((id) => accessibleMap.get(id))
    .filter(Boolean)
    .forEach((app) => {
      list.append(renderMiniAppListItem(app));
    });

  widget.append(title, description, list);
  return widget;
}

function renderSavedMiniAppsWidget(user, accessibleMiniApps, preferences) {
  const widget = document.createElement('section');
  widget.className =
    'user-panel__widget home-dashboard__widget home-dashboard__widget--saved home-dashboard__widget-row';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Miniapps salvos';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = `Todos os mini-apps que você salvou ficam disponíveis aqui para o perfil ${formatUserTypeLabel(
    user,
  )}.`;

  const list = createMiniAppListContainer('Salve mini-apps na loja para vê-los aqui.', 'saved');

  const accessibleMap = new Map(accessibleMiniApps.map((app) => [app.id, app]));
  const savedIds = Array.isArray(preferences?.saved) ? preferences.saved : [];

  savedIds
    .map((id) => accessibleMap.get(id))
    .filter(Boolean)
    .forEach((app) => {
      list.append(renderMiniAppListItem(app));
    });

  widget.append(title, description, list);
  return widget;
}

function renderGuestCallout() {
  const sessionCallout = document.createElement('section');
  sessionCallout.className = 'user-details__selected home-dashboard__callout';

  const sessionText = document.createElement('p');
  sessionText.className = 'user-details__selected-text';
  sessionText.textContent = 'Nenhuma sessão ativa. Escolha um painel para começar a navegar.';

  const sessionActions = document.createElement('div');
  sessionActions.className = 'home-dashboard__callout-actions';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'user-details__selected-action home-dashboard__callout-button';
  loginButton.textContent = 'Fazer login';
  loginButton.addEventListener('click', () => navigateTo('login'));

  const registerButton = document.createElement('button');
  registerButton.type = 'button';
  registerButton.className =
    'user-details__selected-action home-dashboard__callout-button home-dashboard__callout-button--secondary';
  registerButton.textContent = 'Criar conta';
  registerButton.addEventListener('click', () => navigateTo('register'));

  sessionActions.append(loginButton, registerButton);
  sessionCallout.append(sessionText, sessionActions);

  return sessionCallout;
}

function renderMiniAppsWidget(user, accessibleMiniApps) {
  const widget = document.createElement('section');
  widget.className =
    'user-panel__widget home-dashboard__widget home-dashboard__widget--miniapps home-dashboard__widget-row';

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Miniapps liberados';

  const description = document.createElement('p');
  description.className = 'user-widget__description';

  const label = formatUserTypeLabel(user);

  if (accessibleMiniApps.length > 0) {
    description.textContent = `Estes mini-apps estão liberados para o perfil ${label}.`;
  } else {
    description.textContent = `Nenhum mini-app foi liberado para o perfil ${label} até o momento.`;
  }

  const list = createMiniAppListContainer('Os mini-apps liberados para você aparecerão aqui.', 'available');

  accessibleMiniApps.forEach((app) => {
    list.append(renderMiniAppListItem(app));
  });

  widget.append(title, description, list);
  return widget;
}

export function renderHome(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupHandlers = [];

  registerViewCleanup(viewRoot, () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar o Início.', error);
      }
    }
  });

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'home';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title home-dashboard__title';
  heading.textContent = 'Início';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro home-dashboard__intro';
  intro.textContent =
    'Acompanhe o progresso do MiniApp Base, acione os principais painéis e descubra o que mudou nesta edição.';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout home-dashboard__layout';

  viewRoot.replaceChildren(heading, intro, layout);

  const state = {
    user: getActiveUser(),
    miniApps: getMiniAppsSnapshot(),
    preferences: { favorites: [], saved: [] },
  };

  function refreshPreferences() {
    if (!state.user) {
      state.preferences = { favorites: [], saved: [] };
      return;
    }

    state.preferences = getUserMiniAppPreferences(state.user.id);
  }

  refreshPreferences();

  function updateLayout() {
    layout.replaceChildren();

    if (!state.user) {
      layout.append(renderGuestCallout());
      return;
    }

    const accessibleMiniApps = filterMiniAppsForUser(state.miniApps, state.user);

    layout.append(
      renderFavoriteMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
      renderSavedMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
      renderMiniAppsWidget(state.user, accessibleMiniApps),
    );
  }

  updateLayout();

  const unsubscribeSession = subscribeSession((user) => {
    state.user = user;
    refreshPreferences();
    updateLayout();
  });

  if (typeof unsubscribeSession === 'function') {
    cleanupHandlers.push(unsubscribeSession);
  }

  const unsubscribeMiniApps = subscribeMiniApps((miniApps) => {
    state.miniApps = Array.isArray(miniApps) ? miniApps : [];
    updateLayout();
  });

  if (typeof unsubscribeMiniApps === 'function') {
    cleanupHandlers.push(unsubscribeMiniApps);
  }

  const unsubscribePreferences = subscribeMiniAppPreferences((event) => {
    if (!state.user) {
      return;
    }

    const normalizedUserId = String(state.user.id ?? '').trim();
    if (!normalizedUserId) {
      return;
    }

    if (event?.userId && event.userId !== normalizedUserId) {
      return;
    }

    refreshPreferences();
    updateLayout();
  });

  if (typeof unsubscribePreferences === 'function') {
    cleanupHandlers.push(unsubscribePreferences);
  }
}
