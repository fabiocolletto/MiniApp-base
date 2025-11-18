const assert = require('assert');
const { chromium } = require('playwright');
const path = require('path');
const { startStaticServer } = require('../../helpers/server');

const ROOT = path.resolve(__dirname, '../../..');

const waitForPlaceholder = async (page) => {
  await page.waitForFunction(() => {
    const placeholderStage = document.querySelector('#placeholderStage');
    return placeholderStage && !placeholderStage.classList.contains('hidden');
  });
};

const readStageState = async (page) => {
  return page.evaluate(() => {
    const catalogStage = document.querySelector('#catalogStage');
    const placeholderStage = document.querySelector('#placeholderStage');
    const placeholderIcon = document.querySelector('#placeholderIcon');
    const placeholderTitle = document.querySelector('#placeholderTitle');
    const placeholderDescription = document.querySelector('#placeholderDescription');
    const footer = document.querySelector('app-shared-footer');

    return {
      catalogVisible: Boolean(catalogStage && !catalogStage.classList.contains('hidden')),
      placeholderVisible: Boolean(placeholderStage && !placeholderStage.classList.contains('hidden')),
      placeholderIcon: (placeholderIcon?.textContent || '').trim(),
      placeholderTitle: (placeholderTitle?.textContent || '').trim(),
      placeholderDescription: (placeholderDescription?.textContent || '').trim(),
      footerActiveTab: (footer?.getAttribute('active-tab') || '').trim().toLowerCase(),
      activeNavKey: document.querySelector('a.nav-link.active')?.getAttribute('data-nav-key') || '',
    };
  });
};

(async () => {
  const server = await startStaticServer({ root: ROOT });
  const BASE_URL = `http://localhost:${server.port}/index.html`;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('browser:', msg.text()));
  page.on('pageerror', (err) => console.log('pageerror:', err.message));

  const results = [];
  const record = (name, passed, details) => results.push({ name, passed, details });

  const navTargets = [
    { key: 'catalog', icon: 'grid_view', label: 'Catálogo' },
    { key: 'home', icon: 'home', label: 'Home' },
    { key: 'alerts', icon: 'notifications', label: 'Alertas' },
    { key: 'settings', icon: 'settings', label: 'Configurações' },
    { key: 'account', icon: 'person', label: 'Conta' },
  ];

  try {
    await page.goto(BASE_URL);
    await page.waitForSelector('app-shared-footer', { state: 'attached' });
    await waitForPlaceholder(page);

    // Estado inicial: placeholder do catálogo visível e rodapé sincronizado
    try {
      const state = await readStageState(page);

      assert.ok(state.placeholderVisible, 'Placeholder deve estar visível na carga inicial.');
      assert.strictEqual(state.placeholderIcon, 'grid_view', 'Ícone inicial deve representar o catálogo.');
      assert.strictEqual(state.footerActiveTab, 'catalog', 'Rodapé deve iniciar com catálogo ativo.');
      assert.strictEqual(state.activeNavKey, 'catalog', 'Item do rodapé do catálogo deve estar ativo.');

      record('Estado inicial mantém catálogo ativo no stage', true, state);
    } catch (error) {
      record('Estado inicial mantém catálogo ativo no stage', false, error.message);
      throw error;
    }

    for (const target of navTargets) {
      try {
        await page.click(`a[data-nav-key="${target.key}"]`);
        await waitForPlaceholder(page);
        const state = await readStageState(page);

        assert.ok(state.placeholderVisible, 'Stage deve permanecer no placeholder para MiniApp em criação.');
        assert.strictEqual(state.placeholderIcon, target.icon, `Placeholder deve refletir o ícone de ${target.label}.`);
        assert.ok(state.placeholderTitle.length > 0, 'Título do placeholder não pode estar vazio.');
        assert.ok(state.placeholderDescription.length > 0, 'Descrição do placeholder não pode estar vazia.');
        assert.strictEqual(state.footerActiveTab, target.key, 'Rodapé deve indicar o MiniApp ativo.');
        assert.strictEqual(state.activeNavKey, target.key, 'Navegação do rodapé deve marcar o item ativo.');

        record(`Stage placeholder atualizado para ${target.label}`, true, state);
      } catch (error) {
        record(`Stage placeholder atualizado para ${target.label}`, false, error.message);
        throw error;
      }
    }
  } catch (error) {
    console.error('Falha em algum teste de navegação:', error);
    console.table(results);
    await browser.close();
    server.stop();
    process.exit(1);
  }

  await browser.close();
  server.stop();
  console.table(results);
})();
