import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

const originalNavigator = globalThis.navigator;

const modulePath = '../../scripts/pwa/register-service-worker.js';

async function importModule() {
  return import(modulePath);
}

afterEach(() => {
  if (originalNavigator === undefined) {
    delete globalThis.navigator;
  } else {
    globalThis.navigator = originalNavigator;
  }
});

test('retorna null quando service workers não são suportados', async () => {
  delete globalThis.navigator;
  const { registerServiceWorker } = await importModule();
  const result = await registerServiceWorker('1.0.0');
  assert.equal(result, null);
});

test('registra o service worker com a versão informada', async () => {
  let capturedUrl = null;
  globalThis.navigator = {
    serviceWorker: {
      async register(url) {
        capturedUrl = url;
        return { scope: '/' };
      },
    },
  };

  const { registerServiceWorker, buildServiceWorkerUrl } = await importModule();
  const expectedUrl = buildServiceWorkerUrl('1.2.3');
  const result = await registerServiceWorker('1.2.3');

  assert.deepEqual(result, { scope: '/' });
  assert.equal(capturedUrl, expectedUrl);
  assert.equal(expectedUrl.includes('1.2.3'), true);
});

test('usa identificador padrão quando a versão está vazia', async () => {
  let capturedUrl = null;
  globalThis.navigator = {
    serviceWorker: {
      async register(url) {
        capturedUrl = url;
        return { scope: '/' };
      },
    },
  };

  const { registerServiceWorker, buildServiceWorkerUrl } = await importModule();
  const expectedUrl = buildServiceWorkerUrl('');

  await registerServiceWorker('');
  assert.equal(capturedUrl, expectedUrl);
  assert.equal(expectedUrl.endsWith('=dev'), true);
});
