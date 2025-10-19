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

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const logo = document.querySelector('.header-logo');
const headerTitle = document.querySelector('.header-title');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const registerLink = document.querySelector('.header-register-link');
const legalButton = document.querySelector('.footer-legal');

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

renderView('greeting');
