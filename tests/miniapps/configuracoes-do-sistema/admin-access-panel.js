const assert = require('assert');
const { chromium } = require('playwright');
const path = require('path');
const { startStaticServer } = require('../../helpers/server');

const ROOT = path.resolve(__dirname, '../../..');
const ADMIN_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec';
const FAKE_SHEET_ID = '1TESTSHEETIDEXEMPLO1234567890ABCDE';

(async () => {
  const server = await startStaticServer({ root: ROOT });
  const BASE_URL = `http://localhost:${server.port}/index.html`;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('browser:', msg.text()));
  page.on('pageerror', (err) => console.log('pageerror:', err.message));

  const results = [];
  let verifyCalls = 0;
  let catalogHeaderCalls = 0;
  const record = (name, passed, details) => results.push({ name, passed, details });

  await page.route(`${ADMIN_ENDPOINT}**`, async (route) => {
    const payload = route.request().postDataJSON?.() || {};

    if (payload.action === 'verifyAdmin') {
      verifyCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, message: 'authorized' }),
      });
      return;
    }

    if (payload.action === 'getCatalogHeader') {
      catalogHeaderCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, value: 'Título do catálogo QA' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, message: 'unexpected action' }),
    });
  });

  await page.addInitScript((sheetId) => {
    const currentCount = window.__promptCount || 0;
    window.__promptCount = currentCount;
    window.prompt = () => {
      window.__promptCount += 1;
      return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    };
    window.alert = () => {};
  }, FAKE_SHEET_ID);

  try {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('app-shared-footer');

    const promptCountInitial = await page.evaluate(() => window.__promptCount || 0);
    assert.strictEqual(promptCountInitial, 0, 'Nenhum prompt deve ser disparado antes de abrir Configurações.');

    await page.click('a[data-nav-key="settings"]');
    await page.waitForURL('**/miniapps/configuracoes-do-sistema/**', { timeout: 10000 });
    await page.waitForSelector('#settings-sheet-control .font-mono', { timeout: 8000 });

    const promptCountAfterNavigation = await page.evaluate(() => window.__promptCount || 0);
    const headerValue = await page.textContent('#settings-sheet-control .font-mono');

    assert.ok(promptCountAfterNavigation >= 1, 'O ID deve ser solicitado ao abrir Configurações.');
    assert.ok(headerValue.includes('Título do catálogo QA'), 'O valor de A1 precisa ser exibido no painel.');
    assert.strictEqual(verifyCalls, 0, 'O fluxo não deve mais validar o administrador.');

    record('Primeiro acesso ao painel de configurações sem validação', true, {
      prompt: promptCountAfterNavigation,
      leiturasCabecalho: catalogHeaderCalls,
    });

    await page.goto(BASE_URL);
    await page.waitForSelector('a[data-nav-key="settings"]');
    await page.click('a[data-nav-key="settings"]');
    await page.waitForURL('**/miniapps/configuracoes-do-sistema/**', { timeout: 8000 });
    await page.waitForSelector('#settings-sheet-control .font-mono', { timeout: 8000 });

    const promptCountAfterReturn = await page.evaluate(() => window.__promptCount || 0);
    const headerValueAfterReturn = await page.textContent('#settings-sheet-control .font-mono');

    assert.strictEqual(promptCountAfterReturn, promptCountAfterNavigation, 'O ID salvo deve impedir prompts adicionais.');
    assert.ok(headerValueAfterReturn.includes('Título do catálogo QA'), 'O painel deve reutilizar o ID salvo.');

    record('Reabertura do painel reutilizando ID salvo', true, {
      prompt: promptCountAfterReturn,
      leiturasCabecalho: catalogHeaderCalls,
    });
  } catch (error) {
    record('Fluxo admin', false, {
      mensagem: error.message,
      verificacoes: verifyCalls,
      leiturasCabecalho: catalogHeaderCalls,
    });
    console.error('Erro no teste de acesso admin:', error);
    console.table(results);
    console.dir(results, { depth: 5 });
    await browser.close();
    server.stop();
    process.exit(1);
  }

  await browser.close();
  server.stop();
  console.table(results);
})();
