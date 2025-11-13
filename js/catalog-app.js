import { DEFAULT_LOCALE, getCatalogMessages, getDirection } from './i18n.js';

const STATIC_CATALOG_ITEMS = Object.freeze([
  {
    id: 'app_catalog',
    name: 'Catálogo de MiniApps',
    description: 'Você está aqui! Interface de navegação entre MiniApps.',
    url: 'about:blank',
    icon_url: 'https://placehold.co/48x48/059669/ffffff?text=C',
    category: 'Sistema',
    category_key: 'system',
    status: 'Essencial',
    status_key: 'essential',
    translations: {
      'en-US': {
        name: 'MiniApps Catalog',
        description: 'You are here! Navigation interface between MiniApps.',
        category: 'System',
        status: 'Essential',
      },
    },
  },
]);

const ROLE_PRIORITY = {
  admin: 3,
  operador: 2,
  leitor: 1,
};

const ROLE_ALIASES = {
  administrador: 'admin',
  administrator: 'admin',
  admin: 'admin',
  operator: 'operador',
  operador: 'operador',
  operadora: 'operador',
  reader: 'leitor',
  leitor: 'leitor',
  leitura: 'leitor',
  viewer: 'leitor',
};

const STATUS_CLASS_MAP = {
  essential: 'catalog-card__badge--essential',
  available: 'catalog-card__badge--available',
  beta: 'catalog-card__badge--beta',
  maintenance: 'catalog-card__badge--maintenance',
  deprecated: 'catalog-card__badge--deprecated',
};

const DEFAULT_STATUS_CLASS = 'catalog-card__badge--default';
const LOCAL_STORAGE_KEY = 'miniapp-catalog.admin.activeItems';

function formatTemplate(template, context = {}) {
  if (typeof template !== 'string') {
    return '';
  }
  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const trimmed = rawKey.trim();
    return Object.prototype.hasOwnProperty.call(context, trimmed) ? context[trimmed] : '';
  });
}

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return '';
  }
  const normalized = role.trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(ROLE_PRIORITY, normalized)) {
    return normalized;
  }
  return ROLE_ALIASES[normalized] || '';
}

function roleSatisfies(requiredRole, userRole, guardsDisabled = false) {
  if (guardsDisabled) {
    return true;
  }
  if (!requiredRole) {
    return true;
  }
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : String(requiredRole).split(',');
  const normalizedUser = normalizeRole(userRole);
  if (!normalizedUser) {
    return false;
  }
  const userRank = ROLE_PRIORITY[normalizedUser] || 0;
  return requiredRoles.some((role) => {
    const normalizedRequired = normalizeRole(role);
    if (!normalizedRequired) {
      return true;
    }
    return userRank >= (ROLE_PRIORITY[normalizedRequired] || 0);
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function slugifyKey(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || ''
  );
}

function normalizeTranslations(raw) {
  if (typeof raw !== 'object' || raw === null) {
    return {};
  }
  const sanitized = {};
  Object.entries(raw).forEach(([locale, fields]) => {
    if (typeof fields !== 'object' || fields === null) {
      return;
    }
    const normalizedFields = {};
    ['name', 'description', 'category', 'status'].forEach((field) => {
      if (typeof fields[field] === 'string' && fields[field].trim()) {
        normalizedFields[field] = fields[field].trim();
      }
    });
    if (Object.keys(normalizedFields).length > 0) {
      sanitized[locale] = normalizedFields;
    }
  });
  return sanitized;
}

function getLocalizedCatalogEntry(appItem, locale, messages) {
  const base = {
    name: typeof appItem.name === 'string' ? appItem.name : '',
    description: typeof appItem.description === 'string' ? appItem.description : '',
    category: typeof appItem.category === 'string' ? appItem.category : '',
    status: typeof appItem.status === 'string' ? appItem.status : '',
  };

  if (typeof appItem.translations === 'object' && appItem.translations !== null) {
    const localized = appItem.translations[locale];
    if (typeof localized === 'object' && localized !== null) {
      ['name', 'description', 'category', 'status'].forEach((field) => {
        if (typeof localized[field] === 'string' && localized[field].trim()) {
          base[field] = localized[field].trim();
        }
      });
    }
  }

  if ((!base.status || !base.status.trim()) && appItem.statusKey && messages?.card?.statusByKey) {
    const fallbackStatus = messages.card.statusByKey[appItem.statusKey];
    if (typeof fallbackStatus === 'string' && fallbackStatus.trim()) {
      base.status = fallbackStatus.trim();
    }
  }

  return base;
}

function getStatusClass(statusKey) {
  if (typeof statusKey !== 'string' || !statusKey.trim()) {
    return DEFAULT_STATUS_CLASS;
  }
  return STATUS_CLASS_MAP[statusKey.trim()] || DEFAULT_STATUS_CLASS;
}

function mergeCatalogEntries(primary = [], extras = []) {
  const merged = new Map();

  const push = (item, prefix) => {
    if (!item) {
      return;
    }
    const rawKey =
      (typeof item.id === 'string' && item.id.trim()) ||
      (typeof item.url === 'string' && item.url.trim()) ||
      null;
    const key = rawKey || `${prefix}-${merged.size}`;
    if (merged.has(key)) {
      merged.set(key, { ...merged.get(key), ...item });
    } else {
      merged.set(key, item);
    }
  };

  primary.forEach((item) => push(item, 'catalog'));
  extras.forEach((item) => push(item, 'local'));
  return Array.from(merged.values());
}

function loadLocalCatalogItems() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items
      .map((item, index) => normalizeCatalogItem(item, index + 1000))
      .filter(Boolean);
  } catch (error) {
    console.warn('Não foi possível carregar itens locais do catálogo.', error);
    return [];
  }
}

function normalizeCatalogItem(item, index = 0) {
  if (typeof item !== 'object' || item === null) {
    return null;
  }

  const fallbackId = `miniapp_${index + 1}`;
  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : fallbackId;
  const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : `MiniApp ${index + 1}`;
  const description = typeof item.description === 'string' ? item.description : '';
  const category = typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'Geral';
  const status = typeof item.status === 'string' && item.status.trim() ? item.status.trim() : 'Disponível';
  const icon_url = typeof item.icon_url === 'string' && item.icon_url.trim() ? item.icon_url.trim() : null;
  const url = typeof item.url === 'string' && item.url.trim() ? item.url.trim() : null;
  const downloadUrlCandidate = (() => {
    if (typeof item.download_url === 'string' && item.download_url.trim()) {
      return item.download_url.trim();
    }
    if (typeof item.downloadUrl === 'string' && item.downloadUrl.trim()) {
      return item.downloadUrl.trim();
    }
    if (typeof item.package_url === 'string' && item.package_url.trim()) {
      return item.package_url.trim();
    }
    if (typeof item.packageUrl === 'string' && item.packageUrl.trim()) {
      return item.packageUrl.trim();
    }
    return '';
  })();
  const downloadUrl = downloadUrlCandidate || null;
  const categoryKey =
    (typeof item.category_key === 'string' && item.category_key.trim()) || slugifyKey(category);
  const statusKey = (typeof item.status_key === 'string' && item.status_key.trim()) || slugifyKey(status);
  const requiredRole =
    (typeof item.required_role === 'string' && item.required_role.trim().toLowerCase()) || '';
  const translations = normalizeTranslations(item.translations);

  if (!url) {
    return null;
  }

  return {
    id,
    name,
    description,
    category,
    status,
    icon_url,
    url,
    downloadUrl,
    categoryKey,
    statusKey,
    requiredRole,
    translations,
  };
}

function createCatalogCard(appItem, { locale, messages, userRole, guardsDisabled }) {
  const iconUrl = appItem.icon_url || 'https://placehold.co/48x48/cccccc/666666?text=APP';
  const localized = getLocalizedCatalogEntry(appItem, locale, messages);
  const statusClass = getStatusClass(appItem.statusKey);
  const requiredRoleAttr = appItem.requiredRole ? ` data-required-role="${escapeHtml(appItem.requiredRole)}"` : '';
  const safeName = escapeHtml(localized.name || 'MiniApp');
  const safeCategory = escapeHtml(localized.category || appItem.category || 'Geral');
  const safeDescription = escapeHtml(localized.description || appItem.description || '');
  const safeStatus = escapeHtml(localized.status || appItem.status || 'Desconhecido');
  const safeUrl = escapeHtml(appItem.url || '#');
  const downloadAttr = appItem.downloadUrl ? ` data-download-url="${escapeHtml(appItem.downloadUrl)}"` : '';
  const openLabel = escapeHtml(messages.card.open);
  const allowed = roleSatisfies(appItem.requiredRole, userRole, guardsDisabled);

  return `
    <article class="catalog-card" data-catalog-card${requiredRoleAttr} ${allowed ? '' : 'hidden'}>
      <header class="catalog-card__header">
        <img src="${iconUrl}" alt="" class="catalog-card__icon" onerror="this.onerror=null; this.src='https://placehold.co/48x48/cccccc/666666?text=APP';" />
        <div class="catalog-card__title">
          <h4>${safeName}</h4>
          <p class="catalog-card__category">${safeCategory}</p>
        </div>
      </header>
      <p class="catalog-card__description">${safeDescription}</p>
      <footer class="catalog-card__footer">
        <span class="catalog-card__badge ${statusClass}">${safeStatus}</span>
        <a
          href="#"
          class="catalog-card__link"
          data-open-miniapp
          data-url="${safeUrl}"
          data-name="${safeName}"
          data-description="${safeDescription}"
          ${downloadAttr}
          ${appItem.requiredRole ? `data-required-role="${escapeHtml(appItem.requiredRole)}"` : ''}
        >
          <span data-open-label-text>${openLabel}</span>
        </a>
      </footer>
    </article>
  `;
}

export function createCatalogApp(root) {
  if (!root) {
    throw new Error('O contêiner do catálogo é obrigatório.');
  }

  const statusMessage = root.querySelector('[data-catalog-status]');
  const catalogList = root.querySelector('[data-catalog-list]');
  const searchBar = root.querySelector('[data-catalog-search]');
  const categoryFilter = root.querySelector('[data-catalog-filter]');
  const catalogTitleEl = root.querySelector('[data-catalog-title]');
  const catalogSubtitleEl = root.querySelector('[data-catalog-subtitle]');

  let currentLocale = DEFAULT_LOCALE;
  let catalogMessages = getCatalogMessages(currentLocale);
  let fullCatalogData = [];
  let currentStatusKey = null;
  let currentStatusContext = {};
  let currentStatusFallback = '';
  let currentStatusExtras = null;
  let currentUserRole = null;
  let authGuardsDisabled = false;
  let currentTheme = 'light';

  const filterOptions = {
    searchText: '',
    category: '',
  };

  const events = new EventTarget();

  function emit(action, detail) {
    events.dispatchEvent(new CustomEvent(action, { detail }));
  }

  function showStatus(key, fallback = '', type = 'info', context = {}) {
    if (!statusMessage) return;
    const resolvedMessage = key ? translateStatus(key, fallback, context) : fallback;
    statusMessage.textContent = resolvedMessage;
    statusMessage.dataset.tone = type;
    currentStatusKey = key;
    currentStatusContext = key ? { ...context } : {};
    currentStatusFallback = typeof fallback === 'string' ? fallback : '';
    currentStatusExtras = null;
  }

  function translateStatus(key, fallback = '', context = {}) {
    if (!key) {
      return typeof fallback === 'string' ? fallback : '';
    }
    const template = catalogMessages?.status?.[key];
    if (typeof template === 'string') {
      return formatTemplate(template, context);
    }
    return typeof fallback === 'string' ? fallback : '';
  }

  function renderLoadingState(force = false) {
    if (!catalogList) return;
    if (!force && catalogList.dataset.renderState !== 'loading') {
      return;
    }
    catalogList.dataset.renderState = 'loading';
    const loadingMessage = escapeHtml(catalogMessages.status.loading);
    catalogList.innerHTML = `
      <div class="catalog-loading">
        <span class="catalog-loading__spinner" aria-hidden="true"></span>
        <span>${loadingMessage}</span>
      </div>`;
  }

  function populateFilters(data) {
    if (!categoryFilter) return;
    const categories = new Map();
    data.forEach((app) => {
      if (!app || !app.categoryKey) {
        return;
      }
      if (!categories.has(app.categoryKey)) {
        const localized = getLocalizedCatalogEntry(app, currentLocale, catalogMessages);
        const label = localized.category || app.category || app.categoryKey;
        categories.set(app.categoryKey, label);
      }
    });
    const defaultOptionLabel = escapeHtml(catalogMessages.filterDefault);
    categoryFilter.innerHTML = `<option value="" data-default-option>${defaultOptionLabel}</option>`;
    const sortedCategories = [...categories.entries()].sort((a, b) => {
      const labelA = (a[1] || '').toString();
      const labelB = (b[1] || '').toString();
      return labelA.localeCompare(labelB, currentLocale);
    });
    sortedCategories.forEach(([key, label]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = label;
      categoryFilter.appendChild(option);
    });
    if (filterOptions.category && !categories.has(filterOptions.category)) {
      filterOptions.category = '';
    }
    categoryFilter.value = filterOptions.category;
  }

  function refreshCatalogCardLabels() {
    if (!catalogList) return;
    const labelNodes = catalogList.querySelectorAll('[data-open-label-text]');
    labelNodes.forEach((node) => {
      node.textContent = catalogMessages.card.open;
    });
  }

  function attachMiniAppOpenHandlers() {
    if (!catalogList) return;
    const triggers = catalogList.querySelectorAll('[data-open-miniapp]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const { url, name, description, downloadUrl } = trigger.dataset;
        const requiredRole =
          trigger.dataset.requiredRole || trigger.closest('[data-required-role]')?.dataset.requiredRole || '';
        if (!url) return;
        if (requiredRole && !roleSatisfies(requiredRole, currentUserRole, authGuardsDisabled)) {
          const roleLabel = formatRoleLabel(requiredRole);
          showStatus(null, `Acesso negado. Papel ${roleLabel} obrigatório.`, 'error');
          emit('miniapp-access-denied', { requiredRole });
          return;
        }
        const metadata = {
          title: name || undefined,
          subtitle: description || undefined,
        };
        if (downloadUrl) {
          metadata.downloadUrl = downloadUrl;
        }
        emit('load-miniapp', { url, metadata, requiredRole });
      });
    });
  }

  function applyRoleVisibility() {
    if (!catalogList) return;
    const cards = catalogList.querySelectorAll('[data-catalog-card]');
    cards.forEach((card) => {
      const requiredRole = card.getAttribute('data-required-role');
      const allowed = roleSatisfies(requiredRole, currentUserRole, authGuardsDisabled);
      card.hidden = !allowed;
      if (!allowed) {
        card.setAttribute('data-role-denied', 'true');
      } else {
        card.removeAttribute('data-role-denied');
      }
    });
  }

  function applyFiltersAndRender() {
    if (!catalogList) return;

    if (!Array.isArray(fullCatalogData) || fullCatalogData.length === 0) {
      catalogList.dataset.renderState = 'empty';
      catalogList.innerHTML = `<p class="catalog-empty">${escapeHtml(catalogMessages.status.empty)}</p>`;
      return;
    }

    const searchText = filterOptions.searchText.toLocaleLowerCase(currentLocale);
    const selectedCategory = filterOptions.category;

    const filteredData = fullCatalogData.filter((app, index) => {
      const matchesCategory = !selectedCategory || app.categoryKey === selectedCategory;
      if (!matchesCategory) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      const localized = getLocalizedCatalogEntry(app, currentLocale, catalogMessages);
      const fallbackName = typeof app.name === 'string' && app.name.trim() ? app.name : `MiniApp ${index + 1}`;
      const tokens = [
        localized.name,
        localized.description,
        localized.category,
        typeof app.name === 'string' ? app.name : '',
        typeof app.description === 'string' ? app.description : '',
        typeof app.category === 'string' ? app.category : '',
        fallbackName,
      ];

      return tokens.some(
        (value) => typeof value === 'string' && value.toLocaleLowerCase(currentLocale).includes(searchText),
      );
    });

    if (filteredData.length === 0) {
      catalogList.dataset.renderState = 'empty';
      catalogList.innerHTML = `<p class="catalog-empty">${escapeHtml(catalogMessages.status.noMatches)}</p>`;
      return;
    }

    catalogList.dataset.renderState = 'ready';
    catalogList.innerHTML = filteredData
      .map((item) =>
        createCatalogCard(item, {
          locale: currentLocale,
          messages: catalogMessages,
          userRole: currentUserRole,
          guardsDisabled: authGuardsDisabled,
        }),
      )
      .join('');
    attachMiniAppOpenHandlers();
    refreshCatalogCardLabels();
    applyRoleVisibility();
  }

  function loadStaticCatalog() {
    showStatus('loading', catalogMessages.status.loading, 'info');
    renderLoadingState(true);

    const normalized = STATIC_CATALOG_ITEMS.map((item, index) => normalizeCatalogItem(item, index)).filter(Boolean);
    const localItems = loadLocalCatalogItems();
    fullCatalogData = mergeCatalogEntries(normalized, localItems);

    if (!fullCatalogData.length) {
      catalogList.dataset.renderState = 'empty';
      catalogList.innerHTML = `<p class="catalog-empty">${escapeHtml(catalogMessages.status.empty)}</p>`;
      showStatus('empty', catalogMessages.status.empty, 'info');
      return;
    }

    populateFilters(fullCatalogData);
    applyFiltersAndRender();

    const statusContext = { count: fullCatalogData.length };
    const catalogLoadedText = formatTemplate(catalogMessages.status.catalogLoaded, statusContext).trim();
    const fallback = catalogLoadedText || 'Catálogo carregado.';

    showStatus('catalogLoaded', fallback, 'success', statusContext);

    if (localItems.length) {
      const extrasContext = { count: localItems.length };
      const localFallbackExtra = formatTemplate(catalogMessages.status.localFallbackExtra, extrasContext).trim();
      if (localFallbackExtra) {
        const combinedMessage = `${statusMessage.textContent} ${localFallbackExtra}`.trim();
        statusMessage.textContent = combinedMessage;
        currentStatusFallback = combinedMessage;
        currentStatusExtras = {
          key: 'localFallbackExtra',
          fallback: localFallbackExtra,
          context: { ...extrasContext },
        };
      }
    }
  }

  function formatRoleLabel(role) {
    const normalized = normalizeRole(role);
    if (!normalized) {
      return 'adequado';
    }
    if (normalized === 'admin') {
      return 'administrador';
    }
    return normalized;
  }

  function applyLanguage(locale, { notify = true } = {}) {
    currentLocale = typeof locale === 'string' ? locale : DEFAULT_LOCALE;
    catalogMessages = getCatalogMessages(currentLocale);
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = getDirection(currentLocale);
    document.title = catalogMessages.documentTitle;

    if (catalogTitleEl) {
      catalogTitleEl.textContent = catalogMessages.headerTitle;
    }

    if (catalogSubtitleEl) {
      catalogSubtitleEl.textContent = catalogMessages.headerSubtitle;
    }

    if (searchBar) {
      searchBar.placeholder = catalogMessages.searchPlaceholder;
    }

    if (categoryFilter) {
      const defaultOption = categoryFilter.querySelector('[data-default-option]');
      if (defaultOption) {
        defaultOption.textContent = catalogMessages.filterDefault;
      }
    }

    if (currentStatusKey) {
      const baseMessage = translateStatus(currentStatusKey, currentStatusFallback, currentStatusContext);
      let combinedMessage = baseMessage;
      if (currentStatusExtras?.key) {
        const extraMessage = translateStatus(
          currentStatusExtras.key,
          currentStatusExtras.fallback,
          currentStatusExtras.context || {},
        );
        combinedMessage = `${baseMessage} ${extraMessage}`.trim();
      }
      statusMessage.textContent = combinedMessage;
      currentStatusFallback = combinedMessage;
    } else {
      statusMessage.textContent = currentStatusFallback || '';
    }

    populateFilters(fullCatalogData);
    applyFiltersAndRender();
    refreshCatalogCardLabels();

    if (notify) {
      emit('miniapp-language-applied', { locale: currentLocale });
    }
  }

  function applySession(session, { guardsDisabled = false } = {}) {
    authGuardsDisabled = Boolean(guardsDisabled);
    currentUserRole = session?.role || null;
    applyRoleVisibility();
    emit('miniapp-session-applied', { session, guardsDisabled: authGuardsDisabled });
  }

  function applyTheme(theme) {
    currentTheme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', currentTheme);
    emit('miniapp-theme-applied', { theme: currentTheme });
  }

  function notifyAccessDenied(requiredRole) {
    const label = formatRoleLabel(requiredRole);
    showStatus(null, `Acesso negado. Papel ${label} obrigatório.`, 'error');
  }

  function initialize() {
    if (searchBar) {
      searchBar.addEventListener('input', (event) => {
        filterOptions.searchText = event.target.value || '';
        applyFiltersAndRender();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (event) => {
        filterOptions.category = event.target.value || '';
        applyFiltersAndRender();
      });
    }

    applyLanguage(currentLocale, { notify: false });
    showStatus('initializing', catalogMessages.status.initializing, 'info');
    renderLoadingState(true);
    loadStaticCatalog();

    emit('miniapp-language-ready', { locale: currentLocale });
    emit('miniapp-session-ready', {});
    emit('miniapp-theme-ready', { theme: currentTheme });
  }

  initialize();

  return {
    events,
    setLanguage: applyLanguage,
    setSession: applySession,
    setTheme: applyTheme,
    notifyAccessDenied,
    refresh: () => {
      populateFilters(fullCatalogData);
      applyFiltersAndRender();
    },
    getState: () => ({
      locale: currentLocale,
      theme: currentTheme,
      userRole: currentUserRole,
      guardsDisabled: authGuardsDisabled,
    }),
  };
}

