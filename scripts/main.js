import { renderGreeting } from './views/greeting.js';
import { renderAdmin } from './views/admin.js';
import { renderLog } from './views/log.js';
import { renderHome } from './views/home.js';
import { renderNotFound } from './views/not-found.js';
import { renderUserPanel } from './views/user.js';
import { renderLoginPanel } from './views/login.js';
import { renderRegisterPanel } from './views/register.js';
import { renderLegal } from './views/legal.js';
import { runViewCleanup } from './view-cleanup.js';
import { subscribeSession } from './data/session-store.js';
import { getStorageStatus, subscribeStorageStatus } from './data/user-store.js';

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const logo = document.querySelector('.header-logo');
const headerTitle = document.querySelector('.header-title');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const registerLink = document.querySelector('.header-register-link');
const legalButton = document.querySelector('.footer-legal');
const headerActions = document.querySelector('.header-actions');
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');

let headerUserButton = null;

function getHeaderUserButton() {
  if (headerUserButton) {
    return headerUserButton;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'header-action header-action--avatar';
  button.addEventListener('click', () => {
    renderView('user');
  });

  headerUserButton = button;
  return headerUserButton;
}

function extractInitials(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : '';
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  const phone = typeof user?.phone === 'string' ? user.phone.replace(/\D+/g, '') : '';
  if (phone.length >= 2) {
    return phone.slice(-2).toUpperCase();
  }

  return 'US';
}

function formatUserLabel(user) {
  const name = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : null;
  const phone = typeof user?.phone === 'string' && user.phone.trim() ? user.phone.trim() : null;

  if (name && phone) {
    return `Abrir painel do usuário ${name} (${phone})`;
  }

  if (name) {
    return `Abrir painel do usuário ${name}`;
  }

  if (phone) {
    return `Abrir painel do usuário com telefone ${phone}`;
  }

  return 'Abrir painel do usuário';
}

function setLinkVisibility(link, isVisible) {
  if (!(link instanceof HTMLElement)) {
    return;
  }

  if (isVisible) {
    link.hidden = false;
    link.removeAttribute('aria-hidden');
    link.removeAttribute('tabindex');
    link.style.removeProperty('display');
    return;
  }

  link.hidden = true;
  link.setAttribute('aria-hidden', 'true');
  link.setAttribute('tabindex', '-1');
  link.style.display = 'none';
}

function updateHeaderSession(user) {
  const isAuthenticated = Boolean(user);

  setLinkVisibility(loginLink, !isAuthenticated);
  setLinkVisibility(registerLink, !isAuthenticated);

  if (!isAuthenticated) {
    if (headerUserButton?.isConnected) {
      headerUserButton.remove();
    }
    return;
  }

  const button = getHeaderUserButton();
  const initials = extractInitials(user);
  const label = formatUserLabel(user);

  button.textContent = initials;
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);

  if (!button.isConnected && headerActions instanceof HTMLElement) {
    headerActions.append(button);
  }
}

function updateMemoryStatus(status) {
  if (!(memoryIndicator instanceof HTMLElement) || !(memoryIndicatorText instanceof HTMLElement)) {
    return;
  }

  const state = typeof status?.state === 'string' ? status.state : 'loading';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Memória IndexedDB · carregando';
  const details =
    typeof status?.details === 'string' && status.details.trim() ? status.details.trim() : '';

  memoryIndicator.dataset.state = state;
  memoryIndicatorText.textContent = message;

  if (details) {
    memoryIndicator.setAttribute('title', details);
    memoryIndicator.setAttribute('aria-label', `${message}. ${details}`);
  } else {
    memoryIndicator.removeAttribute('title');
    memoryIndicator.setAttribute('aria-label', message);
  }
}

const views = {
  greeting: renderGreeting,
  admin: renderAdmin,
  log: renderLog,
  home: renderHome,
  user: renderUserPanel,
  login: renderLoginPanel,
  register: renderRegisterPanel,
  legal: renderLegal,
};

let allowPreventScrollOption = true;

function focusViewRoot() {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  if (allowPreventScrollOption) {
    try {
      viewRoot.focus({ preventScroll: true });
      return;
    } catch (error) {
      allowPreventScrollOption = false;
    }
  }

  viewRoot.focus();
}

export function renderView(name) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const isAdminView = name === 'admin';
  const isUserView = name === 'user';
  const isLoginView = name === 'login';
  const isRegisterView = name === 'register';

  mainElement?.classList.toggle('main--admin', isAdminView);
  mainElement?.classList.toggle('main--user', isUserView);
  mainElement?.classList.toggle('main--login', isLoginView);
  mainElement?.classList.toggle('main--register', isRegisterView);

  const view = views[name];

  runViewCleanup(viewRoot);

  if (typeof view !== 'function') {
    console.warn(`View "${name}" não encontrada.`);
    renderNotFound(viewRoot, name);
    focusViewRoot();
    return;
  }

  viewRoot.dataset.view = name;
  view(viewRoot);
  focusViewRoot();
}

logo?.addEventListener('click', () => renderView('admin'));
versionButton?.addEventListener('click', () => renderView('log'));
headerTitle?.addEventListener('click', () => renderView('home'));
loginLink?.addEventListener('click', (event) => {
  event.preventDefault();
  renderView('login');
});
registerLink?.addEventListener('click', (event) => {
  event.preventDefault();
  renderView('register');
});
legalButton?.addEventListener('click', () => renderView('legal'));

document.addEventListener('app:navigate', (event) => {
  const viewName = event?.detail?.view;
  if (typeof viewName === 'string') {
    renderView(viewName);
  }
});

subscribeSession((user) => {
  updateHeaderSession(user);
});

if (memoryIndicator instanceof HTMLElement && memoryIndicatorText instanceof HTMLElement) {
  updateMemoryStatus(getStorageStatus());
  subscribeStorageStatus((status) => {
    updateMemoryStatus(status);
  });
}

renderView('greeting');
