(function (window, document) {
  'use strict';

  const root = window.miniappBase || (window.miniappBase = {});
  const atoms = root.atoms || (root.atoms = {});
  const molecules = root.molecules || (root.molecules = {});

  const defaultMiniApp = './miniapp-catalogo/index.html';
  const panel = document.getElementById('miniapp-panel');
  const panelWrapper = document.querySelector('.panel-wrapper');
  const shellMainContainer = document.querySelector('.shell-main .shell-container');
  const appShell = document.querySelector('.app-shell');
  const bodyElement = document.body;
  const headerTitle = document.querySelector('[data-shell-app-title]');
  const headerSubtitle = document.querySelector('[data-shell-app-subtitle]');
  const headerLogo = document.querySelector('[data-shell-app-icon]');
  const menuToggle = document.getElementById('shell-menu-toggle');
  const menuSheet = document.getElementById('shell-menu-sheet');
  const menu = menuSheet ? menuSheet.querySelector('.shell-menu') : null;
  const menuClose = document.getElementById('shell-menu-close');
  const menuCloseLabel = menuClose ? menuClose.querySelector('[data-menu-close-label]') : null;
  const menuCatalogItem = menu ? menu.querySelector('[data-target="catalog"]') : null;
  const menuAboutItem = menu ? menu.querySelector('[data-target="about"]') : null;
  const menuFullscreenItem = menu ? menu.querySelector('[data-target="fullscreen"]') : null;
  const aboutSection = document.getElementById('shell-about');
  const aboutTitle = document.querySelector('[data-shell-about-title]');
  const aboutDescription = document.querySelector('[data-shell-about-description]');
  const aboutVersion = document.querySelector('[data-shell-about-version]');
  const localeButtons = Array.from(
    document.querySelectorAll('#shell-locale [data-locale], #shell-locale-menu [data-locale]')
  );
  const catalogUrl = new URL(defaultMiniApp, window.location.href);
  const catalogPath = catalogUrl.pathname.replace(/\/+$/, '');

  const SHELL_PRODUCT_NAME = 'MiniApp Base';
  const SHELL_VERSION = '0.2.0 (experimental)';
  const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];
  const DEFAULT_LOCALE = 'pt-BR';
  const LOCALE_STORAGE_KEY = 'miniapp-shell.locale';
  const DEFAULT_ICON_SYMBOL = 'apps';
  const DEFAULT_ICON_THEME = 'shell';
  const ICON_THEME_CLASS_PREFIX = 'shell-logo--theme-';

  const SHELL_HEADER_COPY = {
    'pt-BR': {
      title: SHELL_PRODUCT_NAME,
      subtitle: 'Catálogo de MiniApps · Projeto Marco',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: DEFAULT_ICON_THEME,
    },
    'en-US': {
      title: SHELL_PRODUCT_NAME,
      subtitle: 'MiniApp Catalog · Projeto Marco',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: DEFAULT_ICON_THEME,
    },
    'es-ES': {
      title: SHELL_PRODUCT_NAME,
      subtitle: 'Catálogo de MiniApps · Proyecto Marco',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: DEFAULT_ICON_THEME,
    },
  };

  const CATALOG_HEADER_COPY = {
    'pt-BR': {
      title: 'Catálogo de MiniApps',
      subtitle: 'Navegue pelas experiências disponíveis e escolha uma para abrir.',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: 'catalog',
    },
    'en-US': {
      title: 'MiniApps Catalog',
      subtitle: 'Browse the available experiences and choose one to open.',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: 'catalog',
    },
    'es-ES': {
      title: 'Catálogo de MiniApps',
      subtitle: 'Explora las experiencias disponibles y elige una para abrir.',
      icon: DEFAULT_ICON_SYMBOL,
      iconTheme: 'catalog',
    },
  };

  const FULLSCREEN_COPY = {
    'pt-BR': {
      enter: 'Modo tela cheia',
      exit: 'Sair do modo tela cheia',
    },
    'en-US': {
      enter: 'Enter fullscreen mode',
      exit: 'Exit fullscreen mode',
    },
    'es-ES': {
      enter: 'Activar pantalla completa',
      exit: 'Salir de pantalla completa',
    },
  };

  const MENU_COPY = {
    'pt-BR': {
      toggle: { open: 'Abrir menu', close: 'Fechar menu' },
      catalog: 'Catálogo de MiniApps',
      about: 'Sobre o Projeto Marco',
      close: 'Fechar',
    },
    'en-US': {
      toggle: { open: 'Open menu', close: 'Close menu' },
      catalog: 'MiniApps Catalog',
      about: 'About Projeto Marco',
      close: 'Close',
    },
    'es-ES': {
      toggle: { open: 'Abrir menú', close: 'Cerrar menú' },
      catalog: 'Catálogo de MiniApps',
      about: 'Acerca del Proyecto Marco',
      close: 'Cerrar',
    },
  };

  const ABOUT_COPY = {
    'pt-BR': {
      title: 'Sobre o Projeto Marco',
      description:
        'O MiniApp Base reúne os miniapps do Projeto Marco para demonstrações e testes rápidos.',
      version: 'Versão ' + SHELL_VERSION,
    },
    'en-US': {
      title: 'About Projeto Marco',
      description:
        'MiniApp Base brings together Projeto Marco miniapps for quick demos and testing.',
      version: 'Version ' + SHELL_VERSION,
    },
    'es-ES': {
      title: 'Acerca del Proyecto Marco',
      description:
        'MiniApp Base reúne los miniapps del Proyecto Marco para demostraciones y pruebas rápidas.',
      version: 'Versión ' + SHELL_VERSION,
    },
  };

  const safeGetItem = atoms.safeGetItem || function (key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  };

  const safeSetItem = atoms.safeSetItem || function (key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  };

  function normalizeLocaleCandidate(locale) {
    if (!locale || typeof locale !== 'string') {
      return null;
    }

    const trimmed = locale.trim();

    if (!trimmed) {
      return null;
    }

    if (typeof atoms.normalizeLocale === 'function') {
      const normalized = atoms.normalizeLocale(trimmed, SUPPORTED_LOCALES, DEFAULT_LOCALE);
      if (normalized && SUPPORTED_LOCALES.includes(normalized)) {
        return normalized;
      }
    }

    const exactMatch = SUPPORTED_LOCALES.find(
      (supportedLocale) => supportedLocale.toLowerCase() === trimmed.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    const base = trimmed.split('-')[0];

    return (
      SUPPORTED_LOCALES.find((supportedLocale) => supportedLocale.startsWith(base)) ||
      null
    );
  }

  function readStoredLocale() {
    const stored = safeGetItem(LOCALE_STORAGE_KEY);
    return typeof stored === 'string' ? stored : null;
  }

  function writeStoredLocale(locale) {
    safeSetItem(LOCALE_STORAGE_KEY, locale);
  }

  function initializeActiveLocale() {
    const storedLocale = normalizeLocaleCandidate(readStoredLocale());
    const documentLocale =
      (document.documentElement && document.documentElement.lang) || '';
    const normalizedDocumentLocale = normalizeLocaleCandidate(documentLocale);

    return storedLocale || normalizedDocumentLocale || DEFAULT_LOCALE;
  }

  const miniAppMetadata = new Map();
  let activeMiniAppUrl = null;
  let fullscreenFallbackActive = false;
  let activeLocale = initializeActiveLocale();
  let menuLastFocusedElement = null;

  if (document.documentElement) {
    document.documentElement.lang = activeLocale;
  }

  if (headerLogo) {
    headerLogo.classList.add('material-symbols-rounded');
    if (!headerLogo.textContent) {
      headerLogo.textContent = DEFAULT_ICON_SYMBOL;
    }
  }

  function getActiveLocale() {
    return activeLocale;
  }

  function getMenuCopy(locale) {
    const copy = MENU_COPY[locale];
    return copy || MENU_COPY[DEFAULT_LOCALE];
  }

  function getAboutCopy(locale) {
    const copy = ABOUT_COPY[locale];
    return copy || ABOUT_COPY[DEFAULT_LOCALE];
  }

  function updateLocaleButtonsState() {
    if (!localeButtons.length) {
      return;
    }

    const currentLocale = getActiveLocale();

    localeButtons.forEach((button) => {
      if (!button) {
        return;
      }

      const locale = button.dataset ? button.dataset.locale : null;
      const isActive = locale === currentLocale;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function isShellMenuOpen() {
    return Boolean(menuSheet && menuSheet.classList.contains('is-open'));
  }

  function syncMenuCopy() {
    const copy = getMenuCopy(getActiveLocale());
    const isOpen = isShellMenuOpen();

    if (menuCatalogItem) {
      const labelElement = menuCatalogItem.querySelector('[data-menu-item-label="catalog"]');
      if (labelElement && copy.catalog) {
        labelElement.textContent = copy.catalog;
      }
      menuCatalogItem.setAttribute('aria-label', copy.catalog);
      menuCatalogItem.setAttribute('title', copy.catalog);
    }

    if (menuAboutItem) {
      const labelElement = menuAboutItem.querySelector('[data-menu-item-label="about"]');
      if (labelElement && copy.about) {
        labelElement.textContent = copy.about;
      }
      menuAboutItem.setAttribute('aria-label', copy.about);
      menuAboutItem.setAttribute('title', copy.about);
    }

    if (menuClose && copy.close) {
      menuClose.setAttribute('aria-label', copy.close);
      menuClose.setAttribute('title', copy.close);
    }

    if (menuCloseLabel && copy.close) {
      menuCloseLabel.textContent = copy.close;
    }

    const toggleCopy = copy.toggle || MENU_COPY[DEFAULT_LOCALE].toggle;
    const stateCopy = isOpen ? toggleCopy.close : toggleCopy.open;

    if (menuToggle && stateCopy) {
      menuToggle.setAttribute('aria-label', stateCopy);
      menuToggle.setAttribute('title', stateCopy);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }

  function syncAboutSection() {
    const copy = getAboutCopy(getActiveLocale());

    if (aboutTitle && copy.title) {
      aboutTitle.textContent = copy.title;
    }

    if (aboutDescription && copy.description) {
      aboutDescription.textContent = copy.description;
    }

    if (aboutVersion && copy.version) {
      aboutVersion.textContent = copy.version;
    }
  }

  function focusFirstMenuItem() {
    if (!menu) {
      return;
    }

    const focusable = menu.querySelector(
      'button:not([disabled]):not([aria-disabled="true"])'
    );

    if (focusable && typeof focusable.focus === 'function') {
      requestAnimationFrame(() => {
        try {
          focusable.focus();
        } catch (_) {
          focusable.focus();
        }
      });
    }
  }

  function openShellMenu() {
    if (!menuSheet || isShellMenuOpen()) {
      return;
    }

    menuLastFocusedElement = document.activeElement || null;
    menuSheet.classList.add('is-open');
    syncMenuCopy();
    focusFirstMenuItem();
  }

  function closeShellMenu(options = {}) {
    if (!menuSheet || !isShellMenuOpen()) {
      return;
    }

    const { restoreFocus = false } = options;

    menuSheet.classList.remove('is-open');
    syncMenuCopy();

    if (restoreFocus && menuLastFocusedElement && typeof menuLastFocusedElement.focus === 'function') {
      requestAnimationFrame(() => {
        try {
          menuLastFocusedElement.focus();
        } catch (_) {
          menuLastFocusedElement.focus();
        }
      });
    }
  }

  function handleToggleMenu() {
    if (isShellMenuOpen()) {
      closeShellMenu({ restoreFocus: true });
    } else {
      openShellMenu();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', handleToggleMenu);
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuClose) {
    menuClose.addEventListener('click', () => {
      closeShellMenu({ restoreFocus: true });
    });
  }

  if (menuSheet) {
    menuSheet.addEventListener('click', (event) => {
      if (!menu || menu.contains(event.target)) {
        return;
      }

      closeShellMenu({ restoreFocus: true });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (isShellMenuOpen()) {
        event.preventDefault();
        closeShellMenu({ restoreFocus: true });
        return;
      }

      if (fullscreenFallbackActive) {
        event.preventDefault();
        deactivateFullscreenFallback();
      }
    }
  });

  if (localeButtons.length) {
    localeButtons.forEach((button) => {
      if (!button) {
        return;
      }

      button.addEventListener('click', () => {
        const locale = button.dataset ? button.dataset.locale : null;
        if (locale) {
          setLocale(locale);
        }
      });
    });
  }

  if (menuCatalogItem) {
    menuCatalogItem.addEventListener('click', () => {
      if (menuCatalogItem.disabled) {
        return;
      }

      loadMiniApp(defaultMiniApp, {
        metadata: getCatalogHeaderCopy(),
      });

      closeShellMenu({ restoreFocus: true });
    });
  }

  if (menuAboutItem) {
    menuAboutItem.addEventListener('click', () => {
      closeShellMenu({ restoreFocus: true });

      if (aboutSection && typeof aboutSection.scrollIntoView === 'function') {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function setFullscreenMenuState(label, fullscreen) {
    if (!menuFullscreenItem) {
      return;
    }

    menuFullscreenItem.setAttribute('aria-pressed', fullscreen ? 'true' : 'false');
    menuFullscreenItem.setAttribute('aria-label', label);
    menuFullscreenItem.setAttribute('title', label);

    const labelElement = menuFullscreenItem.querySelector('[data-menu-item-label="fullscreen"]');
    if (labelElement) {
      labelElement.textContent = label;
    }

    const iconElement = menuFullscreenItem.querySelector('.material-symbols-rounded');
    if (iconElement) {
      iconElement.textContent = fullscreen ? 'close_fullscreen' : 'open_in_full';
    }
  }

  if (menuFullscreenItem) {
    menuFullscreenItem.addEventListener('click', () => {
      if (isFullscreenActive()) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }

      closeShellMenu({ restoreFocus: true });
    });
  }

  function getDefaultHeaderCopy() {
    const locale = getActiveLocale();
    const copy = SHELL_HEADER_COPY[locale] || SHELL_HEADER_COPY[DEFAULT_LOCALE];
    return { ...copy };
  }

  function getCatalogHeaderCopy() {
    const locale = getActiveLocale();
    const copy = CATALOG_HEADER_COPY[locale] || CATALOG_HEADER_COPY[DEFAULT_LOCALE];
    return { ...copy };
  }

  function sanitizeMetadata(metadata = {}) {
    if (!metadata || typeof metadata !== 'object') {
      return {};
    }

    const sanitized = {};

    if (typeof metadata.title === 'string') {
      const trimmedTitle = metadata.title.trim();
      if (trimmedTitle) {
        sanitized.title = trimmedTitle;
      }
    }

    if (typeof metadata.subtitle === 'string') {
      const trimmedSubtitle = metadata.subtitle.trim();
      if (trimmedSubtitle) {
        sanitized.subtitle = trimmedSubtitle;
      }
    }

    if (typeof metadata.icon === 'string') {
      const trimmedIcon = metadata.icon.trim();
      if (trimmedIcon) {
        sanitized.icon = trimmedIcon;
      }
    }

    if (typeof metadata.iconTheme === 'string') {
      const trimmedTheme = metadata.iconTheme.trim();
      if (trimmedTheme) {
        sanitized.iconTheme = trimmedTheme;
      }
    }

    return sanitized;
  }

  function updateHeaderIcon(iconSymbol, themeKey) {
    if (!headerLogo) {
      return;
    }

    const symbol =
      typeof iconSymbol === 'string' && iconSymbol.trim()
        ? iconSymbol.trim()
        : DEFAULT_ICON_SYMBOL;
    const normalizedTheme =
      typeof themeKey === 'string' && themeKey.trim()
        ? themeKey.trim()
        : DEFAULT_ICON_THEME;
    const previousTheme = headerLogo.dataset ? headerLogo.dataset.iconTheme : null;

    headerLogo.textContent = symbol;

    if (previousTheme && previousTheme !== normalizedTheme) {
      headerLogo.classList.remove(`${ICON_THEME_CLASS_PREFIX}${previousTheme}`);
    }

    if (!headerLogo.classList.contains(`${ICON_THEME_CLASS_PREFIX}${normalizedTheme}`)) {
      headerLogo.classList.add(`${ICON_THEME_CLASS_PREFIX}${normalizedTheme}`);
    }

    if (headerLogo.dataset) {
      headerLogo.dataset.iconTheme = normalizedTheme;
    }
  }

  function setHeaderContent(metadata) {
    const fallback = getDefaultHeaderCopy();
    const title = metadata && metadata.title ? metadata.title : fallback.title;
    const subtitle = metadata && metadata.subtitle ? metadata.subtitle : fallback.subtitle;
    const fallbackIcon = fallback && fallback.icon ? fallback.icon : DEFAULT_ICON_SYMBOL;
    const fallbackTheme =
      fallback && fallback.iconTheme ? fallback.iconTheme : DEFAULT_ICON_THEME;
    const icon = metadata && metadata.icon ? metadata.icon : fallbackIcon;
    const iconTheme = metadata && metadata.iconTheme ? metadata.iconTheme : fallbackTheme;

    if (headerTitle) {
      headerTitle.textContent = title;
    }

    if (headerSubtitle) {
      if (subtitle) {
        headerSubtitle.textContent = subtitle;
        headerSubtitle.hidden = false;
      } else {
        headerSubtitle.textContent = '';
        headerSubtitle.hidden = true;
      }
    }

    updateHeaderIcon(icon, iconTheme);
  }

  function normalizeMiniAppUrl(url) {
    try {
      const absolute = new URL(url, window.location.href);
      absolute.hash = '';
      absolute.search = '';
      return absolute.href.replace(/\/+$/, '');
    } catch (_) {
      return null;
    }
  }

  function getPanelLocationHref() {
    if (!panel) {
      return defaultMiniApp;
    }

    try {
      const { contentWindow } = panel;

      if (contentWindow && contentWindow.location && contentWindow.location.href) {
        return contentWindow.location.href;
      }
    } catch (_) {
      // Ignorado: fallback para atributo src.
    }

    return panel.src || defaultMiniApp;
  }

  function storeMetadataForUrl(normalizedUrl, metadata) {
    if (!normalizedUrl) {
      return null;
    }

    const sanitized = sanitizeMetadata(metadata);
    const sanitizedKeys = Object.keys(sanitized);

    if (!sanitizedKeys.length) {
      return miniAppMetadata.get(normalizedUrl) || null;
    }

    const existing = miniAppMetadata.get(normalizedUrl) || {};
    const next = {
      title: Object.prototype.hasOwnProperty.call(sanitized, 'title')
        ? sanitized.title
        : existing.title,
      subtitle: Object.prototype.hasOwnProperty.call(sanitized, 'subtitle')
        ? sanitized.subtitle
        : existing.subtitle,
      icon: Object.prototype.hasOwnProperty.call(sanitized, 'icon')
        ? sanitized.icon
        : existing.icon,
      iconTheme: Object.prototype.hasOwnProperty.call(sanitized, 'iconTheme')
        ? sanitized.iconTheme
        : existing.iconTheme,
    };

    miniAppMetadata.set(normalizedUrl, next);
    return next;
  }

  function applyMiniAppMetadata(normalizedUrl) {
    const metadata = normalizedUrl ? miniAppMetadata.get(normalizedUrl) : null;
    setHeaderContent(metadata || null);
  }

  const normalizedCatalogUrl = normalizeMiniAppUrl(defaultMiniApp);

  if (normalizedCatalogUrl) {
    activeMiniAppUrl = normalizedCatalogUrl;
    storeMetadataForUrl(normalizedCatalogUrl, getCatalogHeaderCopy());
    applyMiniAppMetadata(activeMiniAppUrl);
  }

  function isCatalogUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return parsed.pathname.replace(/\/+$/, '') === catalogPath;
    } catch (_) {
      return false;
    }
  }

  function updateCatalogState(sourceUrl) {
    const effectiveUrl = sourceUrl || getPanelLocationHref();
    const isCatalog = isCatalogUrl(effectiveUrl);

    if (panelWrapper) {
      panelWrapper.classList.toggle('panel-wrapper--catalog', isCatalog);
    }

    if (shellMainContainer) {
      shellMainContainer.classList.toggle('shell-container--catalog', isCatalog);
    }

    if (appShell) {
      appShell.classList.toggle('is-catalog-open', isCatalog);
    }

    if (menuCatalogItem) {
      if (isCatalog) {
        menuCatalogItem.disabled = true;
        menuCatalogItem.setAttribute('disabled', '');
        menuCatalogItem.setAttribute('aria-disabled', 'true');
      } else {
        menuCatalogItem.disabled = false;
        menuCatalogItem.removeAttribute('disabled');
        menuCatalogItem.setAttribute('aria-disabled', 'false');
      }
    }
  }

  function postLocaleToTarget(targetWindow) {
    if (!targetWindow || typeof targetWindow.postMessage !== 'function') {
      return;
    }

    try {
      targetWindow.postMessage(
        { action: 'set-locale', locale: getActiveLocale() },
        window.location.origin
      );
    } catch (_) {
      // Ignorado: alvo indisponível.
    }
  }

  function broadcastLocaleToPanel() {
    if (!panel || !panel.contentWindow) {
      return;
    }

    postLocaleToTarget(panel.contentWindow);
  }

  function isFullscreenActive() {
    return (
      fullscreenFallbackActive ||
      document.fullscreenElement === appShell ||
      document.fullscreenElement === document.documentElement
    );
  }

  function syncFullscreenState() {
    const fullscreen = isFullscreenActive();
    const locale = getActiveLocale();
    const fullscreenCopy = FULLSCREEN_COPY[locale] || FULLSCREEN_COPY[DEFAULT_LOCALE];
    const label = fullscreen ? fullscreenCopy.exit : fullscreenCopy.enter;
    const fallbackActive = fullscreenFallbackActive;

    if (appShell) {
      appShell.classList.toggle('is-fullscreen', fullscreen);
      appShell.classList.toggle('is-fullscreen-fallback', fallbackActive);
    }

    if (document.documentElement) {
      document.documentElement.classList.toggle('is-fullscreen-fallback', fallbackActive);
    }

    if (bodyElement) {
      bodyElement.classList.toggle('is-fullscreen-fallback', fallbackActive);
    }

    setFullscreenMenuState(label, fullscreen);
  }

  function activateFullscreenFallback() {
    if (!fullscreenFallbackActive) {
      fullscreenFallbackActive = true;
    }

    syncFullscreenState();
    return true;
  }

  function deactivateFullscreenFallback() {
    if (!fullscreenFallbackActive) {
      syncFullscreenState();
      return;
    }

    fullscreenFallbackActive = false;
    syncFullscreenState();
  }

  async function enterFullscreen() {
    if (!appShell || isFullscreenActive()) {
      return;
    }

    let fallbackActivated = false;

    try {
      if (document.fullscreenElement === appShell) {
        return;
      }

      if (appShell.requestFullscreen) {
        try {
          await appShell.requestFullscreen({ navigationUI: 'hide' });
        } catch (requestError) {
          if (requestError && requestError.name === 'TypeError') {
            await appShell.requestFullscreen();
          } else {
            throw requestError;
          }
        }
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        fallbackActivated = activateFullscreenFallback();
      }
    } catch (error) {
      console.error('Não foi possível ativar a tela cheia nativa.', error);
      fallbackActivated = activateFullscreenFallback();
    } finally {
      if (!fallbackActivated) {
        syncFullscreenState();
      }
    }
  }

  async function exitFullscreen() {
    if (fullscreenFallbackActive && (!document.fullscreenElement || !document.exitFullscreen)) {
      deactivateFullscreenFallback();
      return;
    }

    if (!document.fullscreenElement || !document.exitFullscreen) {
      if (fullscreenFallbackActive) {
        deactivateFullscreenFallback();
      } else {
        syncFullscreenState();
      }
      return;
    }

    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Não foi possível sair da tela cheia nativa.', error);
      deactivateFullscreenFallback();
    } finally {
      syncFullscreenState();
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenFallbackActive = false;
    }

    syncFullscreenState();
  });

  document.addEventListener('fullscreenerror', () => {
    activateFullscreenFallback();
  });

  function setLocale(nextLocale, options = {}) {
    const { broadcast = true } = options;
    const normalized = normalizeLocaleCandidate(nextLocale) || DEFAULT_LOCALE;

    if (normalized === activeLocale) {
      updateLocaleButtonsState();
      syncMenuCopy();
      syncAboutSection();
      syncFullscreenState();
      return activeLocale;
    }

    activeLocale = normalized;

    if (document.documentElement) {
      document.documentElement.lang = activeLocale;
    }

    writeStoredLocale(activeLocale);
    updateLocaleButtonsState();
    syncMenuCopy();
    syncAboutSection();

    const normalizedCatalogForLocale = normalizeMiniAppUrl(defaultMiniApp);

    if (normalizedCatalogForLocale) {
      storeMetadataForUrl(normalizedCatalogForLocale, getCatalogHeaderCopy());
    }

    applyMiniAppMetadata(activeMiniAppUrl);
    updateCatalogState(getPanelLocationHref());
    syncFullscreenState();

    if (broadcast) {
      broadcastLocaleToPanel();
    }

    return activeLocale;
  }

  function loadMiniApp(url, options = {}) {
    if (!panel) {
      return;
    }

    const targetUrl = typeof url === 'string' && url.trim() ? url : defaultMiniApp;
    const normalizedTarget = normalizeMiniAppUrl(targetUrl);
    const normalizedPanelLocation = normalizeMiniAppUrl(getPanelLocationHref());

    if (options && typeof options.metadata === 'object' && normalizedTarget) {
      storeMetadataForUrl(normalizedTarget, options.metadata);
    }

    activeMiniAppUrl = normalizedTarget;
    applyMiniAppMetadata(activeMiniAppUrl);

    if (!normalizedTarget || normalizedPanelLocation !== normalizedTarget) {
      panel.src = targetUrl;
    }

    updateCatalogState(targetUrl);
    broadcastLocaleToPanel();

    if (options.focus !== false && typeof panel.focus === 'function') {
      requestAnimationFrame(() => {
        try {
          panel.focus({ preventScroll: true });
        } catch (_) {
          panel.focus();
        }
      });
    }
  }

  window.loadMiniApp = loadMiniApp;

  document.querySelectorAll('[data-miniapp-target]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const targetUrl = trigger.getAttribute('data-miniapp-target');
      const metadata = {
        title: trigger.getAttribute('data-miniapp-name'),
        subtitle: trigger.getAttribute('data-miniapp-description'),
        icon: trigger.getAttribute('data-miniapp-icon-symbol'),
        iconTheme: trigger.getAttribute('data-miniapp-icon-theme'),
      };

      loadMiniApp(targetUrl, { metadata });
    });
  });

  if (panel) {
    panel.addEventListener('load', () => {
      const panelHref = getPanelLocationHref();
      const normalizedPanelHref = normalizeMiniAppUrl(panelHref);

      if (normalizedPanelHref) {
        activeMiniAppUrl = normalizedPanelHref;
      }

      updateCatalogState(panelHref);
      applyMiniAppMetadata(activeMiniAppUrl);
      broadcastLocaleToPanel();
    });
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { data } = event;

    broadcastLocaleToPanel();

    if (typeof data === 'string') {
      if (data === 'open-catalog') {
        loadMiniApp(defaultMiniApp, {
          metadata: getCatalogHeaderCopy(),
        });
      } else {
        loadMiniApp(data);
      }
      return;
    }

    if (data && typeof data === 'object') {
      if (data.action === 'request-locale') {
        if (panel && event.source === panel.contentWindow) {
          postLocaleToTarget(event.source);
        }

        return;
      }

      if (typeof data.miniAppUrl === 'string') {
        loadMiniApp(data.miniAppUrl);
        return;
      }

      if (typeof data.url === 'string' && data.action === 'load-miniapp') {
        loadMiniApp(data.url);
        return;
      }

      if (data.action === 'miniapp-header') {
        if (!panel || event.source !== panel.contentWindow) {
          return;
        }

        const panelHref = getPanelLocationHref();
        const normalizedSource = activeMiniAppUrl || normalizeMiniAppUrl(panelHref);

        if (!normalizedSource) {
          return;
        }

        if (!activeMiniAppUrl) {
          activeMiniAppUrl = normalizedSource;
        }

        const stored = storeMetadataForUrl(normalizedSource, data);

        if (stored && normalizedSource === activeMiniAppUrl) {
          setHeaderContent(stored);
        }

        return;
      }

      if (data.action === 'open-catalog') {
        loadMiniApp(defaultMiniApp, {
          metadata: getCatalogHeaderCopy(),
        });
      }
    }
  });

  const initialLocale = getActiveLocale();
  updateLocaleButtonsState();
  syncMenuCopy();
  syncAboutSection();
  syncFullscreenState();

  setLocale(initialLocale, { broadcast: false });
  loadMiniApp(panel ? panel.getAttribute('src') : defaultMiniApp, {
    focus: false,
    metadata: getCatalogHeaderCopy(),
  });
})(window, document);
