import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDomEnvironment } from './helpers/dom-env.js';

import { initAuthShell, buildMiniAppDocPath } from '../scripts/app/auth-shell.js';
import { renderMiniAppStore } from '../scripts/views/miniapp-store.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderAccountDashboard } from '../scripts/views/account-dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

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
    id: '   ',
    name: 'MiniApp Sem Identificador',
    description: 'Cadastro temporário em validação.',
    status: 'active',
    access: ['usuario'],
    category: 'Teste',
    updatedAt: '2025-10-27T12:00:00-03:00',
    releaseDate: '2025-10-27T12:00:00-03:00',
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
  const env = createDomEnvironment({ html: indexHtml, url });

  if (typeof prepare === 'function') {
    prepare(env.window);
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
    if (typeof resource === 'string' && resource.includes('meta/app-version.json')) {
      return {
        ok: true,
        json: async () => ({ version: '1.2.3' }),
      };
    }

    throw new Error(`Unexpected fetch for resource: ${resource}`);
  };

  const shell = initAuthShell({
    window: env.window,
    document: env.document,
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
    dom: env.dom,
    shell,
    window: env.window,
    document: env.document,
    getRegisteredVersion: () => registeredVersion,
    flushAsync,
    miniAppsSnapshot,
    restore: env.restore,
  };
}

function teardownShell(env) {
  env.shell?.destroy?.();
  env.restore?.();
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
    miniAppItems.forEach((item) => {
      const link = item.querySelector('.guest-panel__cta');
      assert.ok(link);
      assert.equal(link.href.includes('/miniapp.md'), false);
    });

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

test('abre o menu do rodapé exibindo atalhos rápidos de personalização', async () => {
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

    const overlay = env.document.querySelector('[data-menu-overlay]');
    assert.ok(overlay);
    assert.equal(overlay.hidden, false);

    const items = panel.querySelectorAll('.auth-shell__menu-item');
    assert.equal(items.length, 4);

    const [themeButton, fontButton, languageButton, settingsButton] = items;
    assert.ok(themeButton);
    assert.equal(themeButton.dataset.action, 'preferences-theme');
    assert.equal(themeButton.dataset.prefFocus, 'theme');
    assert.ok(fontButton);
    assert.equal(fontButton.dataset.action, 'preferences-font');
    assert.equal(fontButton.dataset.prefFocus, 'fontScale');
    const fontHint = fontButton.querySelector('[data-pref-font-scale-value]');
    assert.ok(fontHint);
    assert.equal(fontHint.textContent.trim(), 'Padrão');
    const fontLabel = fontButton.getAttribute('aria-label');
    assert.ok(fontLabel);
    assert.ok(fontLabel.includes('Escala atual'));
    assert.ok(languageButton);
    assert.equal(languageButton.dataset.action, 'preferences-language');
    assert.equal(languageButton.dataset.prefFocus, 'lang');
    assert.ok(settingsButton);
    assert.equal(settingsButton.dataset.action, 'preferences');
    assert.strictEqual(env.document.activeElement, themeButton);

    themeButton.click();

    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
    assert.equal(panel.hidden, true);
    assert.equal(overlay.hidden, true);
  } finally {
    teardownShell(env);
  }
});

test('fecha o menu do rodapé ao clicar novamente no botão do painel', async () => {
  const env = setupShell();
  try {
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);

    menuButton.click();

    const panel = env.document.getElementById('authFooterMenu');
    assert.ok(panel);
    assert.equal(panel.hidden, false);

    const overlay = env.document.querySelector('[data-menu-overlay]');
    assert.ok(overlay);
    assert.equal(overlay.hidden, false);

    menuButton.click();

    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
    assert.equal(panel.hidden, true);
    assert.equal(overlay.hidden, true);
  } finally {
    teardownShell(env);
  }
});

test('menu não exibe toggles de widgets ou atalhos de MiniApps', async () => {
  const env = setupShell();
  try {
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    menuButton.click();

    const toggles = env.document.querySelectorAll('.auth-shell__menu-toggle-input');
    assert.equal(toggles.length, 0);

    const miniAppTriggers = env.document.querySelectorAll('#authFooterMenu [data-miniapp-id]');
    assert.equal(miniAppTriggers.length, 0);
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
