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
      const headerIcon = document.querySelector('[data-shell-app-icon]');
      const fullscreenToggle = document.querySelector('[data-action="toggle-fullscreen"]');
      const catalogToggles = Array.from(document.querySelectorAll('[data-action="open-catalog"]'));
      const footerCommandToggle = document.querySelector('[data-action="toggle-footer-command"]');
      const footerCommandPanel = document.querySelector('[data-footer-command]');
      const footerCommandToggleLabel = document.querySelector('[data-footer-command-toggle-label]');
      const footerCommandTitle = document.querySelector('[data-footer-command-title]');
      const footerCommandActions = document.querySelector('[data-footer-command-actions]');
      const localeCommand = document.querySelector('[data-locale-command]');
      const localeToggle = document.querySelector('[data-action="toggle-locale"]');
      const localeToggleLabel = document.querySelector('[data-locale-toggle-label]');
      const localeMenu = document.querySelector('[data-locale-menu]');
      const localeMenuDescription = document.querySelector(
        '[data-locale-menu-description]'
      );
      const localeActions = Array.from(
        document.querySelectorAll('[data-locale-action]')
      );
      const fullscreenCommandLabel = document.querySelector('[data-fullscreen-command-label]');
      const footerAboutTitle = document.querySelector('[data-footer-about-title]');
      const footerAboutProduct = document.querySelector('[data-footer-about-product]');
      const footerAboutVersion = document.querySelector('[data-footer-about-version]');
      const catalogUrl = new URL(defaultMiniApp, window.location.href);
      const catalogPath = catalogUrl.pathname.replace(/\/+$/, '');
      const SHELL_PRODUCT_NAME = 'MiniApps Shell';
      const SHELL_VERSION = '0.2.0 (experimental)';
      const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];
      const DEFAULT_LOCALE = 'pt-BR';
      const LOCALE_STORAGE_KEY = 'miniapp-shell.locale';
      const DEFAULT_ICON_SYMBOL = 'apps';
      const DEFAULT_ICON_THEME = 'shell';
      const ICON_THEME_CLASS_PREFIX = 'app-icon--theme-';
      const CATALOG_BUTTON_COPY = {
        'pt-BR': {
          label: 'Catálogo',
        },
        'en-US': {
          label: 'Catalog',
        },
        'es-ES': {
          label: 'Catálogo',
        },
      };

      const SHELL_HEADER_COPY = {
        'pt-BR': {
          title: SHELL_PRODUCT_NAME,
          subtitle: 'Escolha um mini‑app no catálogo para iniciar.',
          icon: DEFAULT_ICON_SYMBOL,
          iconTheme: DEFAULT_ICON_THEME,
        },
        'en-US': {
          title: SHELL_PRODUCT_NAME,
          subtitle: 'Pick a miniapp from the catalog to get started.',
          icon: DEFAULT_ICON_SYMBOL,
          iconTheme: DEFAULT_ICON_THEME,
        },
        'es-ES': {
          title: SHELL_PRODUCT_NAME,
          subtitle: 'Elige un miniapp del catálogo para comenzar.',
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

      const FOOTER_COMMAND_COPY = {
        'pt-BR': {
          toggle: {
            expanded: {
              label: 'Fechar menu do shell',
              title: 'Fechar menu do shell',
            },
            collapsed: {
              label: 'Abrir menu do shell',
              title: 'Abrir menu do shell',
            },
          },
          toggleText: 'Menu',
          panelTitle: 'Menu do shell',
          actionsLabel: 'Ações rápidas do shell',
          localeCommand: {
            toggle: {
              label: 'Alterar idioma do shell',
              title: 'Alterar idioma do shell',
            },
            buttonLabel: 'Idioma',
            menuLabel: 'Selecione o idioma do shell',
            options: {
              'pt-BR': 'Português (Brasil)',
              'en-US': 'Inglês (EUA)',
              'es-ES': 'Espanhol (Espanha)',
            },
          },
        },
        'en-US': {
          toggle: {
            expanded: {
              label: 'Close shell menu',
              title: 'Close shell menu',
            },
            collapsed: {
              label: 'Open shell menu',
              title: 'Open shell menu',
            },
          },
          toggleText: 'Menu',
          panelTitle: 'Shell menu',
          actionsLabel: 'Shell quick actions',
          localeCommand: {
            toggle: {
              label: 'Change shell language',
              title: 'Change shell language',
            },
            buttonLabel: 'Language',
            menuLabel: 'Choose the shell language',
            options: {
              'pt-BR': 'Portuguese (Brazil)',
              'en-US': 'English (US)',
              'es-ES': 'Spanish (Spain)',
            },
          },
        },
        'es-ES': {
          toggle: {
            expanded: {
              label: 'Cerrar menú del shell',
              title: 'Cerrar menú del shell',
            },
            collapsed: {
              label: 'Abrir menú del shell',
              title: 'Abrir menú del shell',
            },
          },
          toggleText: 'Menú',
          panelTitle: 'Menú del shell',
          actionsLabel: 'Acciones rápidas del shell',
          localeCommand: {
            toggle: {
              label: 'Cambiar idioma del shell',
              title: 'Cambiar idioma del shell',
            },
            buttonLabel: 'Idioma',
            menuLabel: 'Elige el idioma del shell',
            options: {
              'pt-BR': 'Portugués (Brasil)',
              'en-US': 'Inglés (EE. UU.)',
              'es-ES': 'Español (España)',
            },
          },
        },
      };

      const FULLSCREEN_COPY = {
        'pt-BR': {
          enter: 'Tela cheia',
          exit: 'Sair da tela cheia',
        },
        'en-US': {
          enter: 'Enter fullscreen',
          exit: 'Exit fullscreen',
        },
        'es-ES': {
          enter: 'Pantalla completa',
          exit: 'Salir de pantalla completa',
        },
      };

      const FOOTER_ABOUT_COPY = {
        'pt-BR': {
          heading: 'Sobre o app',
          product: SHELL_PRODUCT_NAME,
          version: 'Versão ' + SHELL_VERSION,
        },
        'en-US': {
          heading: 'About the app',
          product: SHELL_PRODUCT_NAME,
          version: 'Version ' + SHELL_VERSION,
        },
        'es-ES': {
          heading: 'Acerca de la app',
          product: SHELL_PRODUCT_NAME,
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

      if (document.documentElement) {
        document.documentElement.lang = activeLocale;
      }

      function isFooterCommandOpen() {
        return Boolean(
          footerCommandPanel &&
            footerCommandPanel.classList.contains('footer-command__panel--open')
        );
      }

      function getFooterCommandCopy() {
        const locale = getActiveLocale();
        return FOOTER_COMMAND_COPY[locale] || FOOTER_COMMAND_COPY[DEFAULT_LOCALE];
      }

      function syncLocaleCommandCopy(localeCopy) {
        if (!localeCommand) {
          return;
        }

        const safeCopy =
          localeCopy || FOOTER_COMMAND_COPY[DEFAULT_LOCALE].localeCommand;
        const toggleCopy = safeCopy && safeCopy.toggle ? safeCopy.toggle : null;

        if (localeToggle && toggleCopy) {
          if (toggleCopy.label) {
            localeToggle.setAttribute('aria-label', toggleCopy.label);
          }

          if (toggleCopy.title) {
            localeToggle.setAttribute('title', toggleCopy.title);
          }
        }

        if (localeToggleLabel && safeCopy && safeCopy.buttonLabel) {
          localeToggleLabel.textContent = safeCopy.buttonLabel;
        }

        if (localeMenu && safeCopy && safeCopy.menuLabel) {
          localeMenu.setAttribute('aria-label', safeCopy.menuLabel);
        }

        if (localeMenuDescription && safeCopy && safeCopy.menuLabel) {
          localeMenuDescription.textContent = safeCopy.menuLabel;
        }

        if (safeCopy && safeCopy.options && localeActions.length > 0) {
          localeActions.forEach((action) => {
            if (!action) {
              return;
            }

            const optionLocale = action.dataset ? action.dataset.localeOption : null;
            const labelElement = action.querySelector('[data-locale-option-label]');

            if (labelElement && optionLocale && safeCopy.options[optionLocale]) {
              labelElement.textContent = safeCopy.options[optionLocale];
            }
          });
        }
      }

      function syncFooterCommandCopy() {
        const copy = getFooterCommandCopy();
        const isOpen = isFooterCommandOpen();
        const stateKey = isOpen ? 'expanded' : 'collapsed';
        const stateCopy = copy.toggle ? copy.toggle[stateKey] : null;

        if (footerCommandToggle) {
          footerCommandToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

          if (stateCopy && stateCopy.label) {
            footerCommandToggle.setAttribute('aria-label', stateCopy.label);
          }

          if (stateCopy && stateCopy.title) {
            footerCommandToggle.setAttribute('title', stateCopy.title);
          }
        }

        if (footerCommandToggleLabel && copy.toggleText) {
          footerCommandToggleLabel.textContent = copy.toggleText;
        }

        if (footerCommandTitle && copy.panelTitle) {
          footerCommandTitle.textContent = copy.panelTitle;
        }

        if (footerCommandActions && copy.actionsLabel) {
          footerCommandActions.setAttribute('aria-label', copy.actionsLabel);
        }

        syncLocaleCommandCopy(copy.localeCommand);
      }

      function syncLocaleActionsState() {
        if (!localeActions.length) {
          return;
        }

        const currentLocale = getActiveLocale();

        localeActions.forEach((action) => {
          if (!action) {
            return;
          }

          const optionLocale = action.dataset ? action.dataset.localeOption : null;
          const isActive = optionLocale === currentLocale;

          action.setAttribute('aria-checked', isActive ? 'true' : 'false');
          action.classList.toggle('footer-locale__action--active', isActive);
        });
      }

      function isLocaleMenuOpen() {
        return Boolean(localeMenu && !localeMenu.hasAttribute('hidden'));
      }

      function openLocaleMenu() {
        if (!localeMenu || !localeToggle) {
          return;
        }

        localeMenu.hidden = false;
        localeMenu.removeAttribute('hidden');
        localeMenu.classList.add('footer-command__panel--open');
        localeToggle.setAttribute('aria-expanded', 'true');

        const focusedAction =
          localeMenu.querySelector('[data-locale-action].footer-locale__action--active') ||
          localeMenu.querySelector('[data-locale-action]');

        if (focusedAction && typeof focusedAction.focus === 'function') {
          requestAnimationFrame(() => {
            focusedAction.focus();
          });
        }
      }

      function closeLocaleMenu(options = {}) {
        if (!localeMenu || !localeToggle) {
          return;
        }

        const { restoreFocus = false } = options;

        localeMenu.hidden = true;
        localeMenu.setAttribute('hidden', '');
        localeMenu.classList.remove('footer-command__panel--open');
        localeToggle.setAttribute('aria-expanded', 'false');

        if (restoreFocus && typeof localeToggle.focus === 'function') {
          localeToggle.focus();
        }
      }

      function openFooterCommandPanel() {
        if (!footerCommandPanel) {
          return;
        }

        footerCommandPanel.hidden = false;
        footerCommandPanel.removeAttribute('hidden');
        footerCommandPanel.classList.add('footer-command__panel--open');
        syncFooterCommandCopy();

        const firstAction = footerCommandPanel.querySelector('button:not([disabled])');
        if (firstAction && typeof firstAction.focus === 'function') {
          requestAnimationFrame(() => {
            firstAction.focus();
          });
        }
      }

      function closeFooterCommandPanel(options = {}) {
        if (!footerCommandPanel) {
          return;
        }

        const { restoreFocus = false } = options;

        closeLocaleMenu();
        footerCommandPanel.classList.remove('footer-command__panel--open');
        footerCommandPanel.hidden = true;
        footerCommandPanel.setAttribute('hidden', '');
        syncFooterCommandCopy();

        if (restoreFocus && footerCommandToggle && typeof footerCommandToggle.focus === 'function') {
          footerCommandToggle.focus();
        }
      }

      closeFooterCommandPanel();
      syncFooterCommandCopy();
      syncLocaleActionsState();
      syncFooterAboutSection();

      if (footerCommandToggle && footerCommandPanel) {
        footerCommandToggle.addEventListener('click', () => {
          if (isFooterCommandOpen()) {
            closeFooterCommandPanel();
          } else {
            openFooterCommandPanel();
          }
        });

        document.addEventListener('click', (event) => {
          if (!isFooterCommandOpen()) {
            return;
          }

          if (
            footerCommandPanel.contains(event.target) ||
            footerCommandToggle.contains(event.target)
          ) {
            return;
          }

          closeFooterCommandPanel();
        });

        document.addEventListener('keydown', (event) => {
          if (event.key !== 'Escape' || !isFooterCommandOpen()) {
            return;
          }

          event.preventDefault();
          closeFooterCommandPanel({ restoreFocus: true });
        });
      } else {
        syncFooterCommandCopy();
      }

      if (localeToggle && localeMenu) {
        localeToggle.addEventListener('click', () => {
          if (isLocaleMenuOpen()) {
            closeLocaleMenu({ restoreFocus: true });
          } else {
            openLocaleMenu();
          }
        });
      }

      if (localeMenu) {
        localeMenu.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && isLocaleMenuOpen()) {
            event.preventDefault();
            closeLocaleMenu({ restoreFocus: true });
          }
        });
      }

      if (localeActions.length > 0) {
        localeActions.forEach((action) => {
          if (!action) {
            return;
          }

          action.addEventListener('click', () => {
            const targetLocale = action.dataset ? action.dataset.localeOption : null;

            if (!targetLocale) {
              return;
            }

            setActiveLocale(targetLocale);
            closeLocaleMenu({ restoreFocus: false });
            closeFooterCommandPanel();
          });
        });
      }

      document.addEventListener('click', (event) => {
        if (!isLocaleMenuOpen()) {
          return;
        }

        if (localeCommand && localeCommand.contains(event.target)) {
          return;
        }

        closeLocaleMenu();
      });

      function getActiveLocale() {
        return activeLocale || DEFAULT_LOCALE;
      }

      function setActiveLocale(locale, { broadcast = true } = {}) {
        const normalizedLocale = normalizeLocaleCandidate(locale) || DEFAULT_LOCALE;

        if (normalizedLocale === activeLocale) {
          if (broadcast) {
            broadcastLocaleToPanel();
          }

          return;
        }

        activeLocale = normalizedLocale;

        if (document.documentElement) {
          document.documentElement.lang = activeLocale;
        }

        writeStoredLocale(activeLocale);
        syncFooterCommandCopy();
        syncLocaleActionsState();
        syncFooterAboutSection();
        const normalizedCatalogForLocale = normalizeMiniAppUrl(defaultMiniApp);

        if (normalizedCatalogForLocale) {
          storeMetadataForUrl(normalizedCatalogForLocale, getCatalogHeaderCopy());
        }

        applyCatalogToggleState(isCatalogUrl(getPanelLocationHref()));
        syncFullscreenState();
        applyMiniAppMetadata(activeMiniAppUrl);

        if (broadcast) {
          broadcastLocaleToPanel();
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

      function getFooterAboutCopy() {
        const locale = getActiveLocale();
        return FOOTER_ABOUT_COPY[locale] || FOOTER_ABOUT_COPY[DEFAULT_LOCALE];
      }

      function syncFooterAboutSection() {
        const copy = getFooterAboutCopy();

        if (!copy) {
          return;
        }

        if (footerAboutTitle) {
          footerAboutTitle.textContent = copy.heading;
        }

        if (footerAboutProduct) {
          footerAboutProduct.textContent = copy.product;
        }

        if (footerAboutVersion) {
          footerAboutVersion.textContent = copy.version;
        }

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
        if (!headerIcon) {
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
        const previousTheme = headerIcon.dataset.iconTheme;

        headerIcon.textContent = symbol;

        if (previousTheme && previousTheme !== normalizedTheme) {
          headerIcon.classList.remove(`${ICON_THEME_CLASS_PREFIX}${previousTheme}`);
        }

        if (!headerIcon.classList.contains(`${ICON_THEME_CLASS_PREFIX}${normalizedTheme}`)) {
          headerIcon.classList.add(`${ICON_THEME_CLASS_PREFIX}${normalizedTheme}`);
        }

        headerIcon.dataset.iconTheme = normalizedTheme;
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

      function applyCatalogToggleState(isCatalog) {
        if (!catalogToggles.length) {
          return;
        }

        const locale = getActiveLocale();
        const copy =
          CATALOG_BUTTON_COPY[locale] || CATALOG_BUTTON_COPY[DEFAULT_LOCALE];
        const label =
          (copy && copy.label) || CATALOG_BUTTON_COPY[DEFAULT_LOCALE].label;

        catalogToggles.forEach((toggle) => {
          toggle.disabled = Boolean(isCatalog);

          if (isCatalog) {
            toggle.setAttribute('disabled', '');
          } else {
            toggle.removeAttribute('disabled');
          }

          toggle.setAttribute('aria-disabled', isCatalog ? 'true' : 'false');
          toggle.setAttribute('aria-label', label);
          toggle.setAttribute('title', label);

          const labelElement = toggle.querySelector('[data-catalog-button-label]');

          if (labelElement) {
            labelElement.textContent = label;
          }
        });
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

        applyCatalogToggleState(isCatalog);
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
        const fullscreenCopy =
          FULLSCREEN_COPY[locale] || FULLSCREEN_COPY[DEFAULT_LOCALE];
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

        if (fullscreenToggle) {
          fullscreenToggle.setAttribute('aria-pressed', fullscreen ? 'true' : 'false');
          fullscreenToggle.setAttribute('aria-label', label);
          fullscreenToggle.setAttribute('title', label);
        }

        if (fullscreenCommandLabel) {
          fullscreenCommandLabel.textContent = label;
        }
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
        if (!appShell) {
          return;
        }

        if (isFullscreenActive()) {
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

      if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
          if (isFullscreenActive()) {
            exitFullscreen();
          } else {
            enterFullscreen();
          }

          closeFooterCommandPanel({ restoreFocus: true });
        });
      }

      if (catalogToggles.length > 0) {
        catalogToggles.forEach((toggle) => {
          toggle.addEventListener('click', () => {
            loadMiniApp(defaultMiniApp, {
              metadata: getCatalogHeaderCopy(),
            });

            closeFooterCommandPanel();
          });
        });
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

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && fullscreenFallbackActive) {
          event.preventDefault();
          deactivateFullscreenFallback();
        }
      });

      syncFullscreenState();

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

      loadMiniApp(panel ? panel.getAttribute('src') : defaultMiniApp, {
        focus: false,
        metadata: getCatalogHeaderCopy(),
      });
    })(window, document);
