import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDomEnvironment } from './helpers/dom-env.js';

import { initAuthShell } from '../scripts/app/auth-shell.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderAccountDashboard } from '../scripts/views/account-dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

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
    renderRegisterPanel,
    renderAccountDashboard,
  });

  const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

  return {
    dom: env.dom,
    shell,
    window: env.window,
    document: env.document,
    getRegisteredVersion: () => registeredVersion,
    flushAsync,
    restore: env.restore,
  };
}

function teardownShell(env) {
  env.shell?.destroy?.();
  env.restore?.();
}

test('inicializa o shell com painel Educação estático e sem MiniApps listados', async () => {
  const env = setupShell();
  try {
    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.ok(viewRoot);
    assert.equal(viewRoot.dataset.view, 'guest');

    const educationHome = env.document.querySelector('.education-home__container');
    assert.ok(educationHome);
    assert.match(educationHome.textContent, /Bem-vindo ao MiniApp da 5 horas, Educação/);

    const legacyList = env.document.querySelectorAll('.guest-panel__item, .miniapp-store');
    assert.equal(legacyList.length, 0);

    const footerLabel = env.document.querySelector('[data-active-view-label]');
    assert.ok(footerLabel);
    assert.match(footerLabel.textContent, /Painel atual: MiniApp Educação/);

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
    const themeLabel = themeButton.getAttribute('aria-label');
    assert.ok(themeLabel);
    assert.ok(themeLabel.includes('Tema atual'));
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
    const languageLabel = languageButton.getAttribute('aria-label');
    assert.ok(languageLabel);
    assert.ok(languageLabel.includes('Idioma atual'));
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

test('atalhos rápidos alternam tema, idioma e tamanho do texto imediatamente', async () => {
  const env = setupShell();
  try {
    await env.flushAsync();

    const docEl = env.document.documentElement;
    assert.equal(docEl.dataset.theme, undefined);
    assert.equal(docEl.getAttribute('data-lang') ?? 'pt-BR', 'pt-BR');
    assert.equal((docEl.lang && docEl.lang.trim()) || 'pt-BR', 'pt-BR');

    const readFontScale = () => {
      const style = docEl.style;
      if (style && typeof style.getPropertyValue === 'function') {
        return style.getPropertyValue('--ac-font-scale');
      }
      if (style && typeof style === 'object' && Object.prototype.hasOwnProperty.call(style, '--ac-font-scale')) {
        return style['--ac-font-scale'];
      }
      const inline = docEl.getAttribute('style');
      if (typeof inline === 'string') {
        const entry = inline
          .split(';')
          .map((item) => item.trim())
          .find((item) => item && item.startsWith('--ac-font-scale:'));
        if (entry) {
          const [, value = ''] = entry.split(':');
          return value.trim();
        }
      }
      return '';
    };
    const fontScaleLabels = new Map([
      ['0.9', 'Muito pequeno'],
      ['0.95', 'Pequeno'],
      ['1', 'Padrão'],
      ['1.1', 'Grande'],
      ['1.25', 'Muito grande'],
    ]);
    const themeLabels = new Map([
      ['auto', 'Automático'],
      ['light', 'Claro'],
      ['dark', 'Escuro'],
    ]);
    const languageLabels = new Map([
      ['pt-BR', 'Português (Brasil)'],
      ['en', 'Inglês'],
      ['es', 'Espanhol'],
    ]);

    const previousTheme = docEl.dataset.theme || 'auto';
    const previousLang = docEl.getAttribute('data-lang') || 'pt-BR';
    const previousFontScale = readFontScale() || '1';
    assert.equal(previousFontScale || '1', '1');

    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    menuButton.click();

    await env.flushAsync();

    const themeButton = env.document.querySelector('[data-action="preferences-theme"]');
    const fontButton = env.document.querySelector('[data-action="preferences-font"]');
    const languageButton = env.document.querySelector('[data-action="preferences-language"]');

    assert.ok(themeButton);
    assert.ok(fontButton);
    assert.ok(languageButton);

    themeButton.click();
    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
    assert.equal(env.document.getElementById('authFooterMenu').hidden, true);
    const nextTheme = docEl.dataset.theme || 'auto';
    assert.ok(themeLabels.has(nextTheme));
    assert.notEqual(nextTheme, previousTheme);

    menuButton.click();
    await env.flushAsync();

    fontButton.click();
    await env.flushAsync();

    const fontHint = env.document.querySelector('[data-pref-font-scale-value]');
    assert.ok(fontHint);
    const nextFontScale = readFontScale();
    assert.notEqual(nextFontScale, previousFontScale);
    const expectedFontLabel = fontScaleLabels.get(nextFontScale) ?? '';
    if (expectedFontLabel) {
      assert.equal(fontHint.textContent.trim(), expectedFontLabel);
    }

    menuButton.click();
    await env.flushAsync();

    languageButton.click();
    await env.flushAsync();

    assert.equal(docEl.dataset.theme, nextTheme);
    const nextLang = docEl.getAttribute('data-lang') || 'pt-BR';
    assert.notEqual(nextLang, previousLang);
    assert.ok(languageLabels.has(nextLang));
    assert.equal(docEl.lang || nextLang, nextLang);

    menuButton.click();
    await env.flushAsync();

    const updatedThemeButton = env.document.querySelector('[data-action="preferences-theme"]');
    const updatedLanguageButton = env.document.querySelector('[data-action="preferences-language"]');
    assert.ok(updatedThemeButton);
    assert.ok(updatedLanguageButton);
    const themeLabel = updatedThemeButton.getAttribute('aria-label');
    assert.ok(themeLabel);
    const expectedThemeLabel = themeLabels.get(nextTheme) ?? '';
    if (expectedThemeLabel) {
      assert.ok(themeLabel.includes(expectedThemeLabel));
    }
    const languageLabel = updatedLanguageButton.getAttribute('aria-label');
    assert.ok(languageLabel);
    const expectedLanguageLabel = languageLabels.get(nextLang) ?? '';
    if (expectedLanguageLabel) {
      assert.ok(languageLabel.includes(expectedLanguageLabel));
    }
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

