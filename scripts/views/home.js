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
import {
  getUserMiniAppActivity,
  subscribeMiniAppActivity,
} from '../data/miniapp-activity-store.js';
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

function formatUserName(user) {
  if (typeof user?.name === 'string') {
    const trimmed = user.name.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function formatUserEmail(user) {
  if (typeof user?.profile?.email === 'string') {
    const trimmed = user.profile.email.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function formatUserPhone(user) {
  if (typeof user?.phone === 'string') {
    const trimmed = user.phone.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  if (typeof user?.profile?.secondaryPhone === 'string') {
    const trimmed = user.profile.secondaryPhone.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function getPreferenceCount(preferences, key, options = {}) {
  if (!preferences || typeof preferences !== 'object') {
    return 0;
  }

  const collection = preferences[key];
  if (!Array.isArray(collection)) {
    return 0;
  }

  const { accessibleMiniApps, limit } = options;

  let ids = collection;
  if (Number.isFinite(limit) && limit > 0) {
    ids = ids.slice(0, limit);
  }

  if (!Array.isArray(accessibleMiniApps) || accessibleMiniApps.length === 0) {
    return ids.length;
  }

  const accessibleIds = new Set();

  accessibleMiniApps.forEach((app) => {
    if (app && typeof app.id === 'string') {
      const trimmed = app.id.trim();
      if (trimmed !== '') {
        accessibleIds.add(trimmed);
      }
    }
  });

  if (accessibleIds.size === 0) {
    return 0;
  }

  return ids.reduce((count, id) => {
    if (typeof id !== 'string') {
      return count;
    }

    const trimmed = id.trim();
    if (trimmed === '') {
      return count;
    }

    return accessibleIds.has(trimmed) ? count + 1 : count;
  }, 0);
}

function formatMiniAppCountLabel(count) {
  if (!Number.isFinite(count) || count <= 0) {
    return 'Nenhum mini-app';
  }

  if (count === 1) {
    return '1 mini-app';
  }

  return `${count} mini-apps`;
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

function renderMiniAppIconItem(app, options = {}) {
  const modifier =
    typeof options?.modifier === 'string' && options.modifier.trim() !== ''
      ? options.modifier.trim()
      : 'favorite';
  const srLabelText =
    typeof options?.srLabelText === 'string' && options.srLabelText.trim() !== ''
      ? options.srLabelText.trim()
      : null;
  const title = typeof options?.title === 'string' && options.title.trim() !== '' ? options.title.trim() : null;

  const item = document.createElement('li');
  item.className = `home-dashboard__miniapps-item home-dashboard__miniapps-item--${modifier}`;
  item.dataset.appId = app?.id ?? '';

  if (title) {
    item.title = title;
    item.setAttribute('aria-label', title);
  }

  const iconWrapper = document.createElement('span');
  iconWrapper.className = 'admin-miniapp-table__avatar home-dashboard__miniapps-icon';

  if (typeof app?.icon === 'string' && app.icon.trim() !== '') {
    const image = document.createElement('img');
    image.className = 'admin-miniapp-table__avatar-image';
    image.alt = '';
    image.src = app.icon.trim();
    iconWrapper.dataset.state = 'image';
    iconWrapper.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className =
      'admin-miniapp-table__avatar-placeholder home-dashboard__miniapps-icon-placeholder';
    const fallbackInitial = app?.name?.trim().charAt(0).toUpperCase();
    placeholder.textContent = fallbackInitial || 'M';
    iconWrapper.dataset.state = 'placeholder';
    iconWrapper.append(placeholder);
  }

  const srLabel = document.createElement('span');
  srLabel.className = 'sr-only';
  if (srLabelText) {
    srLabel.textContent = srLabelText;
  } else {
    srLabel.textContent = app?.name ?? 'Mini-app favoritado';
  }

  item.append(iconWrapper, srLabel);
  return item;
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
      list.append(renderMiniAppIconItem(app));
    });

  widget.append(title, description, list);
  return widget;
}

function renderRecentMiniAppsWidget(user, accessibleMiniApps, activity) {
  const widget = document.createElement('section');
  widget.className =
    [
      'surface-card',
      'surface-card--transparent',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
      'home-dashboard__widget--recent',
    ].join(' ');

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Últimos acessos';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = `Reveja os mini-apps que você abriu recentemente no perfil ${formatUserTypeLabel(user)}.`;

  const list = createMiniAppListContainer(
    'Os mini-apps acessados recentemente aparecerão aqui.',
    'recent',
  );

  const accessibleMap = new Map(accessibleMiniApps.map((app) => [app.id, app]));

  const recentEntries = [];
  activity.forEach((entry) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const appId = typeof entry.appId === 'string' ? entry.appId : '';
    const app = accessibleMap.get(appId);
    if (!app) {
      return;
    }

    recentEntries.push({
      app,
      lastAccessedAt: entry.lastAccessedAt,
    });
  });

  recentEntries.slice(0, MAX_FAVORITE_MINI_APPS).forEach(({ app, lastAccessedAt }) => {
    const formattedAccess = formatUpdatedAt(lastAccessedAt);
    const label = app?.name
      ? formattedAccess !== '—'
        ? `${app.name} (acessado em ${formattedAccess})`
        : app.name
      : 'Mini-app acessado recentemente';

    list.append(
      renderMiniAppIconItem(app, {
        modifier: 'recent',
        srLabelText: label,
        title: label,
      }),
    );
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

  const userPanelButton = doc.createElement('button');
  userPanelButton.type = 'button';
  userPanelButton.className = 'button button--primary button--pill home-guest__action home-guest__action--primary';
  userPanelButton.textContent = 'Ir para o painel do usuário';
  userPanelButton.addEventListener('click', () => navigateTo('user'));

  actions.append(userPanelButton);

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

function renderHomeIntroWidget() {
  const widget = document.createElement('section');
  widget.className =
    [
      'surface-card',
      'surface-card--transparent',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
    ].join(' ');

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Painel inicial';

  const subtitle = document.createElement('p');
  subtitle.className = 'user-widget__description';
  subtitle.textContent = 'Seu ponto de partida para acompanhar miniapps e usuários.';

  const intro = document.createElement('p');
  intro.className = 'user-widget__description';
  intro.textContent =
    'Centralize destaques, favoritos e novidades da plataforma em um único lugar.';

  widget.append(title, subtitle, intro);
  return widget;
}

function renderHomePanelLabelWidget(user, preferences, accessibleMiniApps) {
  const widget = document.createElement('section');
  widget.className =
    [
      'surface-card',
      'surface-card--transparent',
      'user-panel__widget',
      'user-dashboard__widget',
      'home-dashboard__widget',
    ].join(' ');

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Etiqueta do painel';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent =
    'Compartilhe esta etiqueta para facilitar o acesso rápido ao painel.';

  const labelGroup = document.createElement('div');
  labelGroup.className = 'miniapp-details__highlights';

  const panelLabel = document.createElement('span');
  panelLabel.className = 'miniapp-details__chip';
  panelLabel.textContent = 'Painel Início';
  labelGroup.append(panelLabel);

  const profileLabel = document.createElement('span');
  profileLabel.className = 'miniapp-details__chip';
  profileLabel.textContent = `Perfil ${formatUserTypeLabel(user)}`;
  labelGroup.append(profileLabel);

  widget.append(title, description, labelGroup);

  const summary = document.createElement('div');
  summary.className = 'user-dashboard__summary';

  const userInfoList = document.createElement('dl');
  userInfoList.className = 'user-dashboard__summary-list';

  [
    ['Nome', formatUserName(user)],
    ['E-mail', formatUserEmail(user)],
    ['Telefone', formatUserPhone(user)],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((entry) => {
      userInfoList.append(entry);
    });

  if (userInfoList.children.length > 0) {
    summary.append(userInfoList);
  }

  const preferencesList = document.createElement('dl');
  preferencesList.className = 'user-dashboard__summary-list';

  const favoriteCount = getPreferenceCount(preferences, 'favorites', { accessibleMiniApps });
  const savedCount = getPreferenceCount(preferences, 'saved', { accessibleMiniApps });

  [
    ['Mini-apps favoritados', formatMiniAppCountLabel(favoriteCount)],
    ['Mini-apps salvos', formatMiniAppCountLabel(savedCount)],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((entry) => {
      preferencesList.append(entry);
    });

  if (preferencesList.children.length > 0) {
    summary.append(preferencesList);
  }

  if (summary.children.length > 0) {
    widget.append(summary);
  }

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
    activity: [],
  };

  function refreshPreferences() {
    if (!state.user) {
      state.preferences = { favorites: [], saved: [] };
      return;
    }

    state.preferences = getUserMiniAppPreferences(state.user.id);
  }

  function refreshActivity() {
    if (!state.user) {
      state.activity = [];
      return;
    }

    state.activity = getUserMiniAppActivity(state.user.id);
  }

  refreshPreferences();
  refreshActivity();

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
      renderHomeIntroWidget(),
      renderHomePanelLabelWidget(state.user, state.preferences, accessibleMiniApps),
      renderRecentMiniAppsWidget(state.user, accessibleMiniApps, state.activity),
      renderFavoriteMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
      renderSavedMiniAppsWidget(state.user, accessibleMiniApps, state.preferences),
    );

    if (viewRoot.firstChild !== layout) {
      viewRoot.replaceChildren(layout);
    }
  }

  updateLayout();

  const unsubscribeSession = subscribeSession((user) => {
    state.user = user;
    refreshPreferences();
    refreshActivity();
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

  const unsubscribeActivity = subscribeMiniAppActivity((event) => {
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

    refreshActivity();
    updateLayout();
  });

  if (typeof unsubscribeActivity === 'function') {
    cleanupHandlers.push(unsubscribeActivity);
  }
}
