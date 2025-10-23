import test from 'node:test';
import assert from 'node:assert/strict';

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.tokens = new Set();
  }

  _sync() {
    const value = Array.from(this.tokens).join(' ');
    this.element._setClassName(value);
  }

  add(...classNames) {
    classNames
      .flatMap((token) => (typeof token === 'string' ? token.split(/\s+/) : []))
      .filter(Boolean)
      .forEach((token) => this.tokens.add(token));
    this._sync();
  }

  remove(...classNames) {
    classNames
      .flatMap((token) => (typeof token === 'string' ? token.split(/\s+/) : []))
      .filter(Boolean)
      .forEach((token) => this.tokens.delete(token));
    this._sync();
  }

  toggle(token, force) {
    if (!token) {
      return false;
    }

    if (force === true) {
      this.add(token);
      return true;
    }

    if (force === false) {
      this.remove(token);
      return false;
    }

    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      this._sync();
      return false;
    }

    this.tokens.add(token);
    this._sync();
    return true;
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toString() {
    return Array.from(this.tokens).join(' ');
  }
}

class FakeElement {
  constructor(tagName = '', namespaceURI = null) {
    this.tagName = String(tagName || '').toUpperCase();
    this.namespaceURI = namespaceURI;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.dataset = {};
    this.eventListeners = new Map();
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.value = '';
    this.style = {};
    this._className = '';
    this.classList = new FakeClassList(this);
  }

  _setClassName(value) {
    this._className = value;
    if (value) {
      this.attributes.set('class', value);
    } else {
      this.attributes.delete('class');
    }
  }

  get className() {
    return this._className;
  }

  set className(value) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    this.classList.tokens = new Set(normalized ? normalized.split(/\s+/).filter(Boolean) : []);
    this._setClassName(Array.from(this.classList.tokens).join(' '));
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (!node) {
        return;
      }
      if (typeof node === 'string') {
        const textNode = new FakeElement('#text', this.namespaceURI);
        textNode.textContent = node;
        textNode.parentNode = this;
        this.children.push(textNode);
        return;
      }
      if (node instanceof FakeElement) {
        node.parentNode = this;
        this.children.push(node);
      }
    });
  }

  replaceChildren(...nodes) {
    this.children.forEach((child) => {
      if (child instanceof FakeElement && child.parentNode === this) {
        child.parentNode = null;
      }
    });
    this.children = [];
    this.append(...nodes);
  }

  setAttribute(name, value) {
    if (name === 'class') {
      this.className = value;
      return;
    }
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    if (name === 'class') {
      this.className = '';
      return;
    }
    this.attributes.delete(name);
  }

  addEventListener(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
      return;
    }
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(handler);
  }

  querySelector(selector) {
    return this._query(selector, true) ?? null;
  }

  querySelectorAll(selector) {
    const results = [];
    this._query(selector, false, results);
    return results;
  }

  _query(selector, findFirst, results = []) {
    for (const child of this.children) {
      if (!(child instanceof FakeElement)) {
        continue;
      }
      if (child._matches(selector)) {
        if (findFirst) {
          return child;
        }
        results.push(child);
      }
      const descendant = child._query(selector, findFirst, results);
      if (findFirst && descendant) {
        return descendant;
      }
    }
    return findFirst ? null : results;
  }

  _matches(selector) {
    if (!selector) {
      return false;
    }

    if (selector.startsWith('.')) {
      const classes = selector
        .split('.')
        .slice(1)
        .filter(Boolean);
      return classes.every((token) => this.classList.contains(token));
    }

    const [tagToken, ...classTokens] = selector.split('.');
    if (tagToken && this.tagName.toLowerCase() !== tagToken.toLowerCase()) {
      return false;
    }
    return classTokens.every((token) => this.classList.contains(token));
  }
}

class FakeDocument {
  createElement(tagName) {
    const element = new FakeElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  createElementNS(namespaceURI, tagName) {
    const element = new FakeElement(tagName, namespaceURI);
    element.ownerDocument = this;
    return element;
  }
}

function findElement(root, predicate) {
  if (!root || typeof predicate !== 'function') {
    return null;
  }
  if (predicate(root)) {
    return root;
  }
  for (const child of root.children) {
    if (!(child instanceof FakeElement)) {
      continue;
    }
    const result = findElement(child, predicate);
    if (result) {
      return result;
    }
  }
  return null;
}

test('renderUserPanel monta preferências de tema e formulário principais com atalho ativo', async (t) => {
  const fakeDocument = new FakeDocument();
  globalThis.document = fakeDocument;
  globalThis.HTMLElement = FakeElement;

  t.after(() => {
    delete globalThis.document;
    delete globalThis.HTMLElement;
  });

  const { renderUserPanel } = await import('../scripts/views/user.js');

  const viewRoot = fakeDocument.createElement('div');
  renderUserPanel(viewRoot);

  assert.equal(
    viewRoot.querySelector('.user-panel__title'),
    null,
    'o painel não deve exibir título textual ao iniciar',
  );
  assert.equal(
    viewRoot.querySelector('.user-panel__intro'),
    null,
    'o painel não deve exibir subtítulo textual ao iniciar',
  );

  const layout = viewRoot.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-panel__layout'),
  );
  assert.ok(layout, 'layout principal não foi renderizado');
  assert.equal(layout.children.length, 3, 'o painel deve renderizar três widgets principais');

  const [firstWidget, secondWidget, thirdWidget] = layout.children;
  assert.ok(
    firstWidget instanceof FakeElement && firstWidget.classList.contains('user-dashboard__widget--theme'),
    'o widget de preferências de tema deve ser o primeiro item do painel',
  );
  assert.equal(
    firstWidget.dataset.sectionId,
    'theme',
    'a seção de tema deve indicar identificador semântico',
  );
  assert.equal(
    firstWidget.dataset.sectionState,
    'expanded',
    'a seção de tema deve iniciar expandida para destacar as ações rápidas',
  );
  assert.ok(
    secondWidget instanceof FakeElement && secondWidget.classList.contains('user-panel__widget--access'),
    'o widget de acesso e sessão deve ocupar a segunda posição do painel',
  );
  assert.equal(
    secondWidget.dataset.sectionId,
    'access',
    'a seção de acesso deve indicar identificador semântico',
  );
  assert.ok(
    thirdWidget instanceof FakeElement && thirdWidget.classList.contains('user-dashboard__widget--user-data'),
    'o widget de dados do usuário deve ocupar a terceira posição do painel',
  );
  assert.equal(
    thirdWidget.dataset.sectionId,
    'user-data',
    'a seção de dados do usuário deve indicar identificador semântico',
  );

  const themeWidget = layout.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-dashboard__widget--theme'),
  );
  assert.ok(themeWidget, 'widget de preferências de tema não foi renderizado');

  const themeAccordionToggle = themeWidget.querySelector('.user-panel__section-toggle');
  assert.ok(themeAccordionToggle, 'o widget de tema deve expor controle de acordeão');

  const actionList = themeWidget.querySelector('.user-dashboard__action-list');
  assert.ok(actionList, 'a lista de ações rápidas deve estar visível no widget de tema');

  assert.equal(actionList.children.length, 1, 'o widget de tema deve exibir apenas o atalho de alternância');

  const themeToggleButton = findElement(actionList, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__quick-action-button--theme'),
  );
  assert.ok(themeToggleButton, 'botão de alternância de tema deve estar disponível no painel');

  const accountWidget = layout.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-dashboard__widget--user-data'),
  );
  assert.ok(accountWidget, 'widget de dados do usuário não foi renderizado');

  assert.equal(
    accountWidget.dataset.sectionState,
    'empty',
    'o widget de dados do usuário deve iniciar no estado "empty" sem sessão ativa',
  );

  const accountToggle = accountWidget.querySelector('.user-panel__section-toggle');
  assert.equal(accountToggle, null, 'o widget de dados do usuário não deve expor controle de acordeão no cabeçalho');

  const summary = findElement(accountWidget, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__summary'),
  );
  assert.ok(summary, 'o resumo dos dados principais deve estar presente');
  assert.equal(summary.hidden, true, 'o resumo deve permanecer oculto enquanto não houver sessão ativa');

  const summaryList = findElement(summary, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__summary-list'),
  );
  assert.ok(summaryList, 'a lista do resumo precisa ser renderizada dentro do widget');
  assert.equal(
    summaryList.hidden,
    true,
    'a lista do resumo deve permanecer oculta enquanto não houver sessão ativa',
  );

  const userDataActions = findElement(accountWidget, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__user-data-actions'),
  );
  assert.ok(userDataActions, 'o widget precisa expor a área de ações abaixo do resumo');

  const editButton = findElement(userDataActions, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__user-data-edit'),
  );
  assert.ok(editButton, 'botão de edição deve existir na área de ações');
  assert.equal(editButton.disabled, true, 'botão de edição deve permanecer desabilitado sem sessão ativa');
  assert.equal(
    editButton.getAttribute('aria-controls'),
    'user-dashboard-form',
    'botão de edição deve apontar para o formulário de dados do usuário',
  );
  assert.equal(
    editButton.getAttribute('aria-expanded'),
    'false',
    'botão de edição deve iniciar indicando o formulário recolhido',
  );
  assert.ok(
    editButton.classList.contains('button'),
    'botão de edição deve seguir o padrão global de botões',
  );
  assert.ok(
    editButton.classList.contains('button--primary'),
    'botão de edição deve utilizar a variação primária do padrão de botões',
  );

  const toggleButton = findElement(userDataActions, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__user-data-toggle'),
  );
  assert.equal(toggleButton, null, 'o botão "Mais opções" deve ser removido da área de ações');

  const emptyState = findElement(accountWidget, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__empty-state'),
  );
  assert.ok(emptyState, 'mensagem de ausência de sessão deve estar disponível');

  const form = accountWidget.querySelector('form.user-form');
  assert.ok(form, 'formulário principal não foi encontrado');
  assert.equal(form.hidden, true, 'formulário deve iniciar oculto até que a edição seja acionada');

  const accessWidget = layout.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-panel__widget--access'),
  );
  assert.ok(accessWidget, 'widget de controle de acesso não foi renderizado');
  assert.equal(
    accessWidget.dataset.state,
    'empty',
    'widget de acesso deve iniciar no estado "empty" sem sessão ativa',
  );

  const accessActionList = findElement(
    accessWidget,
    (node) => node instanceof FakeElement && node.classList.contains('user-dashboard__action-list'),
  );
  assert.ok(accessActionList, 'lista de ações deve estar disponível no widget de acesso');
  assert.equal(accessActionList.children.length, 4, 'widget de acesso deve exibir quatro ações rápidas');

  const accessButtons = accessActionList.querySelectorAll('button');
  assert.equal(accessButtons.length, 4, 'quatro botões precisam estar presentes no widget de acesso');
  const buttonActions = accessButtons.map((button) => button.dataset.action);
  assert.deepEqual(
    buttonActions,
    ['logoff', 'logout', 'switch-user', 'erase-data'],
    'as ações devem seguir a ordem logoff, logout, troca de usuário e exclusão de dados',
  );

  const logoffButton = accessButtons.find((button) => button.dataset.action === 'logoff');
  assert.ok(logoffButton, 'botão de logoff deve existir');
  assert.equal(logoffButton.disabled, true, 'logoff deve iniciar desabilitado sem sessão ativa');

  const switchButton = accessButtons.find((button) => button.dataset.action === 'switch-user');
  assert.ok(switchButton, 'botão de troca de usuário deve existir');
  assert.equal(
    switchButton.disabled,
    false,
    'botão de troca de usuário deve permanecer disponível para abrir a tela de login mesmo sem sessão ativa',
  );
});
