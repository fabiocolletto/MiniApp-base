import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { randomUUID, randomFillSync } from 'node:crypto';
import { createDomEnvironment } from './helpers/dom-env.js';
import { initAuthShell } from '../scripts/app/auth-shell.js';
import { WHITE_LABEL_IDENTITY } from '../scripts/app/white-label-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const indexHtml = readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

function resolveRequest(input) {
  const request = typeof input === 'string' ? input : input?.url ?? '';
  try {
    const url = new URL(request, 'http://localhost');
    if (url.protocol === 'file:') {
      return fileURLToPath(url);
    }
    return path.join(ROOT, url.pathname.replace(/^\/+/, ''));
  } catch {
    return path.join(ROOT, request.replace(/^\/+/, ''));
  }
}

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

async function waitFor(condition, { timeout = 2_000, interval = 25 } = {}) {
  const started = Date.now();
  for (;;) {
    const result = condition();
    if (result) {
      return result;
    }
    if (Date.now() - started >= timeout) {
      throw new Error('Tempo limite excedido ao aguardar condição de teste.');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

test('painel do Ripple exibe filtros e pré-visualização da prova de História no shell base', async (t) => {
  const env = createDomEnvironment({ html: indexHtml });
  let envRestored = false;
  t.after(() => {
    if (!envRestored) {
      env.restore();
    }
  });

  const ResponseCtor = env.window.Response ?? globalThis.Response;
  if (typeof globalThis.Response === 'undefined' && ResponseCtor) {
    globalThis.Response = ResponseCtor;
    t.after(() => {
      delete globalThis.Response;
    });
  }

  const originalFetch = globalThis.fetch;
  const fetchStub = async (input) => {
    const request = typeof input === 'string' ? input : input?.url ?? '';
    if (request.includes('meta/app-version.json')) {
      const payload = JSON.stringify({ version: '4.0.1-test' });
      return new ResponseCtor(payload, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = resolveRequest(request);
    const data = await readFile(filePath, 'utf-8');
    let contentType = 'application/json';
    if (filePath.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filePath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    }
    return new ResponseCtor(data, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  };

  globalThis.fetch = fetchStub;
  env.window.fetch = fetchStub;
  t.after(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete globalThis.fetch;
    }
    if (originalFetch) {
      env.window.fetch = originalFetch.bind(env.window);
    } else {
      delete env.window.fetch;
    }
  });

  const ensureOptionsList = (element) => {
    if (!element) {
      return [];
    }
    if (!element._rippleOptions) {
      element._rippleOptions = [];
    }
    return element._rippleOptions;
  };

  if (!Object.getOwnPropertyDescriptor(env.window.HTMLElement.prototype, 'options')) {
    Object.defineProperty(env.window.HTMLElement.prototype, 'options', {
      configurable: true,
      get() {
        if (this.tagName === 'SELECT') {
          return ensureOptionsList(this);
        }
        return undefined;
      },
    });
  }

  const originalAppendChild = env.window.Node.prototype.appendChild;
  const originalInsertBefore = env.window.Node.prototype.insertBefore;
  const originalRemoveChild = env.window.Node.prototype.removeChild;

  env.window.Node.prototype.appendChild = function patchedAppendChild(node) {
    const result = originalAppendChild.call(this, node);
    if (this.tagName === 'SELECT' && node && node.tagName === 'OPTION') {
      const list = ensureOptionsList(this);
      if (!list.includes(node)) {
        list.push(node);
      }
    }
    return result;
  };

  env.window.Node.prototype.insertBefore = function patchedInsertBefore(node, reference) {
    const result = originalInsertBefore.call(this, node, reference);
    if (this.tagName === 'SELECT' && node && node.tagName === 'OPTION') {
      const list = ensureOptionsList(this);
      const index = reference ? list.indexOf(reference) : -1;
      if (index >= 0) {
        list.splice(index, 0, node);
      } else if (!list.includes(node)) {
        list.push(node);
      }
    }
    return result;
  };

  env.window.Node.prototype.removeChild = function patchedRemoveChild(node) {
    const result = originalRemoveChild.call(this, node);
    if (this.tagName === 'SELECT' && node && node.tagName === 'OPTION') {
      const list = ensureOptionsList(this);
      const index = list.indexOf(node);
      if (index >= 0) {
        list.splice(index, 1);
      }
    }
    return result;
  };

  t.after(() => {
    env.window.Node.prototype.appendChild = originalAppendChild;
    env.window.Node.prototype.insertBefore = originalInsertBefore;
    env.window.Node.prototype.removeChild = originalRemoveChild;
  });

  const originalCrypto = globalThis.crypto;
  if (!originalCrypto || typeof originalCrypto.randomUUID !== 'function') {
    globalThis.crypto = {
      randomUUID: () => randomUUID(),
      getRandomValues: (array) => {
        randomFillSync(array);
        return array;
      },
    };
    t.after(() => {
      if (originalCrypto) {
        globalThis.crypto = originalCrypto;
      } else {
        delete globalThis.crypto;
      }
    });
  }

  const originalRaf = globalThis.requestAnimationFrame;
  const originalCaf = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 16);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  t.after(() => {
    if (originalRaf) {
      globalThis.requestAnimationFrame = originalRaf;
    } else {
      delete globalThis.requestAnimationFrame;
    }
    if (originalCaf) {
      globalThis.cancelAnimationFrame = originalCaf;
    } else {
      delete globalThis.cancelAnimationFrame;
    }
  });

  if (!env.window.matchMedia) {
    const matchMediaStub = (query) => ({
      media: String(query),
      matches: false,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
    env.window.matchMedia = matchMediaStub;
    globalThis.matchMedia = matchMediaStub;
    t.after(() => {
      delete env.window.matchMedia;
      delete globalThis.matchMedia;
    });
  }

  if (!env.window.ShadowRoot) {
    class MiniShadowRoot {}
    env.window.ShadowRoot = MiniShadowRoot;
    globalThis.ShadowRoot = MiniShadowRoot;
    t.after(() => {
      delete env.window.ShadowRoot;
      delete globalThis.ShadowRoot;
    });
  }

  if (typeof env.window.HTMLIFrameElement === 'undefined') {
    class MiniHTMLIFrameElement extends env.window.HTMLElement {}
    env.window.HTMLIFrameElement = MiniHTMLIFrameElement;
    globalThis.HTMLIFrameElement = MiniHTMLIFrameElement;
    t.after(() => {
      delete env.window.HTMLIFrameElement;
      delete globalThis.HTMLIFrameElement;
    });
  }

  if (!env.window.ResizeObserver) {
    class MiniResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    env.window.ResizeObserver = MiniResizeObserver;
    globalThis.ResizeObserver = MiniResizeObserver;
    t.after(() => {
      delete env.window.ResizeObserver;
      delete globalThis.ResizeObserver;
    });
  }

  const rippleModuleUrl = pathToFileURL(path.join(ROOT, 'miniapps/education/ripple/index.js'));
  const rippleModule = await import(rippleModuleUrl.href);

  const loadMiniApp = async (id, options = {}) => {
    assert.equal(id, 'primary');
    const targetSelector = options.targetSelector ?? '#content';
    const target = options.target ?? env.document.querySelector(targetSelector);
    assert.ok(target, 'Elemento alvo do MiniApp não encontrado.');
    await rippleModule.mount(target);
    return { entry: { id } };
  };

  const shell = initAuthShell({
    window: env.window,
    document: env.document,
    fetch: fetchStub,
    registerServiceWorker: async () => {},
    eventBus: createEventBus(),
    loadMiniApp,
  });

  t.after(() => {
    shell?.destroy?.();
  });

  await waitFor(() => {
    const host = env.document.querySelector('[data-miniapp-host="primary"]');
    return host && host.dataset.miniappLoaded === 'true';
  });

  await waitFor(() => env.document.querySelector('.ripple-preview__title-input'));
  await waitFor(() => env.document.querySelector('.ripple-item-card'));

  const host = env.document.querySelector('[data-miniapp-host="primary"]');
  assert.ok(host, 'Host do MiniApp não encontrado no shell.');
  assert.equal(host.dataset.miniappLoaded, 'true');

  const heading = env.document.querySelector('.auth-view__title');
  assert.ok(heading);
  assert.equal(heading.textContent.trim(), WHITE_LABEL_IDENTITY.shortName);

  const layout = host.querySelector('.ripple-layout');
  assert.ok(layout, 'Layout principal do Ripple não foi renderizado.');

  const layoutChildren = Array.from(layout.children);
  assert.equal(layoutChildren.length, 2, 'Layout deveria ter painel de filtros e coluna principal.');

  const filtersPanel = layoutChildren[0];
  assert.equal(filtersPanel.querySelector('.ripple-panel__title')?.textContent.trim(), 'Filtros da prova');

  const filterDiscipline = filtersPanel.querySelector('#rippleFilterDisciplina');
  assert.ok(filterDiscipline, 'Select de disciplina não encontrado.');
  const disciplineOptions = Array.from(filterDiscipline.querySelectorAll('option')).map((node) =>
    node.textContent?.trim(),
  );
  assert.ok(disciplineOptions.includes('História'));

  const mainColumn = layoutChildren[1];
  assert.ok(mainColumn.classList.contains('ripple-column'), 'Coluna principal não foi renderizada.');

  const summaryHeading = Array.from(mainColumn.querySelectorAll('.ripple-panel__title')).find(
    (node) => node.textContent?.trim() === 'Resumo da prova',
  );
  assert.ok(summaryHeading, 'Resumo da prova não está disponível na coluna principal.');

  const previewPanel = mainColumn.querySelector('.ripple-preview');
  assert.ok(previewPanel, 'Painel de pré-visualização não foi renderizado.');

  const titleInput = previewPanel.querySelector('.ripple-preview__title-input');
  assert.ok(titleInput, 'Campo de título da prova não está presente.');
  assert.equal(titleInput.value, 'Prova de História EF8');

  const firstQuestion = previewPanel.querySelector('.ripple-item-card');
  assert.ok(firstQuestion, 'Nenhum item da prova foi carregado.');
  assert.match(firstQuestion.textContent ?? '', /Inconfidência Mineira/, 'Prova de História não carregada.');

  const exportButtons = mainColumn.querySelectorAll('.ripple-export button');
  assert.equal(exportButtons.length, 2, 'Botões de exportação não foram renderizados.');

  shell?.destroy?.();
  await new Promise((resolve) => setTimeout(resolve, 50));
  env.restore();
  envRestored = true;
});
