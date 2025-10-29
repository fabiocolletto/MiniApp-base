import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { initAuthShell, buildMiniAppDocPath } from '../scripts/app/auth-shell.js';
import { renderMiniAppStore } from '../scripts/views/miniapp-store.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderAccountDashboard } from '../scripts/views/account-dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

const originalGlobals = {
  window: global.window,
  document: global.document,
  HTMLElement: global.HTMLElement,
  Node: global.Node,
  KeyboardEvent: global.KeyboardEvent,
  HTMLBodyElement: global.HTMLBodyElement,
  navigator: global.navigator,
};

function attachDomGlobals(window) {
  global.window = window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.KeyboardEvent = window.KeyboardEvent;
  global.HTMLBodyElement = window.HTMLBodyElement;
  global.navigator = window.navigator;
}

function restoreGlobals() {
  Object.entries(originalGlobals).forEach(([key, value]) => {
    if (typeof value === 'undefined') {
      delete global[key];
    } else {
      global[key] = value;
    }
  });
}

const SAMPLE_MINI_APPS = [
  {
    id: 'task-manager',
    name: 'Gestão de Trabalho',
    description:
      'Organize o backlog, acompanhe indicadores de execução e detalhe cada entrega com checklists contextualizados.',
    status: 'active',
    access: ['usuario', 'administrador'],
    category: 'Produtividade',
    updatedAt: '2025-10-25T15:03:00-03:00',
    releaseDate: '2025-10-20T12:00:00-03:00',
  },
  {
    id: 'exam-planner',
    name: 'Criador de Provas',
    description:
      'Monte provas alinhadas à BNCC com banco de questões por competência, controle de turmas e indicadores de preparação.',
    status: 'active',
    access: ['usuario'],
    category: 'Educação',
    updatedAt: '2025-10-26T10:10:00-03:00',
    releaseDate: '2025-10-22T09:00:00-03:00',
  },
  {
    id: 'internal-tool',
    name: 'Ferramenta Interna',
    description: 'Uso restrito para o time.',
    status: 'testing',
    access: ['administrador'],
    category: 'Interno',
    updatedAt: '2025-10-28T09:00:00-03:00',
    releaseDate: '2025-10-28T09:00:00-03:00',
  },
];

function createEventBus() {
  const listeners = new Map();
  return {
    on(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      const group = listeners.get(eventName);
      group.add(handler);
      return () => {
        group.delete(handler);
      };
    },
    emit(eventName, payload) {
      const group = listeners.get(eventName);
      if (!group) {
        return;
      }
      group.forEach((handler) => {
        handler(payload);
      });
    },
  };
}

function setupShell({ url = 'http://localhost/', prepare } = {}) {
  const dom = new JSDOM(indexHtml, {
    url,
    pretendToBeVisual: true,
  });

  attachDomGlobals(dom.window);

  if (typeof prepare === 'function') {
    prepare(dom.window);
  }

  const miniAppsSnapshot = JSON.parse(JSON.stringify(SAMPLE_MINI_APPS));
  const getMiniAppsSnapshot = () => miniAppsSnapshot;
  const subscribeMiniApps = (listener) => {
    listener(miniAppsSnapshot);
    return () => {};
  };

  let registeredVersion = null;
  const registerServiceWorker = async (version) => {
    registeredVersion = version;
  };

  const fetchMock = async (resource) => {
    if (typeof resource === 'string' && resource.endsWith('package.json')) {
      return {
        ok: true,
        json: async () => ({ version: '1.2.3' }),
      };
    }

    throw new Error(`Unexpected fetch for resource: ${resource}`);
  };

  const shell = initAuthShell({
    window: dom.window,
    document: dom.window.document,
    fetch: fetchMock,
    registerServiceWorker,
    eventBus: createEventBus(),
    renderMiniAppStore,
    renderRegisterPanel,
    renderAccountDashboard,
    getMiniAppsSnapshot,
    subscribeMiniApps,
  });

  const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

  return {
    dom,
    shell,
    window: dom.window,
    document: dom.window.document,
    getRegisteredVersion: () => registeredVersion,
    flushAsync,
    miniAppsSnapshot,
  };
}

function teardownShell(env) {
  env.shell?.destroy?.();
  env.dom?.window?.close?.();
  restoreGlobals();
}

test('inicializa o shell com painel de convidado e dois MiniApps ativos', async () => {
  const env = setupShell();
  try {
    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.ok(viewRoot);
    assert.equal(viewRoot.dataset.view, 'guest');

    const miniAppItems = [...env.document.querySelectorAll('.guest-panel__item')];
    assert.equal(miniAppItems.length, 2);
    const ids = miniAppItems.map((item) => item.dataset.appId).sort();
    assert.deepEqual(ids, ['exam-planner', 'task-manager']);

    const footerLabel = env.document.querySelector('[data-active-view-label]');
    assert.ok(footerLabel);
    assert.match(footerLabel.textContent, /Painel atual: Explorar como convidado/);

    await env.flushAsync();

    const versionLabel = env.document.querySelector('[data-app-version]');
    assert.ok(versionLabel);
    assert.equal(versionLabel.textContent, 'v1.2.3');
    assert.equal(env.getRegisteredVersion(), '1.2.3');
  } finally {
    teardownShell(env);
  }
});

test('alterna para a tela de cadastro ao clicar no botão correspondente', async () => {
  const env = setupShell();
  try {
    const registerButton = env.document.querySelector('.auth-selector__button[data-view="register"]');
    assert.ok(registerButton);
    registerButton.click();

    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.equal(viewRoot.dataset.view, 'register');
  } finally {
    teardownShell(env);
  }
});

test('abre o menu do rodapé e mantém o foco no primeiro item', async () => {
  const env = setupShell();
  try {
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');

    menuButton.click();

    const panel = env.document.getElementById('authFooterMenu');
    assert.ok(panel);
    assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.hidden, false);

    const firstItem = panel.querySelector('.auth-shell__menu-item');
    assert.ok(firstItem);
    assert.strictEqual(env.document.activeElement, firstItem);
  } finally {
    teardownShell(env);
  }
});

test('selecionar um MiniApp no menu abre a MiniApp Store destacando o item', async () => {
  const env = setupShell();
  try {
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    menuButton.click();

    const miniAppTrigger = env.document.querySelector('#authFooterMenu [data-miniapp-id="exam-planner"]');
    assert.ok(miniAppTrigger);
    miniAppTrigger.click();

    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.equal(viewRoot.dataset.view, 'miniapps');

    const highlight = env.document.querySelector('.miniapp-store__item--highlight');
    assert.ok(highlight);
    assert.equal(highlight.dataset.appId, 'exam-planner');
  } finally {
    teardownShell(env);
  }
});

test('processa o parâmetro ?app= com redirecionamento para a documentação quando o MiniApp existe', async () => {
  let redirectedTo = null;

  const env = setupShell({
    url: 'http://localhost/?app=task-manager',
    prepare(window) {
      window.location.replace = (href) => {
        redirectedTo = href;
      };
    },
  });
  try {
    await env.flushAsync();

    assert.equal(redirectedTo, buildMiniAppDocPath('task-manager'));
  } finally {
    teardownShell(env);
  }
});

test('quando o MiniApp solicitado não existe o shell destaca o catálogo e atualiza a dica', async () => {
  const env = setupShell({ url: 'http://localhost/?app=unknown-app' });
  try {
    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.equal(viewRoot.dataset.view, 'miniapps');

    const statusHint = env.document.getElementById('statusHint');
    assert.ok(statusHint);
    assert.match(statusHint.textContent, /MiniApp "unknown-app" destacado/);
  } finally {
    teardownShell(env);
  }
});
