import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDomEnvironment } from './helpers/dom-env.js';

import { initAuthShell } from '../scripts/app/auth-shell.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderAccountDashboard } from '../scripts/views/account-dashboard.js';
import {
  WHITE_LABEL_IDENTITY,
  WHITE_LABEL_MINIAPP_CONTEXT,
} from '../scripts/app/white-label-config.js';

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

  const miniAppCalls = [];
  const loadMiniApp = async (id, options = {}) => {
    miniAppCalls.push({ id, options });

    const target = options.target ?? env.document.querySelector(options.targetSelector ?? '#content');
    if (target) {
      target.replaceChildren();
      target.dataset.miniappLoaded = 'true';
      const placeholder = env.document.createElement('p');
      placeholder.className = 'test-miniapp-placeholder';
      placeholder.textContent = `MiniApp ${id} montado para testes.`;
      target.append(placeholder);
    }

    return { entry: { id } };
  };

  const shell = initAuthShell({
    window: env.window,
    document: env.document,
    fetch: fetchMock,
    registerServiceWorker,
    eventBus: createEventBus(),
    renderRegisterPanel,
    renderAccountDashboard,
    loadMiniApp,
  });

  const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

  return {
    dom: env.dom,
    shell,
    window: env.window,
    document: env.document,
    getRegisteredVersion: () => registeredVersion,
    getMiniAppCalls: () => miniAppCalls.slice(),
    flushAsync,
    restore: env.restore,
  };
}

function teardownShell(env) {
  env.shell?.destroy?.();
  env.restore?.();
}

test('inicializa o shell white label com painel padrão e sem MiniApps listados', async () => {
  const env = setupShell();
  try {
    await env.flushAsync();

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.ok(viewRoot);
    assert.equal(viewRoot.dataset.view, 'guest');
    assert.equal(viewRoot.hidden, false);
    assert.ok(viewRoot.classList.contains('auth-screen__view'));
    assert.ok(viewRoot.classList.contains('auth-screen__view--surface'));

    const educationHome = env.document.querySelector('.education-home__container');
    assert.equal(educationHome, null);

    const guestView = viewRoot.querySelector('.auth-view.auth-view--guest');
    assert.ok(guestView);

    const guestTitle = guestView.querySelector('.auth-view__title');
    assert.ok(guestTitle);
    assert.equal(guestTitle.textContent.trim(), WHITE_LABEL_IDENTITY.shortName);

    const guestDescription = guestView.querySelector('.auth-view__description');
    assert.ok(guestDescription);
    assert.equal(guestDescription.textContent.trim(), WHITE_LABEL_IDENTITY.welcomeMessage);

    const statusHint = env.document.getElementById('statusHint');
    assert.ok(statusHint);
    assert.equal(statusHint.textContent.trim(), WHITE_LABEL_IDENTITY.guestHint);

    const miniAppHost = guestView.querySelector('[data-miniapp-host="primary"]');
    assert.ok(miniAppHost);
    assert.equal(miniAppHost.dataset.miniappLoaded ?? 'false', 'true');
    const placeholder = miniAppHost.querySelector('.test-miniapp-placeholder');
    assert.ok(placeholder);
    assert.match(placeholder.textContent, /MiniApp primary montado/);

    const miniAppCalls = env.getMiniAppCalls();
    assert.equal(miniAppCalls.length, 1);
    assert.equal(miniAppCalls[0].id, 'primary');
    assert.ok(miniAppCalls[0].options?.context);
    assert.equal(miniAppCalls[0].options.context.brandName, WHITE_LABEL_MINIAPP_CONTEXT.brandName);
    assert.equal(miniAppCalls[0].options.context.callToAction, WHITE_LABEL_MINIAPP_CONTEXT.callToAction);
    assert.equal(miniAppCalls[0].options.context.tagline, WHITE_LABEL_MINIAPP_CONTEXT.tagline);
    assert.deepEqual(miniAppCalls[0].options.context.highlights, WHITE_LABEL_MINIAPP_CONTEXT.highlights);
    assert.equal(miniAppCalls[0].options.context.ctaHref, WHITE_LABEL_MINIAPP_CONTEXT.ctaHref);
    assert.equal(miniAppCalls[0].options.context.window, env.window);
    assert.equal(miniAppCalls[0].options.context.document, env.document);

    const authScreen = env.document.querySelector('.auth-screen');
    assert.ok(authScreen);
    assert.equal(authScreen.dataset.activeView, 'guest');

    const widgetBoard = env.document.querySelector('.auth-widget-board');
    assert.equal(widgetBoard, null);

    const legacyList = env.document.querySelectorAll('.guest-panel__item, .miniapp-store');
    assert.equal(legacyList.length, 0);

    const footerLabel = env.document.querySelector('[data-active-view-label]');
    assert.ok(footerLabel);
    assert.match(footerLabel.textContent, /Painel atual: Visitante/);

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
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    menuButton.click();

    const registerButton = env.document.querySelector('[data-view-toggle][data-view="register"]');
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

    const tablist = panel.querySelector('[data-menu-tabs]');
    assert.ok(tablist);
    const userTab = tablist.querySelector('[data-menu-tab="user"]');
    const interfacesTab = tablist.querySelector('[data-menu-tab="interfaces"]');
    const settingsTab = tablist.querySelector('[data-menu-tab="settings"]');
    assert.ok(userTab);
    assert.ok(interfacesTab);
    assert.ok(settingsTab);
    assert.equal(userTab.getAttribute('aria-selected'), 'true');
    assert.equal(interfacesTab.getAttribute('aria-selected'), 'false');
    assert.equal(settingsTab.getAttribute('aria-selected'), 'false');

    const userSection = panel.querySelector('[data-menu-section="user"]');
    assert.ok(userSection);
    const userTitle = userSection.querySelector('.auth-shell__menu-section-title');
    assert.ok(userTitle);
    assert.equal(userTitle.textContent.trim(), 'Usuário');

    const interfacesSection = panel.querySelector('[data-menu-section="interfaces"]');
    assert.ok(interfacesSection);
    assert.equal(interfacesSection.hidden, true);
    assert.equal(interfacesSection.getAttribute('aria-hidden'), 'true');
    const interfaceButton = interfacesSection.querySelector('[data-action="open-miniapp"][data-miniapp-id="primary"]');
    assert.ok(interfaceButton);

    const settingsSection = panel.querySelector('[data-menu-section="settings"]');
    assert.ok(settingsSection);
    assert.equal(userSection.hidden, false);
    assert.equal(settingsSection.hidden, true);

    const registerButton = panel.querySelector('[data-view-toggle][data-view="register"]');
    const guestButton = panel.querySelector('[data-view-toggle][data-view="guest"]');
    assert.ok(registerButton);
    assert.ok(guestButton);
    assert.equal(registerButton.getAttribute('aria-current'), 'false');
    assert.equal(guestButton.getAttribute('aria-current'), 'page');
    assert.ok(guestButton.classList.contains('is-active'));
    assert.strictEqual(env.document.activeElement, registerButton);

    const themeButton = panel.querySelector('[data-action="preferences-theme"]');
    const fontButton = panel.querySelector('[data-action="preferences-font"]');
    const languageButton = panel.querySelector('[data-action="preferences-language"]');
    const languagePicker = panel.querySelector('[data-pref-language-picker]');
    assert.ok(themeButton);
    assert.ok(fontButton);
    assert.ok(languageButton);
    assert.ok(languagePicker);
    assert.equal(languagePicker.hidden, true);

    assert.equal(themeButton.dataset.prefFocus, 'theme');
    const themeLabel = themeButton.getAttribute('aria-label');
    assert.ok(themeLabel);
    assert.ok(themeLabel.includes('Tema atual'));

    assert.equal(fontButton.dataset.prefFocus, 'fontScale');
    const fontHint = fontButton.querySelector('[data-pref-font-scale-value]');
    assert.ok(fontHint);
    assert.equal(fontHint.textContent.trim(), 'Padrão');
    const fontLabel = fontButton.getAttribute('aria-label');
    assert.ok(fontLabel);
    assert.ok(fontLabel.includes('Escala atual'));

    assert.equal(languageButton.dataset.prefFocus, 'lang');
    const languageLabel = languageButton.getAttribute('aria-label');
    assert.ok(languageLabel);
    assert.ok(languageLabel.includes('Idioma atual'));

    themeButton.click();

    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.hidden, false);
    assert.equal(overlay.hidden, false);
  } finally {
    teardownShell(env);
  }
});

test('alternar abas do menu exibe apenas as ações da seção ativa', async () => {
  const env = setupShell();
  try {
    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    menuButton.click();

    const panel = env.document.getElementById('authFooterMenu');
    assert.ok(panel);

    const tablist = panel.querySelector('[data-menu-tabs]');
    assert.ok(tablist);
    const userTab = tablist.querySelector('[data-menu-tab="user"]');
    const interfacesTab = tablist.querySelector('[data-menu-tab="interfaces"]');
    const settingsTab = tablist.querySelector('[data-menu-tab="settings"]');
    assert.ok(userTab);
    assert.ok(interfacesTab);
    assert.ok(settingsTab);

    const userSection = panel.querySelector('[data-menu-section="user"]');
    const settingsSection = panel.querySelector('[data-menu-section="settings"]');
    const interfacesSection = panel.querySelector('[data-menu-section="interfaces"]');
    assert.ok(userSection);
    assert.ok(settingsSection);
    assert.ok(interfacesSection);

    assert.equal(userSection.hidden, false);
    assert.equal(settingsSection.hidden, true);
    assert.equal(interfacesSection.hidden, true);

    settingsTab.click();

    assert.equal(settingsTab.getAttribute('aria-selected'), 'true');
    assert.equal(userTab.getAttribute('aria-selected'), 'false');
    assert.equal(interfacesTab.getAttribute('aria-selected'), 'false');
    assert.equal(settingsSection.hidden, false);
    assert.equal(settingsSection.getAttribute('aria-hidden'), 'false');
    assert.equal(userSection.hidden, true);
    assert.equal(userSection.getAttribute('aria-hidden'), 'true');
    assert.equal(interfacesSection.hidden, true);
    assert.equal(interfacesSection.getAttribute('aria-hidden'), 'true');

    const themeButton = settingsSection.querySelector('[data-action="preferences-theme"]');
    const languageButton = settingsSection.querySelector('[data-action="preferences-language"]');
    const languagePicker = settingsSection.querySelector('[data-pref-language-picker]');
    assert.ok(themeButton);
    assert.ok(languageButton);
    assert.ok(languagePicker);
    assert.equal(languagePicker.hidden, true);

    languageButton.click();
    assert.equal(languagePicker.hidden, false);

    interfacesTab.click();

    assert.equal(interfacesTab.getAttribute('aria-selected'), 'true');
    assert.equal(settingsTab.getAttribute('aria-selected'), 'false');
    assert.equal(userTab.getAttribute('aria-selected'), 'false');
    assert.equal(interfacesSection.hidden, false);
    assert.equal(interfacesSection.getAttribute('aria-hidden'), 'false');
    assert.equal(settingsSection.hidden, true);
    assert.equal(settingsSection.getAttribute('aria-hidden'), 'true');
    assert.equal(userSection.hidden, true);
    assert.equal(userSection.getAttribute('aria-hidden'), 'true');
    const interfacesCta = interfacesSection.querySelector('[data-action="open-miniapp"][data-miniapp-id="primary"]');
    assert.ok(interfacesCta);
    assert.equal(languagePicker.hidden, true);

    userTab.click();

    assert.equal(userTab.getAttribute('aria-selected'), 'true');
    assert.equal(interfacesTab.getAttribute('aria-selected'), 'false');
    assert.equal(settingsTab.getAttribute('aria-selected'), 'false');
    assert.equal(userSection.hidden, false);
    assert.equal(userSection.getAttribute('aria-hidden'), 'false');
    assert.equal(settingsSection.hidden, true);
    assert.equal(settingsSection.getAttribute('aria-hidden'), 'true');
    assert.equal(interfacesSection.hidden, true);
    assert.equal(interfacesSection.getAttribute('aria-hidden'), 'true');
    assert.equal(languagePicker.hidden, true);
  } finally {
    teardownShell(env);
  }
});

test('aba Interfaces abre o criador de provas com foco no painel do MiniApp', async () => {
  const env = setupShell();
  try {
    await env.flushAsync();

    const menuButton = env.document.querySelector('.auth-shell__menu-button');
    assert.ok(menuButton);
    menuButton.click();

    const panel = env.document.getElementById('authFooterMenu');
    assert.ok(panel);

    const interfacesTab = panel.querySelector('[data-menu-tab="interfaces"]');
    assert.ok(interfacesTab);
    interfacesTab.click();

    const interfacesSection = panel.querySelector('[data-menu-section="interfaces"]');
    assert.ok(interfacesSection);
    assert.equal(interfacesSection.hidden, false);

    const openButton = interfacesSection.querySelector('[data-action="open-miniapp"][data-miniapp-id="primary"]');
    assert.ok(openButton);

    openButton.click();

    await env.flushAsync();
    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'false');

    const overlay = env.document.querySelector('[data-menu-overlay]');
    assert.ok(overlay);
    assert.equal(overlay.hidden, true);

    const viewRoot = env.document.getElementById('authViewRoot');
    assert.ok(viewRoot);
    assert.equal(viewRoot.dataset.view, 'guest');

    const miniAppHost = viewRoot.querySelector('[data-miniapp-host="primary"]');
    assert.ok(miniAppHost);
    assert.equal(miniAppHost.dataset.miniappHighlight, 'primary');
    assert.equal(miniAppHost.dataset.miniappLoaded, 'true');
    assert.strictEqual(env.document.activeElement, miniAppHost);

    const miniAppCalls = env.getMiniAppCalls();
    assert.ok(miniAppCalls.length >= 2);
    const lastCall = miniAppCalls[miniAppCalls.length - 1];
    assert.equal(lastCall.id, 'primary');
    assert.equal(lastCall.options?.target, miniAppHost);
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

    const panel = env.document.getElementById('authFooterMenu');
    assert.ok(panel);
    assert.equal(panel.hidden, false);

    const themeButton = env.document.querySelector('[data-action="preferences-theme"]');
    const fontButton = env.document.querySelector('[data-action="preferences-font"]');
    const languageButton = env.document.querySelector('[data-action="preferences-language"]');

    assert.ok(themeButton);
    assert.ok(fontButton);
    assert.ok(languageButton);

    themeButton.click();
    await env.flushAsync();

    assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.hidden, false);
    const nextTheme = docEl.dataset.theme || 'auto';
    assert.ok(themeLabels.has(nextTheme));
    assert.notEqual(nextTheme, previousTheme);

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

    languageButton.click();
    await env.flushAsync();

    const languagePicker = env.document.querySelector('[data-pref-language-picker]');
    assert.ok(languagePicker);
    assert.equal(languageButton.getAttribute('aria-expanded'), 'true');
    assert.equal(languagePicker.hidden, false);
    assert.equal(docEl.getAttribute('data-lang') || 'pt-BR', previousLang);

    const languageOptions = Array.from(languagePicker.querySelectorAll('[data-language-option]'));
    assert.ok(languageOptions.length >= 2);
    const targetOption = languageOptions.find((option) => option.dataset.languageOption !== previousLang);
    assert.ok(targetOption);
    const targetLanguage = targetOption.dataset.languageOption;

    targetOption.click();
    await env.flushAsync();

    assert.equal(languageButton.getAttribute('aria-expanded'), 'false');
    assert.equal(languagePicker.hidden, true);
    assert.equal(docEl.dataset.theme, nextTheme);
    const nextLang = docEl.getAttribute('data-lang') || 'pt-BR';
    assert.equal(nextLang, targetLanguage);
    assert.ok(languageLabels.has(nextLang));
    assert.equal(docEl.lang || nextLang, nextLang);

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

test('mantém o menu do rodapé aberto ao clicar novamente no botão do painel', async () => {
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

    assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.hidden, false);
    assert.equal(overlay.hidden, false);
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

    const miniAppTriggers = env.document.querySelectorAll(
      '#authFooterMenu [data-action="open-miniapp"][data-miniapp-id]'
    );
    const interfaceTriggers = Array.from(miniAppTriggers).filter(
      (miniAppTrigger) =>
        miniAppTrigger instanceof env.window.HTMLElement && miniAppTrigger.dataset?.miniappId
    );
    assert.ok(interfaceTriggers.length >= 1);
    interfaceTriggers.forEach((miniAppTrigger) => {
      assert.equal(miniAppTrigger.dataset.miniappId, 'primary');
      const triggerSection = miniAppTrigger.closest('[data-menu-section]');
      assert.ok(triggerSection);
      assert.equal(triggerSection.dataset.menuSection, 'interfaces');
    });
  } finally {
    teardownShell(env);
  }
});

