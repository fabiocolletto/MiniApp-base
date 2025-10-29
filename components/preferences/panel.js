import {
  getCurrentPreferences,
  updateUserPreferences,
  subscribeUserPreferences,
  getFontScaleLabel,
} from '../../scripts/preferences/user-preferences.js';

let templateMarkup = null;
let overlayElement;
let panelElement;
let formElement;
let closeButton;
let fontScaleLabelElement;
let unsubscribe;
let lastFocusedElement;
let docRef;
let winRef;
let resourcesLoaded = false;
let panelInitialized = false;

function resolveWindow(customWindow) {
  if (customWindow && typeof customWindow === 'object') {
    return customWindow;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  return undefined;
}

function resolveDocument(customDocument, runtimeWindow = resolveWindow()) {
  if (customDocument && typeof customDocument === 'object') {
    return customDocument;
  }
  if (runtimeWindow && typeof runtimeWindow.document === 'object') {
    return runtimeWindow.document;
  }
  if (typeof document !== 'undefined') {
    return document;
  }
  return undefined;
}

async function ensureTemplate(doc) {
  if (templateMarkup) {
    return templateMarkup;
  }

  const response = await fetch('./components/preferences/panel.html', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar panel.html (HTTP ${response.status}).`);
  }

  templateMarkup = await response.text();
  return templateMarkup;
}

function ensureStyles(doc) {
  if (resourcesLoaded) {
    return;
  }

  const head = doc.head || doc.querySelector('head');
  if (!head) {
    return;
  }

  const existing = head.querySelector('link[data-pref-panel-style]');
  if (existing) {
    resourcesLoaded = true;
    return;
  }

  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = './components/preferences/panel.css';
  link.dataset.prefPanelStyle = 'true';
  head.append(link);
  resourcesLoaded = true;
}

function renderPanel(doc) {
  if (panelInitialized) {
    return;
  }

  const template = doc.createElement('template');
  template.innerHTML = templateMarkup.trim();
  const fragment = template.content.firstElementChild;
  if (!fragment) {
    throw new Error('Markup do painel de preferências inválida.');
  }

  overlayElement = fragment;
  panelElement = overlayElement.querySelector('.preferences-panel');
  formElement = overlayElement.querySelector('[data-pref-form]');
  closeButton = overlayElement.querySelector('[data-pref-close]');
  fontScaleLabelElement = overlayElement.querySelector('[data-font-scale-label]');

  if (panelElement) {
    panelElement.setAttribute('tabindex', '-1');
  }

  if (!formElement) {
    throw new Error('Formulário de preferências não encontrado.');
  }

  overlayElement.hidden = true;
  doc.body.append(overlayElement);
  attachEventListeners();
  panelInitialized = true;
}

function attachEventListeners() {
  if (!overlayElement || !formElement) {
    return;
  }

  overlayElement.addEventListener('pointerdown', handleOverlayPointerDown);
  overlayElement.addEventListener('keydown', handleOverlayKeydown);
  formElement.addEventListener('change', handleFormChange);
  formElement.addEventListener('input', handleFormInput);
  formElement.addEventListener('submit', (event) => event.preventDefault());

  if (closeButton) {
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      closePreferencesPanel();
    });
  }
}

function detachSubscription() {
  if (typeof unsubscribe === 'function') {
    unsubscribe();
    unsubscribe = null;
  }
}

function getFocusableElements() {
  if (!panelElement) {
    return [];
  }

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([type="hidden"]):not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(panelElement.querySelectorAll(focusableSelectors.join(',')));
}

function handleOverlayKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closePreferencesPanel();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    panelElement?.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = (overlayElement?.ownerDocument ?? document).activeElement;

  if (event.shiftKey) {
    if (active === first || !panelElement?.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

function handleOverlayPointerDown(event) {
  if (!overlayElement || !panelElement) {
    return;
  }

  if (!panelElement.contains(event.target)) {
    closePreferencesPanel();
  }
}

function handleFormChange(event) {
  const target = event.target;
  if (!target) {
    return;
  }

  const defaultView = target.ownerDocument?.defaultView;
  if (!defaultView || !(target instanceof defaultView.HTMLElement)) {
    return;
  }

  const { name } = target;
  if (!name) {
    return;
  }

  if (name === 'fontScale') {
    return;
  }

  if (name === 'theme' || name === 'density') {
    const value = target.value;
    updateUserPreferences({ [name]: value }, { window: winRef, document: docRef }).catch((error) => {
      console.error('Preferências: falha ao atualizar valor.', error);
    });
    return;
  }

  if (name === 'lang') {
    updateUserPreferences({ lang: target.value }, { window: winRef, document: docRef }).catch((error) => {
      console.error('Preferências: falha ao atualizar idioma.', error);
    });
    return;
  }

  if (name === 'reduceMotion') {
    const checked = target.checked;
    updateUserPreferences({ reduceMotion: checked }, { window: winRef, document: docRef }).catch((error) => {
      console.error('Preferências: falha ao atualizar animações.', error);
    });
  }
}

function handleFormInput(event) {
  const target = event.target;
  if (!target || target.name !== 'fontScale') {
    return;
  }

  const value = Number.parseInt(target.value, 10);
  updateFontScaleLabel(value);
  updateUserPreferences({ fontScale: value }, { window: winRef, document: docRef }).catch((error) => {
    console.error('Preferências: falha ao atualizar escala de fonte.', error);
  });
}

function updateFontScaleLabel(value) {
  if (!formElement) {
    return;
  }

  const input = formElement.querySelector('input[name="fontScale"]');
  const label = getFontScaleLabel(value);

  if (input) {
    input.setAttribute('aria-valuetext', label ?? '');
    input.value = String(value);
  }

  if (fontScaleLabelElement) {
    fontScaleLabelElement.textContent = label ?? '';
  }
}

function populateForm(prefs) {
  if (!formElement) {
    return;
  }

  const { theme, lang, fontScale, density, reduceMotion } = prefs;

  const themeInputs = formElement.querySelectorAll('input[name="theme"]');
  themeInputs.forEach((input) => {
    input.checked = input.value === theme;
  });

  const langSelect = formElement.querySelector('select[name="lang"]');
  if (langSelect) {
    langSelect.value = lang;
  }

  updateFontScaleLabel(fontScale);

  const densityInputs = formElement.querySelectorAll('input[name="density"]');
  densityInputs.forEach((input) => {
    input.checked = input.value === density;
  });

  const reduceCheckbox = formElement.querySelector('input[name="reduceMotion"]');
  if (reduceCheckbox) {
    reduceCheckbox.checked = reduceMotion === true;
  }
}

function restoreFocus() {
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    try {
      lastFocusedElement.focus({ preventScroll: true });
    } catch (error) {
      lastFocusedElement.focus();
    }
  }
  lastFocusedElement = null;
}

export async function openPreferencesPanel(options = {}) {
  docRef = resolveDocument(options.document, options.window);
  winRef = resolveWindow(options.window);

  if (!docRef) {
    throw new Error('Documento não disponível para abrir o painel de preferências.');
  }

  ensureStyles(docRef);
  await ensureTemplate(docRef);
  renderPanel(docRef);

  populateForm(getCurrentPreferences());
  detachSubscription();
  unsubscribe = subscribeUserPreferences((snapshot) => {
    populateForm(snapshot);
  });

  overlayElement.hidden = false;
  if (docRef.body) {
    docRef.body.classList.add('preferences-panel-open');
  }
  lastFocusedElement = docRef.activeElement instanceof docRef.defaultView.HTMLElement ? docRef.activeElement : null;

  if (panelElement) {
    try {
      panelElement.focus({ preventScroll: true });
    } catch (error) {
      panelElement.focus();
    }
  }
}

export function closePreferencesPanel() {
  if (!overlayElement || overlayElement.hidden) {
    return;
  }

  overlayElement.hidden = true;
  docRef?.body?.classList.remove('preferences-panel-open');
  detachSubscription();
  restoreFocus();
}
