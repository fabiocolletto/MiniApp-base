const assert = require('assert');
const { chromium } = require('playwright');
const path = require('path');
const { startStaticServer } = require('../../../tests/helpers/server');

const ROOT = path.resolve(__dirname, '../../..');

const selectors = {
    tableRowById: (id) => `[data-edit-btn][data-id="${id}"]`,
    titleCellFromRow: (id) => `${selectors.tableRowById(id)} >> xpath=ancestor::tr//td[@data-col-title]`,
    duplicateButton: (id) => `${selectors.tableRowById(id)} ~ button[data-duplicate-btn]`
};

(async () => {
    const server = await startStaticServer({ root: ROOT });
    const BASE_URL = `http://localhost:${server.port}/miniapps/gestao-de-catalogo/index.html`;
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('browser:', msg.text()));

    const results = [];
    const record = (name, passed, details) => results.push({ name, passed, details });

    try {
        await page.goto(BASE_URL);
        await page.waitForSelector('#miniapp-form');
        await page.waitForSelector('[data-table-body]');
        await page.evaluate(() => window.localStorage.removeItem('gestaoCatalogoDraft'));
        await page.reload();
        await page.waitForSelector('#miniapp-form');

        const entry = {
            id: `qa-miniapp-${Date.now()}`,
            title: 'MiniApp QA Catálogo',
            category: 'QA',
            description: 'Fluxo automatizado de catálogo',
            url: './miniapps/exemplo/index.html',
            image: 'https://placehold.co/400x300',
            price: 'Grátis',
            contract: 'Incluso'
        };

        // Teste 1: Cadastro e persistência após reload
        try {
            await page.fill('#id', entry.id);
            await page.fill('#title', entry.title);
            await page.fill('#category', entry.category);
            await page.fill('#description', entry.description);
            await page.fill('#url', entry.url);
            await page.fill('#image', entry.image);
            await page.fill('#price', entry.price);
            await page.fill('#contract', entry.contract);
            await page.click('[data-submit-btn]');
            await page.waitForSelector(selectors.tableRowById(entry.id));
            await page.reload();
            await page.waitForSelector(selectors.tableRowById(entry.id));
            const titleAfterReload = await page.textContent(selectors.titleCellFromRow(entry.id));
            assert.ok(titleAfterReload.includes(entry.title), 'Cadastro não persistiu após reload.');
            record('Catálogo: cadastro persiste após reload', true, 'Linha permanece presente após recarregar.');
        } catch (error) {
            record('Catálogo: cadastro persiste após reload', false, error.message);
            throw error;
        }

        // Teste 2: Edição persiste no rascunho local
        try {
            const updatedTitle = `${entry.title} v2`;
            await page.click(selectors.tableRowById(entry.id));
            await page.waitForFunction(
                () => document.querySelector('[data-form-title]')?.textContent.includes('Editando'),
            );
            await page.fill('#title', updatedTitle);
            await page.click('[data-submit-btn]');
            await page.waitForTimeout(300);
            await page.reload();
            await page.waitForSelector(selectors.tableRowById(entry.id));
            const editedTitle = await page.textContent(selectors.titleCellFromRow(entry.id));
            assert.ok(editedTitle.includes(updatedTitle), 'Atualização não persistiu após reload.');
            record('Catálogo: edição persiste após reload', true, 'Título editado mantido no rascunho.');
        } catch (error) {
            record('Catálogo: edição persiste após reload', false, error.message);
            throw error;
        }

        // Teste 3: Duplicação cria cópia persistida
        try {
            const duplicateButton = `${selectors.tableRowById(entry.id)} ~ button[data-duplicate-btn]`;
            await page.click(duplicateButton);
            const copyId = `${entry.id}-copy`;
            await page.waitForSelector(selectors.tableRowById(copyId));
            await page.reload();
            await page.waitForSelector(selectors.tableRowById(copyId));
            record('Catálogo: duplicação persistida', true, 'Cópia do MiniApp continua após reload.');
        } catch (error) {
            record('Catálogo: duplicação persistida', false, error.message);
            throw error;
        }

        // Teste 4: Exclusão remove e reidrata corretamente
        try {
            const copyId = `${entry.id}-copy`;
            const deleteButton = `${selectors.tableRowById(copyId)} ~ button[data-delete-btn]`;
            page.once('dialog', (dialog) => dialog.accept());
            await page.click(deleteButton);
            await page.waitForTimeout(300);
            await page.reload();
            const copyExists = await page.$(selectors.tableRowById(copyId));
            assert.strictEqual(copyExists, null, 'Cópia não foi removida do rascunho.');
            record('Catálogo: exclusão remove rascunho', true, 'Entrada removida permanece ausente após reload.');
        } catch (error) {
            record('Catálogo: exclusão remove rascunho', false, error.message);
            throw error;
        }

        // Teste 5: Botão de sincronização habilita quando há rascunho
        try {
            const isSaveEnabled = await page.isEnabled('[data-save-btn]');
            assert.ok(isSaveEnabled, 'Botão "Salvar no sistema" deveria estar habilitado com rascunho local.');
            record('Catálogo: pronto para sincronizar', true, 'Botão de salvar habilitado com catálogo em memória.');
        } catch (error) {
            record('Catálogo: pronto para sincronizar', false, error.message);
            throw error;
        }

    } catch (error) {
        console.error('Falha em algum teste:', error);
        console.table(results);
        await browser.close();
        server.stop();
        process.exit(1);
    }

    await browser.close();
    server.stop();
    console.table(results);
})();
