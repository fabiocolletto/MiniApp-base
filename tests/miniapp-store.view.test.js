import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createDomEnvironment } from './helpers/dom-env.js';
import { createMiniAppCard, renderMiniAppStore } from '../scripts/views/miniapp-store.js';

let env;

beforeEach(() => {
  env = createDomEnvironment();
});

afterEach(() => {
  env?.restore?.();
  env = null;
});

test('createMiniAppCard respeita estados iniciais e confirma alternância de salvos', async () => {
  const app = {
    id: 'Task-Manager',
    name: 'Gestão de Trabalho',
  };

  const preferencesSnapshot = {
    userId: 42,
    saved: ['task-manager'],
    favorites: [],
  };

  const toggleCalls = [];
  const card = createMiniAppCard(app, {
    preferencesSnapshot,
    onToggleSaved: ({ id, nextState }) => {
      toggleCalls.push({ id, nextState });
      return Promise.resolve({
        saved: nextState,
        preferences: { saved: nextState ? [id] : [], favorites: [] },
      });
    },
  });

  env.document.body.append(card.element);

  const saveButton = card.controls.save;
  assert.equal(saveButton.getAttribute('aria-pressed'), 'true');
  assert.equal(saveButton.dataset.state, 'active');

  saveButton.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(toggleCalls.length, 1);
  assert.deepEqual(toggleCalls[0], { id: 'task-manager', nextState: false });
  assert.equal(saveButton.getAttribute('aria-pressed'), 'false');
  assert.equal(saveButton.dataset.state, 'inactive');
  assert.ok(!saveButton.hasAttribute('data-busy'));
});

test('createMiniAppCard bloqueia ações quando não há sessão ativa', () => {
  const app = {
    id: 'exam-planner',
    name: 'Criador de Provas',
  };

  const card = createMiniAppCard(app, {
    preferencesSnapshot: { userId: null, saved: [], favorites: [] },
  });

  env.document.body.append(card.element);

  assert.equal(card.controls.save.disabled, true);
  assert.equal(card.controls.favorite.disabled, true);
  assert.equal(card.controls.save.dataset.feedback, 'Faça login para gerenciar seus MiniApps.');
  assert.equal(card.controls.favorite.dataset.feedback, 'Faça login para gerenciar seus MiniApps.');
});

test('renderMiniAppStore monta layout, ativa destaque e alterna conversas', async () => {
  const target = env.document.createElement('div');
  env.document.body.append(target);

  const highlights = [];
  renderMiniAppStore(target, {
    highlightAppId: 'exam-planner',
    onHighlight: (payload) => {
      highlights.push(payload?.id ?? null);
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  const layout = target.querySelector('.chat-shell');
  assert.ok(layout);
  assert.equal(layout.dataset.sidebarOpen, 'false');

  const activeConversation = target.querySelector('.chat-shell__conversation-item.is-active');
  assert.ok(activeConversation);
  assert.equal(activeConversation.querySelector('.chat-shell__conversation-button').dataset.appId, 'exam-planner');

  const highlightedCard = target.querySelector('.miniapp-store__item--highlight');
  assert.ok(highlightedCard);
  assert.equal(highlightedCard.dataset.appId, 'exam-planner');

  const sidebarToggle = target.querySelector('.chat-shell__sidebar-toggle');
  sidebarToggle.click();
  assert.equal(layout.dataset.sidebarOpen, 'true');
  sidebarToggle.click();
  assert.equal(layout.dataset.sidebarOpen, 'false');

  const otherConversationButton = target.querySelector('.chat-shell__conversation-button[data-app-id="task-manager"]');
  assert.ok(otherConversationButton);
  otherConversationButton.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const newActive = target.querySelector('.chat-shell__conversation-item.is-active');
  assert.ok(newActive);
  assert.equal(newActive.querySelector('.chat-shell__conversation-button').dataset.appId, 'task-manager');

  const newHighlight = target.querySelector('.miniapp-store__item--highlight');
  assert.ok(newHighlight);
  assert.equal(newHighlight.dataset.appId, 'task-manager');

  assert.ok(highlights.includes('exam-planner'));
  assert.ok(highlights.includes('task-manager'));
});
