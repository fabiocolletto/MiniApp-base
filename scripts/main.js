import { renderGreeting } from './views/greeting.js';
import { renderAdmin } from './views/admin.js';
import { renderLog } from './views/log.js';
import { renderNotFound } from './views/not-found.js';

const viewRoot = document.getElementById('view-root');
const logo = document.querySelector('.header-logo');
const versionButton = document.querySelector('.footer-version');

const views = {
  greeting: renderGreeting,
  admin: renderAdmin,
  log: renderLog,
};

function focusViewRoot() {
  if (viewRoot instanceof HTMLElement) {
    viewRoot.focus({ preventScroll: true });
  }
}

export function renderView(name) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const view = views[name];

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

renderView('greeting');
