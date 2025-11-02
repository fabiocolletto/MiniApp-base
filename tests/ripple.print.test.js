import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { randomUUID, randomFillSync } from 'node:crypto';
import { createDomEnvironment } from './helpers/dom-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function resolveRequest(input) {
  const request = typeof input === 'string' ? input : input.url;
  try {
    const parsed = new URL(request, 'http://localhost');
    if (parsed.protocol === 'file:') {
      return fileURLToPath(parsed);
    }
    return path.join(ROOT, parsed.pathname.replace(/^\/+/, ''));
  } catch {
    return path.join(ROOT, request.replace(/^\/+/, ''));
  }
}

test('impressão do Ripple alterna modos de aluno e professor na prova de História', async (t) => {
  const env = createDomEnvironment({
    html: '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
  });

  t.after(() => {
    env.restore();
  });

  const originalFetch = globalThis.fetch;
  t.after(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete globalThis.fetch;
    }
  });
  globalThis.fetch = async (input) => {
    const filePath = resolveRequest(input);
    const data = await readFile(filePath, 'utf-8');
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  if (typeof globalThis.Response === 'undefined') {
    globalThis.Response = env.window.Response;
    t.after(() => {
      delete globalThis.Response;
    });
  }

  if (typeof globalThis.Document === 'undefined' && env.window.Document) {
    globalThis.Document = env.window.Document;
    t.after(() => {
      delete globalThis.Document;
    });
  }

  if (typeof env.window.HTMLIFrameElement === 'undefined') {
    class MiniHTMLIFrameElement extends env.window.HTMLElement {}
    env.window.HTMLIFrameElement = MiniHTMLIFrameElement;
  }

  if (typeof globalThis.HTMLIFrameElement === 'undefined') {
    globalThis.HTMLIFrameElement = env.window.HTMLIFrameElement;
    t.after(() => {
      delete globalThis.HTMLIFrameElement;
    });
  }

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
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
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

  const printCalls = [];
  const originalPrint = env.window.print;
  env.window.print = () => {
    printCalls.push(Date.now());
  };
  globalThis.print = env.window.print;
  t.after(() => {
    env.window.print = originalPrint;
    if (originalPrint) {
      globalThis.print = originalPrint.bind(env.window);
    } else {
      delete globalThis.print;
    }
  });

  const moduleUrl = pathToFileURL(path.join(ROOT, 'miniapps/education/ripple/index.js'));
  const { mount } = await import(moduleUrl.href);

  const host = env.document.getElementById('app');
  assert.ok(host, 'host do miniapp não encontrado');

  await mount(host);
  await new Promise((resolve) => setTimeout(resolve, 600));

  const titleInput = env.document.querySelector('.ripple-preview__title-input');
  assert.ok(titleInput, 'campo de título não foi renderizado');
  assert.equal(titleInput.value, 'Prova de História EF8');

  const firstItem = env.document.querySelector('.ripple-item-card');
  assert.ok(firstItem, 'nenhum item da prova foi carregado');
  assert.ok(
    firstItem.textContent && firstItem.textContent.includes('Inconfidência Mineira'),
    'prova de História não foi carregada corretamente',
  );

  const exportButtons = env.document.querySelectorAll('.ripple-export button');
  assert.equal(exportButtons.length, 2, 'botões de exportação não foram renderizados');

  const container = env.document.querySelector('.ripple-app');
  assert.ok(container, 'contêiner principal do Ripple não encontrado');

  const answerKey = env.document.querySelector('[data-teacher-only]');
  assert.ok(answerKey, 'gabarito não está disponível na prova carregada');

  exportButtons[0].dispatchEvent(new env.window.Event('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 120));

  assert.ok(
    container.classList.contains('ripple-print-mode--student'),
    'modo de impressão para alunos não foi aplicado',
  );
  assert.equal(printCalls.length, 1, 'impressão do modo aluno não foi acionada');

  const stylesheet = env.document.querySelector('link[data-ripple-print-style]');
  assert.ok(stylesheet, 'folha de estilos de impressão não foi anexada');
  assert.equal(stylesheet.href, '/assets/print/prova.css');

  env.window.dispatchEvent(new env.window.Event('afterprint'));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(
    !container.classList.contains('ripple-print-mode--student'),
    'modo aluno deveria ser limpo após o evento afterprint',
  );

  exportButtons[1].dispatchEvent(new env.window.Event('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 120));

  assert.ok(
    container.classList.contains('ripple-print-mode--teacher'),
    'modo de impressão para professores não foi aplicado',
  );
  assert.equal(printCalls.length, 2, 'impressão do modo professor não foi acionada');
  assert.ok(
    answerKey.textContent && answerKey.textContent.includes('Gabarito'),
    'gabarito deveria permanecer disponível no modo professor',
  );

  env.window.dispatchEvent(new env.window.Event('afterprint'));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(
    !container.classList.contains('ripple-print-mode--teacher'),
    'modo professor deveria ser limpo após o evento afterprint',
  );
});
