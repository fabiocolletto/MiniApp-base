import eventBusDefault from '../events/event-bus.js';
import { registerServiceWorker as registerServiceWorkerDefault } from '../pwa/register-service-worker.js';
import { renderRegisterPanel as renderRegisterPanelDefault } from '../views/register.js';
import { renderAccountDashboard as renderAccountDashboardDefault } from '../views/account-dashboard.js';
import {
  subscribeUserPreferences as subscribeUserPreferencesDefault,
  getFontScaleLabel as getFontScaleLabelDefault,
  getCurrentPreferences as getCurrentPreferencesDefault,
  updateUserPreferences as updateUserPreferencesDefault,
} from '../preferences/user-preferences.js';
import loadMiniAppDefault from '../../shell/load-miniapp.js';
import {
  WHITE_LABEL_IDENTITY,
  resolveMiniAppContext,
} from './white-label-config.js';

const VIEW_CLEANUP_KEY = '__viewCleanup';

function resolveRuntime(input = {}) {
  if (input && typeof input === 'object' && input.document && !input.window) {
    return { ...input, window: input.window ?? input };
  }

  if (input && typeof input === 'object' && !input.window && input.defaultView) {
    return { document: input, window: input.defaultView };
  }

  if (input && typeof input === 'object') {
    return input;
  }

  return {};
}

function getDocument(runtime) {
  if (runtime.document) {
    return runtime.document;
  }

  if (runtime.window && runtime.window.document) {
    return runtime.window.document;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  return null;
}

function getWindow(runtime) {
  if (runtime.window) {
    return runtime.window;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  return null;
}

function focusWithoutScreenShift(doc, win, element) {
  const HTMLElementRef = doc?.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  if (!HTMLElementRef || !(element instanceof HTMLElementRef)) {
    return;
  }

  const scrollingElement = doc.scrollingElement;
  const previousScrollTop = scrollingElement ? scrollingElement.scrollTop : win?.scrollY ?? 0;
  const previousScrollLeft = scrollingElement ? scrollingElement.scrollLeft : win?.scrollX ?? 0;

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }

  const nextScrollTop = scrollingElement ? scrollingElement.scrollTop : win?.scrollY ?? 0;
  const nextScrollLeft = scrollingElement ? scrollingElement.scrollLeft : win?.scrollX ?? 0;

  if (nextScrollTop !== previousScrollTop || nextScrollLeft !== previousScrollLeft) {
    if (scrollingElement && typeof scrollingElement.scrollTo === 'function') {
      scrollingElement.scrollTo({ top: previousScrollTop, left: previousScrollLeft });
    } else if (win && typeof win.scrollTo === 'function') {
      win.scrollTo(previousScrollLeft, previousScrollTop);
    }
  }
}

function normalizeOptions(options) {
  const runtime = resolveRuntime(options);
  const doc = getDocument(runtime);
  const win = getWindow(runtime);
  const queueTask =
    typeof runtime.queueMicrotask === 'function'
      ? runtime.queueMicrotask
      : typeof queueMicrotask === 'function'
      ? queueMicrotask
      : (cb) => Promise.resolve().then(cb);

  return {
    doc,
    win,
    queueTask,
    eventBus: runtime.eventBus ?? eventBusDefault,
    registerServiceWorker: runtime.registerServiceWorker ?? registerServiceWorkerDefault,
    renderRegisterPanel: runtime.renderRegisterPanel ?? renderRegisterPanelDefault,
    renderAccountDashboard: runtime.renderAccountDashboard ?? renderAccountDashboardDefault,
    subscribeUserPreferences: runtime.subscribeUserPreferences ?? subscribeUserPreferencesDefault,
    getFontScaleLabel: runtime.getFontScaleLabel ?? getFontScaleLabelDefault,
    getCurrentPreferences: runtime.getCurrentPreferences ?? getCurrentPreferencesDefault,
    updateUserPreferences: runtime.updateUserPreferences ?? updateUserPreferencesDefault,
    fetch: runtime.fetch ?? win?.fetch ?? (typeof fetch === 'function' ? fetch : null),
    loadMiniApp: runtime.loadMiniApp ?? loadMiniAppDefault,
    URL: runtime.URL ?? win?.URL ?? (typeof URL !== 'undefined' ? URL : null),
  };
}

function ensureHtmlElement(doc, element) {
  const HTMLElementRef = doc?.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  return Boolean(HTMLElementRef) && element instanceof HTMLElementRef;
}

export function initAuthShell(options = {}) {
  const runtime = normalizeOptions(options);
  const { doc, win } = runtime;

  if (!doc) {
    throw new Error('initAuthShell requer um objeto document.');
  }

  const HTMLElementRef = doc.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  const KeyboardEventRef = doc.defaultView?.KeyboardEvent ?? (typeof KeyboardEvent !== 'undefined' ? KeyboardEvent : null);
  const NodeRef = doc.defaultView?.Node ?? (typeof Node !== 'undefined' ? Node : null);
  const HTMLInputElementRef =
    doc.defaultView?.HTMLInputElement ?? (typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : null);

  const viewRoot = doc.getElementById('authViewRoot');
  const authScreen = doc.querySelector('.auth-screen');
  const viewToggleButtons = Array.from(doc.querySelectorAll('[data-view-toggle]'));
  const statusHint = doc.getElementById('statusHint');
  const footer = doc.querySelector('.auth-shell__footer');
  const footerMenu = doc.querySelector('.auth-shell__footer-nav');
  const footerMenuButton = doc.querySelector('.auth-shell__menu-button');
  const footerMenuPanel = doc.getElementById('authFooterMenu');
  const footerMenuOverlay = doc.querySelector('[data-menu-overlay]');
  const footerToggle = doc.querySelector('[data-footer-toggle]');
  const footerActiveViewLabel = doc.querySelector('[data-active-view-label]');
  const footerActiveViewDivider = doc.querySelector('[data-active-view-divider]');
  const footerMenuCategoriesNav = footerMenuPanel?.querySelector('[data-menu-categories]');
  const footerMenuViewsList = footerMenuPanel?.querySelector('[data-menu-group="views"]');
  const footerMenuThemeButton = footerMenuPanel?.querySelector('[data-action="preferences-theme"]');
  const footerMenuFontScaleButton = footerMenuPanel?.querySelector('[data-action="preferences-font"]');
  const footerMenuFontScaleValue = footerMenuPanel?.querySelector('[data-pref-font-scale-value]');
  const footerMenuLanguageButton = footerMenuPanel?.querySelector('[data-action="preferences-language"]');
  const footerMenuLanguagePicker = footerMenuPanel?.querySelector('[data-pref-language-picker]');
  const footerViewportQuery =
    typeof win?.matchMedia === 'function' ? win.matchMedia('(max-width: 48rem)') : null;
  const ResizeObserverRef = win?.ResizeObserver ?? (typeof ResizeObserver !== 'undefined' ? ResizeObserver : null);
  const BodyElementRef = doc.defaultView?.HTMLBodyElement ?? (typeof HTMLBodyElement !== 'undefined' ? HTMLBodyElement : null);
  const rootElement = doc.body && (!BodyElementRef || doc.body instanceof BodyElementRef) ? doc.body : null;
  const FOOTER_TOGGLE_LABELS = {
    expand: 'Mostrar detalhes do rodapé',
    collapse: 'Ocultar detalhes do rodapé',
  };

  const THEME_SEQUENCE = ['auto', 'light', 'dark'];
  const THEME_LABELS = new Map([
    ['auto', 'Automático'],
    ['light', 'Claro'],
    ['dark', 'Escuro'],
  ]);
  const LANGUAGE_LABELS = new Map([
    ['pt-BR', 'Português (Brasil)'],
    ['en', 'Inglês'],
    ['es', 'Espanhol'],
  ]);
  const FONT_SCALE_SEQUENCE = [-2, -1, 0, 1, 2];

  const fallbackFontScaleLabel =
    typeof runtime.getFontScaleLabel === 'function' ? runtime.getFontScaleLabel(0) : 'Padrão';

  function getNextValue(current, sequence) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      return current;
    }

    const currentIndex = sequence.indexOf(current);
    if (currentIndex === -1) {
      return sequence[0];
    }

    const nextIndex = (currentIndex + 1) % sequence.length;
    return sequence[nextIndex];
  }

  function updateThemeQuickAction(themeValue = 'auto') {
    if (!ensureHtmlElement(doc, footerMenuThemeButton)) {
      return;
    }

    const baseLabel = 'Escolher tema';
    const themeLabel = THEME_LABELS.get(themeValue) ?? THEME_LABELS.get('auto');
    const ariaLabel = themeLabel ? `${baseLabel}. Tema atual: ${themeLabel}` : baseLabel;
    footerMenuThemeButton.setAttribute('aria-label', ariaLabel);
    footerMenuThemeButton.setAttribute('title', themeLabel ? `${baseLabel} (Tema atual: ${themeLabel})` : baseLabel);
  }

  function updateFontScaleQuickAction(fontScaleValue = undefined) {
    const label =
      typeof runtime.getFontScaleLabel === 'function'
        ? runtime.getFontScaleLabel(fontScaleValue)
        : null;
    const resolvedLabel = label ?? fallbackFontScaleLabel;

    if (footerMenuFontScaleValue) {
      footerMenuFontScaleValue.textContent = resolvedLabel;
    }

    if (ensureHtmlElement(doc, footerMenuFontScaleButton)) {
      const baseLabel = 'Ajustar tamanho do texto';
      if (resolvedLabel) {
        footerMenuFontScaleButton.setAttribute('aria-label', `${baseLabel}. Escala atual: ${resolvedLabel}`);
        footerMenuFontScaleButton.setAttribute('title', `${baseLabel} (Escala atual: ${resolvedLabel})`);
      } else {
        footerMenuFontScaleButton.setAttribute('aria-label', baseLabel);
        footerMenuFontScaleButton.setAttribute('title', baseLabel);
      }
    }
  }

  function updateLanguageQuickAction(langValue = 'pt-BR') {
    if (!ensureHtmlElement(doc, footerMenuLanguageButton)) {
      return;
    }

    const baseLabel = 'Escolher idioma';
    const languageLabel = LANGUAGE_LABELS.get(langValue) ?? LANGUAGE_LABELS.get('pt-BR');
    const ariaLabel = languageLabel ? `${baseLabel}. Idioma atual: ${languageLabel}` : baseLabel;
    footerMenuLanguageButton.setAttribute('aria-label', ariaLabel);
    footerMenuLanguageButton.setAttribute('title', languageLabel ? `${baseLabel} (Idioma atual: ${languageLabel})` : baseLabel);

    if (!languagePickerOpen) {
      footerMenuLanguageButton.setAttribute('aria-expanded', 'false');
    }

    updateLanguagePicker(langValue);
  }

  function getLanguageOptions() {
    if (!(footerMenuLanguagePicker instanceof HTMLElementRef)) {
      return [];
    }

    return Array.from(footerMenuLanguagePicker.querySelectorAll('[data-language-option]')).filter((option) =>
      option instanceof HTMLElementRef,
    );
  }

  function updateLanguagePicker(langValue = 'pt-BR') {
    if (!(footerMenuLanguagePicker instanceof HTMLElementRef)) {
      return;
    }

    const options = getLanguageOptions();
    options.forEach((option) => {
      if (!(option instanceof HTMLElementRef)) {
        return;
      }

      const isActive = option.dataset.languageOption === langValue;
      option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      option.classList.toggle('is-active', isActive);
    });
  }

  function registerLanguagePickerListeners(listeners) {
    listeners.forEach(({ target, type, handler, options }) => {
      if (!target || typeof target.addEventListener !== 'function') {
        return;
      }

      target.addEventListener(type, handler, options);

      const remove = () => {
        target.removeEventListener(type, handler, options);
      };

      languagePickerListeners.add(remove);
    });
  }

  function cleanupLanguagePickerListeners() {
    languagePickerListeners.forEach((remove) => {
      try {
        remove();
      } catch (error) {
        console.error('Preferências: falha ao remover listener do seletor de idioma.', error);
      }
    });

    languagePickerListeners.clear();
  }

  function focusLanguageOptionByOffset(currentOption, offset) {
    const options = getLanguageOptions();

    if (!options.length) {
      return;
    }

    const currentIndex = currentOption ? options.indexOf(currentOption) : -1;
    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (normalizedIndex + offset + options.length) % options.length;
    const nextOption = options[nextIndex];

    if (nextOption) {
      focusWithoutScreenShift(doc, win, nextOption);
    }
  }

  function openLanguagePicker() {
    if (languagePickerOpen || !ensureHtmlElement(doc, footerMenuLanguagePicker)) {
      return;
    }

    languagePickerOpen = true;
    footerMenuLanguagePicker.hidden = false;

    if (ensureHtmlElement(doc, footerMenuLanguageButton)) {
      footerMenuLanguageButton.setAttribute('aria-expanded', 'true');
    }

    const snapshot =
      typeof runtime.getCurrentPreferences === 'function' ? runtime.getCurrentPreferences() : null;
    const currentLanguage = snapshot?.lang ?? doc.documentElement?.getAttribute('data-lang') ?? 'pt-BR';

    updateLanguagePicker(currentLanguage);

    const options = getLanguageOptions();
    const activeOption = options.find((option) => option.dataset.languageOption === currentLanguage) ?? options[0];

    if (activeOption) {
      focusWithoutScreenShift(doc, win, activeOption);
    }

    const handlePointerDown = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePicker = footerMenuLanguagePicker.contains(event.target);
      const isTrigger = ensureHtmlElement(doc, footerMenuLanguageButton) && footerMenuLanguageButton.contains(event.target);

      if (!isInsidePicker && !isTrigger) {
        closeLanguagePicker();
      }
    };

    const handleFocusIn = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePicker = footerMenuLanguagePicker.contains(event.target);
      const isTrigger = ensureHtmlElement(doc, footerMenuLanguageButton) && footerMenuLanguageButton.contains(event.target);

      if (!isInsidePicker && !isTrigger) {
        closeLanguagePicker();
      }
    };

    const handleKeydown = (event) => {
      if (KeyboardEventRef && event instanceof KeyboardEventRef && event.key === 'Escape') {
        event.preventDefault();
        closeLanguagePicker({ focusButton: true });
      }
    };

    registerLanguagePickerListeners([
      { target: doc, type: 'pointerdown', handler: handlePointerDown },
      { target: doc, type: 'focusin', handler: handleFocusIn },
      { target: doc, type: 'keydown', handler: handleKeydown },
    ]);
  }

  function closeLanguagePicker({ focusButton = false } = {}) {
    if (!languagePickerOpen) {
      return;
    }

    languagePickerOpen = false;
    cleanupLanguagePickerListeners();

    if (ensureHtmlElement(doc, footerMenuLanguagePicker)) {
      footerMenuLanguagePicker.hidden = true;
    }

    if (ensureHtmlElement(doc, footerMenuLanguageButton)) {
      footerMenuLanguageButton.setAttribute('aria-expanded', 'false');

      if (focusButton) {
        focusWithoutScreenShift(doc, win, footerMenuLanguageButton);
      }
    }
  }

  function toggleLanguagePicker() {
    if (languagePickerOpen) {
      closeLanguagePicker({ focusButton: true });
    } else {
      openLanguagePicker();
    }
  }

  const FOOTER_MENU_STRUCTURE = [
    {
      id: 'shell-access',
      label: WHITE_LABEL_IDENTITY.shortName,
      types: [
        {
          id: 'shell-home',
          label: 'Painel inicial',
          entries: [
            {
              id: 'view-white-label-home',
              label: 'Bem-vindo',
              description: 'Abra o painel inicial pronto para receber o MiniApp da sua marca.',
              view: 'guest',
            },
          ],
        },
        {
          id: 'account-management',
          label: 'Conta e segurança',
          entries: [
            {
              id: 'view-register',
              label: 'Criar uma nova conta',
              description: 'Inicie o cadastro com validações assistidas e etapas orientadas.',
              view: 'register',
            },
            {
              id: 'view-account-dashboard',
              label: 'Painel da conta',
              description: 'Gerencie cadastros locais, sessões e limpeza de dados neste dispositivo.',
              view: 'account-dashboard',
            },
          ],
        },
      ],
    },
  ];

  if (!ensureHtmlElement(doc, viewRoot)) {
    throw new Error('Elemento raiz da view de autenticação não encontrado.');
  }

  if (ensureHtmlElement(doc, footerMenuPanel) && !footerMenuPanel.hasAttribute('tabindex')) {
    footerMenuPanel.tabIndex = -1;
  }

  const teardownCallbacks = [];
  let footerMenuOpen = false;
  let footerDetailsExpanded = false;
  let languagePickerOpen = false;
  const languagePickerListeners = new Set();

  if (footerMenuLanguagePicker instanceof HTMLElementRef) {
    const options = getLanguageOptions();

    options.forEach((option) => {
      if (!(option instanceof HTMLElementRef)) {
        return;
      }

      const handleClick = (event) => {
        event.preventDefault();

        const langValue = option.dataset.languageOption;
        if (!langValue) {
          return;
        }

        const snapshot =
          typeof runtime.getCurrentPreferences === 'function' ? runtime.getCurrentPreferences() : null;
        const currentLanguage = snapshot?.lang ?? doc.documentElement?.getAttribute('data-lang') ?? 'pt-BR';

        if (langValue !== currentLanguage) {
          const updatePromise =
            typeof runtime.updateUserPreferences === 'function'
              ? runtime.updateUserPreferences({ lang: langValue }, { window: win, document: doc })
              : null;

          if (updatePromise && typeof updatePromise.catch === 'function') {
            updatePromise.catch((error) => {
              console.error('Preferências: falha ao aplicar idioma escolhido.', error);
            });
          }
        }

        closeLanguagePicker({ focusButton: true });
      };

      const handleKeydown = (event) => {
        if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          focusLanguageOptionByOffset(option, 1);
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          focusLanguageOptionByOffset(option, -1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          focusLanguageOptionByOffset(options[0], 0);
        } else if (event.key === 'End') {
          event.preventDefault();
          focusLanguageOptionByOffset(options[options.length - 1], 0);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeLanguagePicker({ focusButton: true });
        } else if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          option.click();
        }
      };

      option.addEventListener('click', handleClick);
      option.addEventListener('keydown', handleKeydown);

      teardownCallbacks.push(() => {
        option.removeEventListener('click', handleClick);
        option.removeEventListener('keydown', handleKeydown);
      });
    });
  }

  teardownCallbacks.push(() => {
    closeLanguagePicker();
    cleanupLanguagePickerListeners();
  });

  updateThemeQuickAction();
  updateFontScaleQuickAction();
  updateLanguageQuickAction();

  if (typeof runtime.subscribeUserPreferences === 'function') {
    const unsubscribePreferences = runtime.subscribeUserPreferences((prefsSnapshot) => {
      if (prefsSnapshot && typeof prefsSnapshot === 'object') {
        updateThemeQuickAction(prefsSnapshot.theme);
        updateFontScaleQuickAction(prefsSnapshot.fontScale);
        updateLanguageQuickAction(prefsSnapshot.lang);
      } else {
        updateThemeQuickAction();
        updateFontScaleQuickAction();
        updateLanguageQuickAction();
      }
    });

    if (typeof unsubscribePreferences === 'function') {
      teardownCallbacks.push(unsubscribePreferences);
    }
  }

  const FOOTER_OFFSET_TOKEN = '--layout-footer-offset';

  function applyFooterOffset(value) {
    if (!rootElement) {
      return;
    }

    const style = rootElement.style;

    if (style && typeof style.setProperty === 'function') {
      style.setProperty(FOOTER_OFFSET_TOKEN, value);
      return;
    }

    if (style && typeof style === 'object') {
      style[FOOTER_OFFSET_TOKEN] = value;
      return;
    }

    if (typeof rootElement.getAttribute === 'function' && typeof rootElement.setAttribute === 'function') {
      const existing = rootElement.getAttribute('style') ?? '';
      const filtered = existing
        .split(';')
        .map((entry) => entry.trim())
        .filter((entry) => entry && !entry.startsWith(`${FOOTER_OFFSET_TOKEN}:`));
      filtered.push(`${FOOTER_OFFSET_TOKEN}: ${value}`);
      rootElement.setAttribute('style', `${filtered.join('; ')};`);
    }
  }

  function clearFooterOffset() {
    if (!rootElement) {
      return;
    }

    const style = rootElement.style;

    if (style && typeof style.removeProperty === 'function') {
      style.removeProperty(FOOTER_OFFSET_TOKEN);
      return;
    }

    if (style && typeof style === 'object') {
      delete style[FOOTER_OFFSET_TOKEN];
      return;
    }

    if (typeof rootElement.getAttribute === 'function' && typeof rootElement.setAttribute === 'function') {
      const existing = rootElement.getAttribute('style');
      if (!existing) {
        return;
      }

      const filtered = existing
        .split(';')
        .map((entry) => entry.trim())
        .filter((entry) => entry && !entry.startsWith(`${FOOTER_OFFSET_TOKEN}:`));

      if (filtered.length > 0) {
        rootElement.setAttribute('style', `${filtered.join('; ')};`);
      } else {
        rootElement.removeAttribute('style');
      }
    }
  }

  function updateFooterOffset() {
    if (!rootElement || !ensureHtmlElement(doc, footer)) {
      return;
    }

    const isMobileViewport = Boolean(footerViewportQuery?.matches);
    const footerRect = isMobileViewport ? footer.getBoundingClientRect() : null;
    const footerHeight = footerRect ? Math.ceil(footerRect.height) : 0;

    if (footerHeight > 0) {
      applyFooterOffset(`${footerHeight}px`);
    } else {
      clearFooterOffset();
    }
  }

  function setFooterDetailsExpanded(isExpanded) {
    footerDetailsExpanded = Boolean(isExpanded);

    if (ensureHtmlElement(doc, footer)) {
      if (footerDetailsExpanded) {
        footer.setAttribute('data-footer-expanded', 'true');
      } else {
        footer.removeAttribute('data-footer-expanded');
      }
    }

    if (ensureHtmlElement(doc, footerToggle)) {
      footerToggle.setAttribute('aria-expanded', footerDetailsExpanded ? 'true' : 'false');
      footerToggle.setAttribute(
        'aria-label',
        footerDetailsExpanded ? FOOTER_TOGGLE_LABELS.collapse : FOOTER_TOGGLE_LABELS.expand,
      );
    }

    updateFooterOffset();
  }

  function collapseFooterDetails() {
    setFooterDetailsExpanded(false);
  }

  function syncFooterToggleVisibility() {
    if (ensureHtmlElement(doc, footerToggle)) {
      footerToggle.hidden = false;
      footerToggle.removeAttribute('aria-hidden');
    }

    updateFooterOffset();
  }

  collapseFooterDetails();
  syncFooterToggleVisibility();

  if (footerViewportQuery) {
    const handleFooterViewportChange = () => {
      syncFooterToggleVisibility();
    };

    if (typeof footerViewportQuery.addEventListener === 'function') {
      footerViewportQuery.addEventListener('change', handleFooterViewportChange);
      teardownCallbacks.push(() => {
        footerViewportQuery.removeEventListener('change', handleFooterViewportChange);
      });
    } else if (typeof footerViewportQuery.addListener === 'function') {
      footerViewportQuery.addListener(handleFooterViewportChange);
      teardownCallbacks.push(() => {
        footerViewportQuery.removeListener(handleFooterViewportChange);
      });
    }
  } else if (ensureHtmlElement(doc, footerToggle)) {
    footerToggle.hidden = false;
    footerToggle.removeAttribute('aria-hidden');
  }

  if (ensureHtmlElement(doc, footerToggle)) {
    const handleFooterToggleClick = () => {
      setFooterDetailsExpanded(!footerDetailsExpanded);
    };

    const handleFooterToggleKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      if (event.key === 'Escape' && footerDetailsExpanded) {
        event.preventDefault();
        collapseFooterDetails();
      }
    };

    footerToggle.addEventListener('click', handleFooterToggleClick);
    footerToggle.addEventListener('keydown', handleFooterToggleKeydown);

    teardownCallbacks.push(() => {
      footerToggle.removeEventListener('click', handleFooterToggleClick);
      footerToggle.removeEventListener('keydown', handleFooterToggleKeydown);
    });
  }

  if (ensureHtmlElement(doc, footer) && ResizeObserverRef) {
    const footerObserver = new ResizeObserverRef(() => {
      updateFooterOffset();
    });

    footerObserver.observe(footer);

    teardownCallbacks.push(() => {
      footerObserver.disconnect();
    });
  }

  if (rootElement) {
    teardownCallbacks.push(() => {
      clearFooterOffset();
    });
  }

  function getFooterMenuItems() {
    if (!(footerMenuPanel instanceof HTMLElementRef)) {
      return [];
    }

    return Array.from(footerMenuPanel.querySelectorAll('.auth-shell__menu-item')).filter((item) => {
      if (!(item instanceof HTMLElementRef) || item.disabled) {
        return false;
      }

      if (item.hidden || item.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      if (footerMenuOpen && item.offsetParent === null) {
        return false;
      }

      return true;
    });
  }

  function setFooterMenuState(isOpen) {
    if (ensureHtmlElement(doc, footerMenu)) {
      footerMenu.dataset.state = isOpen ? 'open' : 'closed';
    }

    if (ensureHtmlElement(doc, footerMenuButton)) {
      footerMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (ensureHtmlElement(doc, footerMenuPanel)) {
      footerMenuPanel.hidden = !isOpen;
    }

    if (ensureHtmlElement(doc, footerMenuOverlay)) {
      footerMenuOverlay.hidden = !isOpen;
    }

    if (doc.body instanceof (doc.defaultView?.HTMLBodyElement ?? (typeof HTMLBodyElement !== 'undefined' ? HTMLBodyElement : HTMLElementRef))) {
      doc.body.classList.toggle('auth-shell--menu-open', isOpen);
    }

    updateFooterOffset();
  }

  const footerMenuListeners = new Set();

  function registerFooterMenuListener(remove) {
    if (typeof remove === 'function') {
      remove.__footerMenuListener = true;
      footerMenuListeners.add(remove);
      teardownCallbacks.push(remove);
    }
  }

  function cleanupFooterMenuListeners() {
    footerMenuListeners.forEach((remove) => {
      try {
        remove();
      } catch (error) {
        console.error('Erro ao remover listener do menu do rodapé.', error);
      }

      const index = teardownCallbacks.indexOf(remove);
      if (index >= 0) {
        teardownCallbacks.splice(index, 1);
      }
    });
    footerMenuListeners.clear();
  }

  function closeFooterMenu({ focusToggle = false } = {}) {
    if (!footerMenuOpen) {
      closeLanguagePicker();
      return;
    }

    footerMenuOpen = false;
    setFooterMenuState(false);

    closeLanguagePicker();

    cleanupFooterMenuListeners();

    if (focusToggle && ensureHtmlElement(doc, footerMenuButton)) {
      focusWithoutScreenShift(doc, win, footerMenuButton);
    }
  }

  function focusFooterMenuItemByOffset(currentIndex, offset) {
    const items = getFooterMenuItems();

    if (!items.length) {
      return;
    }

    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (normalizedIndex + offset + items.length) % items.length;
    const nextItem = items[nextIndex];

    if (nextItem) {
      focusWithoutScreenShift(doc, win, nextItem);
    }
  }

  function handleFooterMenuItemKeydown(event) {
    if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
      return;
    }

    const target = event.target instanceof HTMLElementRef ? event.target.closest('.auth-shell__menu-item') : null;

    if (!(target instanceof HTMLElementRef)) {
      return;
    }

    const items = getFooterMenuItems();
    const currentIndex = items.indexOf(target);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusFooterMenuItemByOffset(currentIndex, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusFooterMenuItemByOffset(currentIndex, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusFooterMenuItemByOffset(0, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusFooterMenuItemByOffset(items.length - 1, 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeFooterMenu({ focusToggle: true });
    }
  }

  function registerFooterMenuListeners(listeners) {
    listeners.forEach(({ target, type, handler, options }) => {
      if (!target || typeof target.addEventListener !== 'function') {
        return;
      }

      target.addEventListener(type, handler, options);

      const remove = () => {
        target.removeEventListener(type, handler, options);
      };

      registerFooterMenuListener(remove);
    });
  }

  function openFooterMenu({ focus = 'first' } = {}) {
    if (footerMenuOpen) {
      return;
    }

    collapseFooterDetails();
    footerMenuOpen = true;
    setFooterMenuState(true);

    const handlePointerDown = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePanel = ensureHtmlElement(doc, footerMenuPanel) && footerMenuPanel.contains(event.target);
      const isToggle = ensureHtmlElement(doc, footerMenuButton) && footerMenuButton.contains(event.target);

      if (!isInsidePanel && !isToggle) {
        closeFooterMenu();
      }
    };

    const handleFocusIn = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePanel = ensureHtmlElement(doc, footerMenuPanel) && footerMenuPanel.contains(event.target);
      const isToggle = ensureHtmlElement(doc, footerMenuButton) && footerMenuButton.contains(event.target);

      if (!isInsidePanel && !isToggle) {
        closeFooterMenu();
      }
    };

    const handleKeydown = (event) => {
      if (KeyboardEventRef && event instanceof KeyboardEventRef && event.key === 'Escape') {
        event.preventDefault();
        closeFooterMenu({ focusToggle: true });
      }
    };

    registerFooterMenuListeners([
      { target: doc, type: 'pointerdown', handler: handlePointerDown },
      { target: doc, type: 'focusin', handler: handleFocusIn },
      { target: doc, type: 'keydown', handler: handleKeydown },
    ]);

    const items = getFooterMenuItems();

    if (!items.length) {
      if (ensureHtmlElement(doc, footerMenuPanel)) {
        focusWithoutScreenShift(doc, win, footerMenuPanel);
      }
      return;
    }

    let targetItem = items[0];

    if (focus === 'last') {
      targetItem = items[items.length - 1];
    }

    if (targetItem) {
      focusWithoutScreenShift(doc, win, targetItem);
    }
  }

  function toggleFooterMenu() {
    if (footerMenuOpen) {
      closeFooterMenu({ focusToggle: true });
    } else {
      openFooterMenu();
    }
  }

  function setActiveFooterMenuItem(viewName) {
    let items = getFooterMenuItems();

    if (viewName) {
      const hasActiveItem = items.some((item) => item instanceof HTMLElementRef && item.dataset.view === viewName);
      if (!hasActiveItem) {
        const targetCategory = findCategoryByView(viewName);
        if (targetCategory && targetCategory.id && targetCategory.id !== activeCategoryId) {
          activeCategoryId = targetCategory.id;
          renderFooterCategoryNavigation();
          renderFooterCategoryContent();
          items = getFooterMenuItems();
        }
      }
    }

    let activeLabel = '';

    items.forEach((item) => {
      if (!(item instanceof HTMLElementRef)) {
        return;
      }

      const isActive = Boolean(viewName) && item.dataset.view === viewName;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');

      if (isActive) {
        const categoryId = item.dataset.categoryId;
        const typeId = item.dataset.typeId;

        if (categoryId) {
          activeCategoryId = categoryId;
        }

        if (categoryId && typeId) {
          const typeKey = getTypeKey(categoryId, typeId);
          expandedTypes.add(typeKey);

          if (footerMenuViewsList instanceof HTMLElementRef) {
            const typeToggle = footerMenuViewsList.querySelector(`[data-type-toggle="${typeKey}"]`);
            const typeContent = footerMenuViewsList.querySelector(`[data-type-content="${typeKey}"]`);

            if (ensureHtmlElement(doc, typeToggle)) {
              typeToggle.setAttribute('aria-expanded', 'true');
            }

            if (ensureHtmlElement(doc, typeContent)) {
              typeContent.hidden = false;
            }
          }
        }

        activeLabel = item.textContent?.trim() || '';
      }
    });

    if (!activeLabel && viewName && FOOTER_VIEW_LABELS[viewName]) {
      activeLabel = FOOTER_VIEW_LABELS[viewName];
    }

    if (ensureHtmlElement(doc, footerActiveViewLabel)) {
      if (activeLabel) {
        footerActiveViewLabel.textContent = `Painel atual: ${activeLabel}`;
        footerActiveViewLabel.hidden = false;
      } else {
        footerActiveViewLabel.textContent = '';
        footerActiveViewLabel.hidden = true;
      }
    }

    if (ensureHtmlElement(doc, footerActiveViewDivider)) {
      footerActiveViewDivider.hidden = !activeLabel;
    }

    if (ensureHtmlElement(doc, footerMenuButton)) {
      footerMenuButton.setAttribute(
        'aria-label',
        activeLabel ? `Abrir menu principal. Painel atual: ${activeLabel}` : 'Abrir menu principal',
      );
      footerMenuButton.setAttribute(
        'title',
        activeLabel ? `Abrir menu principal. Painel atual: ${activeLabel}` : 'Abrir menu principal',
      );
    }

    if (ensureHtmlElement(doc, footerMenuCategoriesNav)) {
      const buttons = Array.from(footerMenuCategoriesNav.querySelectorAll('[data-category-id]'));
      buttons.forEach((button) => {
        if (!ensureHtmlElement(doc, button)) {
          return;
        }

        const isActive = button.dataset.categoryId === activeCategoryId;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
  }

  function renderGuestAccessPanel(root) {
    if (!(root instanceof HTMLElementRef)) {
      return;
    }

    root.hidden = false;
    root.dataset.view = 'guest';
    root.classList.add('auth-screen__view--surface');

    const guestView = doc.createElement('article');
    guestView.className = 'auth-view auth-view--guest';

    const heading = doc.createElement('h1');
    heading.className = 'auth-view__title';
    heading.dataset.i18n = 'auth.welcome';
    heading.textContent = WHITE_LABEL_IDENTITY.shortName;

    const description = doc.createElement('p');
    description.className = 'auth-view__description';
    description.dataset.i18n = 'auth.subtitle';
    description.textContent = WHITE_LABEL_IDENTITY.welcomeMessage;

    const miniAppHost = doc.createElement('section');
    miniAppHost.className = 'auth-view__miniapp-host';
    miniAppHost.dataset.miniappHost = 'primary';
    miniAppHost.setAttribute('role', 'region');
    miniAppHost.setAttribute('aria-live', 'polite');
    miniAppHost.textContent = WHITE_LABEL_IDENTITY.miniAppLoadingMessage;

    guestView.append(heading, description, miniAppHost);
    root.append(guestView);

    runtime.queueTask(() => {
      runtime
        .loadMiniApp('primary', {
          document: doc,
          target: miniAppHost,
          fetch: runtime.fetch,
          context: {
            ...resolveMiniAppContext({ window: win, document: doc }),
          },
        })
        .then(() => {
          miniAppHost.dataset.miniappLoaded = 'true';
        })
        .catch((error) => {
          console.error('Não foi possível carregar o MiniApp cadastrado.', error);
          miniAppHost.innerHTML = '';
          const errorMessage = doc.createElement('p');
          errorMessage.className = 'auth-view__miniapp-error';
          errorMessage.textContent =
            'Não foi possível carregar o MiniApp configurado no momento. Tente novamente mais tarde.';
          miniAppHost.append(errorMessage);
        });
    });
  }

  const VIEW_RENDERERS = {
    register: {
      render: runtime.renderRegisterPanel,
      hint: 'Preencha os dados abaixo para criar sua conta com segurança.',
    },
    guest: {
      render: renderGuestAccessPanel,
      hint: WHITE_LABEL_IDENTITY.guestHint,
    },
    'account-dashboard': {
      render: runtime.renderAccountDashboard,
      hint: 'Gerencie cadastros locais, revise detalhes e limpe dados salvos neste dispositivo.',
    },
  };

  const FOOTER_VIEW_LABELS = {
    register: 'Criar uma nova conta',
    guest: WHITE_LABEL_IDENTITY.shortName,
    'account-dashboard': 'Painel da conta',
  };

  let currentView = null;
  const expandedTypes = new Set();
  let activeCategoryId = FOOTER_MENU_STRUCTURE.find((category) => category && category.id)?.id ?? null;

  function getTypeKey(categoryId, typeId) {
    return `${categoryId}::${typeId}`;
  }

  function findCategoryById(categoryId) {
    if (!categoryId) {
      return null;
    }

    return (
      FOOTER_MENU_STRUCTURE.find((category) => category && category.id === categoryId) ?? null
    );
  }

  function findCategoryByView(viewName) {
    if (!viewName) {
      return null;
    }

    return (
      FOOTER_MENU_STRUCTURE.find((category) => {
        if (!category || !Array.isArray(category.types)) {
          return false;
        }

        return category.types.some((type) => {
          if (!type || !Array.isArray(type.entries)) {
            return false;
          }

          return type.entries.some((entry) => entry && entry.view === viewName);
        });
      }) ?? null
    );
  }

  function renderFooterCategoryNavigation() {
    if (!(footerMenuCategoriesNav instanceof HTMLElementRef)) {
      return;
    }

    const categories = FOOTER_MENU_STRUCTURE.filter((category) => category && category.id && category.label);

    if (categories.length === 0) {
      footerMenuCategoriesNav.replaceChildren();
      footerMenuCategoriesNav.hidden = true;
      return;
    }

    footerMenuCategoriesNav.hidden = false;

    const fragment = doc.createDocumentFragment();
    const list = doc.createElement('ul');
    list.className = 'auth-shell__menu-category-tabs';

    categories.forEach((category) => {
      const item = doc.createElement('li');
      item.className = 'auth-shell__menu-category-tab';

      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'auth-shell__menu-category-button';
      button.dataset.categoryId = category.id;
      button.textContent = category.label;

      const isActive = category.id === activeCategoryId;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      item.append(button);
      list.append(item);
    });

    fragment.append(list);
    footerMenuCategoriesNav.replaceChildren(fragment);
  }

  function renderFooterCategoryContent() {
    if (!(footerMenuViewsList instanceof HTMLElementRef)) {
      return;
    }

    footerMenuViewsList.replaceChildren();

    const categories = FOOTER_MENU_STRUCTURE.filter((category) => category && category.id);
    if (categories.length === 0) {
      return;
    }

    let category = findCategoryById(activeCategoryId) ?? categories[0];
    if (!category || !category.id) {
      return;
    }

    activeCategoryId = category.id;

    const types = Array.isArray(category.types) ? category.types.filter((type) => type && type.id) : [];

    if (types.length === 0) {
      return;
    }

    const hasExpandedType = types.some((type) => expandedTypes.has(getTypeKey(category.id, type.id)));
    if (!hasExpandedType) {
      const firstType = types[0];
      if (firstType && firstType.id) {
        expandedTypes.add(getTypeKey(category.id, firstType.id));
      }
    }

    const fragment = doc.createDocumentFragment();
    const categoryItem = doc.createElement('li');
    categoryItem.className = 'auth-shell__menu-category';

    const categoryTitle = doc.createElement('h3');
    categoryTitle.className = 'auth-shell__menu-category-title';
    categoryTitle.textContent = category.label ?? 'Painéis';
    categoryItem.append(categoryTitle);

    const categoryContent = doc.createElement('div');
    categoryContent.className = 'auth-shell__menu-category-content';

    types.forEach((type) => {
      const typeSection = doc.createElement('section');
      typeSection.className = 'auth-shell__menu-type';

      const typeKey = getTypeKey(category.id, type.id);

      const typeToggle = doc.createElement('button');
      typeToggle.type = 'button';
      typeToggle.className = 'auth-shell__menu-type-title auth-shell__menu-type-toggle';
      typeToggle.dataset.typeToggle = typeKey;
      typeToggle.textContent = type.label ?? 'Categoria';

      const typeContentId = `authFooterMenuType-${category.id}-${type.id}`;
      typeToggle.setAttribute('aria-controls', typeContentId);

      const typeContent = doc.createElement('div');
      typeContent.id = typeContentId;
      typeContent.className = 'auth-shell__menu-type-content';
      typeContent.dataset.typeContent = typeKey;

      const isTypeExpanded = expandedTypes.has(typeKey);
      typeToggle.setAttribute('aria-expanded', isTypeExpanded ? 'true' : 'false');
      typeContent.hidden = !isTypeExpanded;

      typeToggle.addEventListener('click', () => {
        const currentlyExpanded = expandedTypes.has(typeKey);
        if (currentlyExpanded) {
          expandedTypes.delete(typeKey);
        } else {
          expandedTypes.add(typeKey);
        }

        typeToggle.setAttribute('aria-expanded', currentlyExpanded ? 'false' : 'true');
        typeContent.hidden = currentlyExpanded;
      });

      const sublist = doc.createElement('ul');
      sublist.className = 'auth-shell__menu-sublist';

      const entries = Array.isArray(type.entries) ? type.entries.filter(Boolean) : [];

      entries.forEach((entry) => {
        const entryItem = doc.createElement('li');
        entryItem.className = 'auth-shell__menu-entry';

        const link = doc.createElement('a');
        link.className = 'auth-shell__menu-item';
        link.dataset.categoryId = category.id;
        link.dataset.typeId = type.id;
        link.textContent = entry.label ?? 'Painel';
        link.href = entry.view
          ? `#${entry.view}`
          : entry.action
          ? `#${entry.action}`
          : `#${entry.id ?? 'painel'}`;

        if (entry.view) {
          link.dataset.view = entry.view;
        }

        if (entry.action) {
          link.dataset.action = entry.action;
        }

        let descriptionId = null;

        if (entry.description) {
          descriptionId = `${entry.id}-description`;
          link.setAttribute('aria-describedby', descriptionId);
        }

        entryItem.append(link);

        if (entry.description) {
          const description = doc.createElement('p');
          description.id = descriptionId;
          description.className = 'auth-shell__menu-item-description';
          description.textContent = entry.description;
          entryItem.append(description);
        }

        sublist.append(entryItem);
      });

      if (sublist.children.length > 0) {
        typeContent.append(sublist);
        typeSection.append(typeToggle, typeContent);
        categoryContent.append(typeSection);
      }
    });

    if (categoryContent.children.length > 0) {
      categoryItem.append(categoryContent);
      fragment.append(categoryItem);
    }

    footerMenuViewsList.append(fragment);
  }

  function renderFooterViewItems({ alignWithView = true } = {}) {
    renderFooterCategoryNavigation();
    renderFooterCategoryContent();
    setActiveFooterMenuItem(alignWithView ? currentView : null);
  }



  function refreshFooterMenuItems() {
    renderFooterViewItems();
  }

  if (ensureHtmlElement(doc, footerMenuButton)) {
    const handleFooterMenuClick = () => {
      if (!footerMenuOpen) {
        openFooterMenu();
      }
    };

    const handleFooterMenuKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openFooterMenu({ focus: 'first' });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openFooterMenu({ focus: 'last' });
      } else if (event.key === 'Escape' && footerMenuOpen) {
        event.preventDefault();
        closeFooterMenu({ focusToggle: true });
      }
    };

    footerMenuButton.addEventListener('click', handleFooterMenuClick);
    footerMenuButton.addEventListener('keydown', handleFooterMenuKeydown);

    teardownCallbacks.push(() => {
      footerMenuButton.removeEventListener('click', handleFooterMenuClick);
      footerMenuButton.removeEventListener('keydown', handleFooterMenuKeydown);
    });
  }

  if (ensureHtmlElement(doc, footerMenuCategoriesNav)) {
    const handleCategoryClick = (event) => {
      const trigger =
        event.target instanceof HTMLElementRef
          ? event.target.closest('[data-category-id]')
          : null;

      if (!trigger || !ensureHtmlElement(doc, trigger)) {
        return;
      }

      const categoryId = trigger.dataset.categoryId;

      if (!categoryId || categoryId === activeCategoryId) {
        return;
      }

      activeCategoryId = categoryId;
      renderFooterViewItems({ alignWithView: false });

      const focusTarget = footerMenuCategoriesNav.querySelector(`[data-category-id="${categoryId}"]`);
      if (ensureHtmlElement(doc, focusTarget)) {
        focusWithoutScreenShift(doc, win, focusTarget);
      }
    };

    const handleCategoryKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      const trigger =
        event.target instanceof HTMLElementRef
          ? event.target.closest('[data-category-id]')
          : null;

      if (!trigger || !ensureHtmlElement(doc, trigger)) {
        return;
      }

      const buttons = Array.from(footerMenuCategoriesNav.querySelectorAll('[data-category-id]')).filter((button) =>
        ensureHtmlElement(doc, button),
      );

      if (!buttons.length) {
        return;
      }

      const currentIndex = buttons.indexOf(trigger);

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % buttons.length : 0;
        buttons[nextIndex]?.focus();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + buttons.length) % buttons.length : 0;
        buttons[prevIndex]?.focus();
      }
    };

    footerMenuCategoriesNav.addEventListener('click', handleCategoryClick);
    footerMenuCategoriesNav.addEventListener('keydown', handleCategoryKeydown);

    teardownCallbacks.push(() => {
      footerMenuCategoriesNav.removeEventListener('click', handleCategoryClick);
      footerMenuCategoriesNav.removeEventListener('keydown', handleCategoryKeydown);
    });
  }

  function handleFooterMenuItemAction(item) {
    if (!(item instanceof HTMLElementRef)) {
      return;
    }

    const viewName = item.dataset.view;
    const highlightAppId = item.dataset.highlightAppId || item.dataset.miniappId;
    const action = item.dataset.action;

    if (action && action !== 'preferences-language') {
      closeLanguagePicker();
    }

    if (action === 'preferences-theme') {
      const snapshot =
        typeof runtime.getCurrentPreferences === 'function' ? runtime.getCurrentPreferences() : null;
      const currentTheme = snapshot?.theme ?? 'auto';
      const nextTheme = getNextValue(currentTheme, THEME_SEQUENCE);
      const updatePromise =
        typeof runtime.updateUserPreferences === 'function'
          ? runtime.updateUserPreferences({ theme: nextTheme }, { window: win, document: doc })
          : null;
      if (updatePromise && typeof updatePromise.catch === 'function') {
        updatePromise.catch((error) => {
          console.error('Preferências: falha ao alternar tema pelo atalho rápido.', error);
        });
      }
      return;
    }

    if (action === 'preferences-font') {
      const snapshot =
        typeof runtime.getCurrentPreferences === 'function' ? runtime.getCurrentPreferences() : null;
      const currentFontScale = snapshot?.fontScale ?? 0;
      const nextFontScale = getNextValue(currentFontScale, FONT_SCALE_SEQUENCE);
      const updatePromise =
        typeof runtime.updateUserPreferences === 'function'
          ? runtime.updateUserPreferences({ fontScale: nextFontScale }, { window: win, document: doc })
          : null;
      if (updatePromise && typeof updatePromise.catch === 'function') {
        updatePromise.catch((error) => {
          console.error('Preferências: falha ao alternar tamanho de fonte pelo atalho rápido.', error);
        });
      }
      return;
    }

    if (action === 'preferences-language') {
      toggleLanguagePicker();
      return;
    }

    if (viewName) {
      closeFooterMenu();
      renderAuthView(viewName, {
        shouldFocus: true,
        viewProps: highlightAppId ? { highlightAppId } : {},
      });
      return;
    }

  }

  if (ensureHtmlElement(doc, footerMenuPanel)) {
    const handlePanelClick = (event) => {
      const target = event.target instanceof HTMLElementRef ? event.target.closest('.auth-shell__menu-item') : null;
      if (!target) {
        return;
      }

      event.preventDefault();
      handleFooterMenuItemAction(target);
    };

    const handlePanelKeydown = (event) => {
      handleFooterMenuItemKeydown(event);
    };

    footerMenuPanel.addEventListener('click', handlePanelClick);
    footerMenuPanel.addEventListener('keydown', handlePanelKeydown);

    teardownCallbacks.push(() => {
      footerMenuPanel.removeEventListener('click', handlePanelClick);
      footerMenuPanel.removeEventListener('keydown', handlePanelKeydown);
    });
  }

  refreshFooterMenuItems();

  function focusFirstInteractiveElement(root) {
    if (!(root instanceof HTMLElementRef)) {
      return;
    }

    const focusable = root.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusable instanceof HTMLElementRef) {
      focusWithoutScreenShift(doc, win, focusable);
    }
  }

  function updateHint(viewName) {
    if (!(statusHint instanceof HTMLElementRef)) {
      return;
    }

    const viewConfig = VIEW_RENDERERS[viewName];
    if (viewConfig?.hint) {
      statusHint.textContent = viewConfig.hint;
    }
  }

  function setActiveViewToggle(viewName) {
    viewToggleButtons.forEach((button) => {
      if (!(button instanceof HTMLElementRef)) {
        return;
      }

      const isActive = button.dataset.view === viewName;
      button.classList.toggle('is-active', isActive);
      if (button.hasAttribute('aria-current')) {
        button.setAttribute('aria-current', isActive ? 'page' : 'false');
      }
      if (button.hasAttribute('aria-selected')) {
        button.setAttribute('aria-selected', String(isActive));
      }
      if (button.hasAttribute('aria-pressed')) {
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
    });
  }

  function renderAuthView(viewName, { shouldFocus = true, viewProps = {} } = {}) {
    closeFooterMenu();

    if (!(viewRoot instanceof HTMLElementRef)) {
      return;
    }

    const viewConfig = VIEW_RENDERERS[viewName];
    if (!viewConfig) {
      return;
    }

    const teardown = viewRoot[VIEW_CLEANUP_KEY];
    if (typeof teardown === 'function') {
      try {
        teardown();
      } catch (error) {
        console.error('Erro ao encerrar a view anterior.', error);
      }
    }
    viewRoot[VIEW_CLEANUP_KEY] = null;

    viewRoot.hidden = false;
    viewRoot.className = 'auth-screen__view';
    viewRoot.dataset.view = viewName;
    viewRoot.replaceChildren();
    viewConfig.render(viewRoot, viewProps);
    viewRoot.classList.add('auth-screen__view');
    currentView = viewName;

    setActiveViewToggle(viewName);
    setActiveFooterMenuItem(viewName);
    updateHint(viewName);

    if (ensureHtmlElement(doc, authScreen)) {
      authScreen.setAttribute('data-active-view', viewName);
    }

    if (shouldFocus) {
      runtime.queueTask(() => focusFirstInteractiveElement(viewRoot));
    }
  }

  function handleAppNavigate(payload) {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    const { view, viewProps, shouldFocus = true } = payload;
    if (typeof view !== 'string') {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(VIEW_RENDERERS, view)) {
      renderAuthView(view, { shouldFocus, viewProps });
    }
  }

  viewToggleButtons.forEach((button) => {
    if (!(button instanceof HTMLElementRef)) {
      return;
    }

    const handleClick = () => {
      const viewName = button.dataset.view;
      if (viewName) {
        renderAuthView(viewName, { shouldFocus: true });
      }
    };

    button.addEventListener('click', handleClick);
    teardownCallbacks.push(() => {
      button.removeEventListener('click', handleClick);
    });
  });

  const unsubscribeAppNavigate = runtime.eventBus?.on('app:navigate', handleAppNavigate);
  if (typeof unsubscribeAppNavigate === 'function') {
    teardownCallbacks.push(unsubscribeAppNavigate);
  }

  renderAuthView('guest', { shouldFocus: false });

  const versionTarget = doc.querySelector('[data-app-version]');
  const currentYearTarget = doc.querySelector('[data-current-year]');

  if (ensureHtmlElement(doc, currentYearTarget)) {
    currentYearTarget.textContent = String(new Date().getFullYear());
  }

  async function loadAppVersion() {
    if (!runtime.fetch) {
      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = 'indisponível';
      }
      return null;
    }

    const VERSION_RESOURCE = './meta/app-version.json';

    try {
      const response = await runtime.fetch(VERSION_RESOURCE, { cache: 'no-store' });

      if (!response.ok) {
        if (ensureHtmlElement(doc, versionTarget)) {
          versionTarget.textContent = 'indisponível';
        }
        return null;
      }

      const payload = await response.json();
      const version = typeof payload?.version === 'string' ? payload.version.trim() : '';

      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = version ? `v${version}` : 'em desenvolvimento';
      }

      return version || null;
    } catch (error) {
      console.warn('Não foi possível carregar a versão do aplicativo.', error);
      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = 'indisponível';
      }
      return null;
    }
  }

  async function setupPwaSupport() {
    const version = await loadAppVersion();
    try {
      await runtime.registerServiceWorker(version);
    } catch (error) {
      console.error('Falha ao configurar os recursos PWA.', error);
    }
  }

  setupPwaSupport();

  return {
    destroy() {
      while (teardownCallbacks.length) {
        const teardown = teardownCallbacks.pop();
        try {
          teardown?.();
        } catch (error) {
          console.error('Erro ao encerrar listener da shell de autenticação.', error);
        }
      }
    },
  };
}

export default {
  initAuthShell,
};
