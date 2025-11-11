const { test, expect } = require('@playwright/test');

const { stubFirebase } = require('./helpers/firebase');

const STORAGE_KEY = 'miniapp-catalog.admin.activeItems';

test.describe('Miniapp catálogo público', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('[catalog-console]', msg.text()));
  });

  test('exibe itens importados do armazenamento local junto aos essenciais', async ({ page }) => {
    await page.addInitScript(([key, payload]) => {
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify(payload));
    }, [STORAGE_KEY, {
      items: [
        {
          id: 'local-app',
          name: 'Aplicativo Local',
          description: 'Item disponível apenas neste dispositivo.',
          url: 'miniapp-base/index.html',
          category: 'Local',
          status: 'Ativo',
          icon_url: 'https://placehold.co/48x48/222/fff?text=L'
        }
      ],
    }]);

    await stubFirebase(page);
    await page.goto('/miniapp-catalogo/index.html');

    await expect(page.getByText('Aplicativo Local', { exact: false })).toBeVisible();
    await expect(page.getByText('MiniApp Base', { exact: false })).toBeVisible();
  });
});
