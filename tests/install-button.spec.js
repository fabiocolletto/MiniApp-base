const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4173/index.html';

async function openWithUserAgent(browser, userAgent, viewport) {
  const context = await browser.newContext({ userAgent, viewport });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  return { context, page };
}

test.describe('Botão "Instalar app"', () => {
  test('aciona o prompt nativo quando disponível (Android/Chromium)', async ({ browser }) => {
    const { context, page } = await openWithUserAgent(
      browser,
      'Mozilla/5.0 (Linux; Android 12; Pixel 7 Build/SP2A.220405.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      { width: 412, height: 915 }
    );

    await page.waitForSelector('#btn-install');

    await page.evaluate(() => {
      window.__promptCalled = false;
      const event = new Event('beforeinstallprompt');
      event.prompt = () => {
        window.__promptCalled = true;
        return Promise.resolve();
      };
      event.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    const hint = page.locator('.welcome-hint');
    await expect(hint).toContainText('Pronto para instalar');

    await page.click('#btn-install');
    await expect(hint).toContainText('Instalação iniciada');

    const promptCalled = await page.evaluate(() => window.__promptCalled);
    expect(promptCalled).toBe(true);

    await context.close();
  });

  test('exibe instruções manuais completas no iOS (sem prompt)', async ({ browser }) => {
    const { context, page } = await openWithUserAgent(
      browser,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      { width: 375, height: 667 }
    );

    await page.waitForSelector('#btn-install');
    await page.click('#btn-install');

    const hint = page.locator('.welcome-hint');
    await expect(hint).toContainText('No Android, use o menu do navegador');
    await expect(hint).toContainText('Compartilhar → Adicionar à Tela de Início');

    await context.close();
  });

  test('informa indisponibilidade quando service worker não é suportado', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'serviceWorker', {
        get() { return undefined; },
        configurable: true
      });

      window.__promptCalled = false;
      window.addEventListener('beforeinstallprompt', (event) => {
        if (typeof event.prompt === 'function') {
          window.__promptCalled = true;
        }
      });
    });

    const page = await context.newPage();
    await page.goto(BASE_URL);

    await page.waitForSelector('#btn-install');

    const hint = page.locator('.welcome-hint');
    await expect(hint).toContainText('Instalação não é suportada neste navegador.');

    await page.click('#btn-install');

    const promptCalled = await page.evaluate(() => window.__promptCalled);
    expect(promptCalled).toBe(false);

    await context.close();
  });
});
