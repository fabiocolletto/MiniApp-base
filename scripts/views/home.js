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

const BASE_CLASSES = 'card view dashboard-view view--home';
const GUEST_CLASSES = 'card view auth-view view--home view--home-guest';

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
const countFormatter = new Intl.NumberFormat('pt-BR');

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
  item.className = 'surface-card home-dashboard__list-item';
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
  detailsButton.className =
    'button panel-action-tile panel-action-tile--compact user-dashboard__summary-edit';
  detailsButton.textContent = 'Ver detalhes';
  detailsButton.addEventListener('click', () => {
    eventBus.emit('miniapp:details', { app: detailApp, trigger: detailsButton });
  });

  item.append(name, description, metaList, detailsButton);
  return item;
}

function renderIntroWidget(user, preferences) {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'user-panel__widget',
    'user-dashboard__widget',
    'home-dashboard__widget',
    'home-dashboard__widget--intro',
  ].join(' ');

  const heading = document.createElement('h2');
  heading.className = 'home-dashboard__heading';
  heading.textContent = 'Bem-vindo ao painel inicial';

  const subtitle = document.createElement('p');
  subtitle.className = 'home-dashboard__subtitle';
  subtitle.textContent = 'Organize seus mini-apps favoritos e liberados em um só lugar.';

  const presentation = document.createElement('p');
  presentation.className = 'home-dashboard__presentation';

  const normalizedName = typeof user?.name === 'string' ? user.name.trim() : '';
  const profileLabel = formatUserTypeLabel(user).toLowerCase();
  const favoritesCount = Array.isArray(preferences?.favorites) ? preferences.favorites.length : 0;
  const savedCount = Array.isArray(preferences?.saved) ? preferences.saved.length : 0;

  const summaryParts = [];

  if (favoritesCount > 0) {
    const formattedFavorites = countFormatter.format(favoritesCount);
    summaryParts.push(
      favoritesCount === 1
        ? `${formattedFavorites} mini-app favoritado`
        : `${formattedFavorites} mini-apps favoritados`,
    );
  }

  if (savedCount > 0) {
    const formattedSaved = countFormatter.format(savedCount);
    summaryParts.push(
      savedCount === 1 ? `${formattedSaved} mini-app salvo` : `${formattedSaved} mini-apps salvos`,
    );
  }

  const highlightsText =
    summaryParts.length > 0
      ? `No momento você acompanha ${summaryParts.join(' e ')}.`
      : 'Acompanhe seus destaques pessoais e descubra novidades conforme elas forem liberadas.';

  if (normalizedName) {
    presentation.textContent = `Olá, ${normalizedName}! Você está autenticado como ${profileLabel}. ${highlightsText}`;
  } else {
    presentation.textContent = `Você está autenticado como ${profileLabel}. ${highlightsText}`;
  }

  widget.append(heading, subtitle, presentation);
  return widget;
}

function renderPanelTagWidget(user) {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'user-panel__widget',
    'user-dashboard__widget',
    'home-dashboard__widget',
    'home-dashboard__widget--tag',
  ].join(' ');

  const label = document.createElement('p');
  label.className = 'home-dashboard__tag-label';
  label.textContent = 'Painel';

  const badge = document.createElement('p');
  badge.className = 'home-dashboard__tag-badge';
  badge.textContent = 'Início';

  const helper = document.createElement('p');
  helper.className = 'home-dashboard__tag-helper';
  helper.textContent = `Perfil ${formatUserTypeLabel(user).toLowerCase()}`;

  widget.append(label, badge, helper);
  return widget;
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
    [
      'surface-card',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
      'home-dashboard__widget--favorites',
      'home-dashboard__widget-row',
    ].join(' ');

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
    [
      'surface-card',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
      'home-dashboard__widget--saved',
      'home-dashboard__widget-row',
    ].join(' ');

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

function renderGuestPanel(ownerDocument) {
  const doc = ownerDocument && typeof ownerDocument.createElement === 'function'
    ? ownerDocument
    : typeof document !== 'undefined' && typeof document.createElement === 'function'
      ? document
      : null;

  if (!doc) {
    return null;
  }

  const panel = doc.createElement('section');
  panel.className = 'auth-panel__form home-guest__panel';

  const title = doc.createElement('h2');
  title.className = 'auth-panel__title home-guest__title';
  title.textContent = 'Acesse sua conta';

  const intro = doc.createElement('p');
  intro.className = 'auth-panel__intro home-guest__intro';
  intro.textContent =
    'Entre ou crie uma conta para sincronizar seus mini-apps favoritos e salvos com qualquer dispositivo.';

  const actions = doc.createElement('div');
  actions.className = 'home-guest__actions';

  const loginButton = doc.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'button button--primary button--pill home-guest__action home-guest__action--primary';
  loginButton.textContent = 'Fazer login';
  loginButton.addEventListener('click', () => navigateTo('login'));

  const registerButton = doc.createElement('button');
  registerButton.type = 'button';
  registerButton.className =
    'button button--secondary button--pill home-guest__action home-guest__action--secondary';
  registerButton.textContent = 'Criar conta';
  registerButton.addEventListener('click', () => navigateTo('register'));

  actions.append(loginButton, registerButton);

  const registerRedirect = doc.createElement('p');
  registerRedirect.className = 'auth-panel__redirect home-guest__redirect';

  const registerRedirectText = doc.createElement('span');
  registerRedirectText.className = 'auth-panel__redirect-text';
  registerRedirectText.textContent = 'É novo por aqui?';

  const registerLink = doc.createElement('a');
  registerLink.className = 'auth-panel__redirect-link';
  registerLink.href = '#register';
  registerLink.title = 'Ir para o painel de cadastro';
  registerLink.textContent = 'Crie sua conta agora';
  registerLink.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo('register');
  });

  registerRedirect.append(registerRedirectText, ' ', registerLink, '.');

  panel.append(title, intro, actions, registerRedirect);

  return panel;
}

function renderMiniAppsWidget(user, accessibleMiniApps) {
  const widget = document.createElement('section');
  widget.className =
    [
      'surface-card',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
      'home-dashboard__widget--miniapps',
      'home-dashboard__widget-row',
    ].join(' ');

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

  viewRoot.dataset.view = 'home';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout user-dashboard__layout home-dashboard__layout';

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
    if (!state.user) {
      viewRoot.className = GUEST_CLASSES;
      viewRoot.setAttribute('aria-label', 'Acesso aos mini-apps');
      const guestPanel = renderGuestPanel(viewRoot.ownerDocument);
      if (guestPanel) {
        viewRoot.replaceChildren(guestPanel);
      }
      return;
    }

    viewRoot.className = BASE_CLASSES;
    viewRoot.setAttribute('aria-label', 'Painel Início');

    layout.replaceChildren();

    const accessibleMiniApps = filterMiniAppsForUser(state.miniApps, state.user);

    layout.append(
      renderIntroWidget(state.user, state.preferences),
      renderPanelTagWidget(state.user),
      renderFavoriteMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
      renderSavedMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
      renderMiniAppsWidget(state.user, accessibleMiniApps),
    );

    if (viewRoot.firstChild !== layout) {
      viewRoot.replaceChildren(layout);
    }
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
