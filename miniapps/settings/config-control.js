import { getSavedSheetId } from '../../js/admin-access.js';

const DEFAULT_ADMIN_VERIFY_URL = 'https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec';
const ADMIN_VERIFY_URL = typeof window !== 'undefined' && window.MINIAPP_ADMIN_VERIFY_URL
    ? window.MINIAPP_ADMIN_VERIFY_URL
    : DEFAULT_ADMIN_VERIFY_URL;
const CATALOG_TAB_NAME = 'catalogo';
const CATALOG_CELL = 'A1';

async function fetchCatalogHeader(sheetId) {
    const response = await fetch(ADMIN_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'getCatalogHeader',
            sheetId,
            tab: CATALOG_TAB_NAME,
            cell: CATALOG_CELL,
        }),
    });

    if (!response.ok) {
        throw new Error(`Falha ao ler ${CATALOG_TAB_NAME}!${CATALOG_CELL} (${response.status})`);
    }

    const data = await response.json();
    if (!data?.ok) {
        throw new Error(data?.message || 'Resposta inválida do Apps Script.');
    }

    return data.value;
}

function renderTable(container, value) {
    container.innerHTML = `
    <table class="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-3 py-2 text-left">Aba</th>
          <th class="px-3 py-2 text-left">Célula</th>
          <th class="px-3 py-2 text-left">Valor atual</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="px-3 py-2 border-t">${CATALOG_TAB_NAME}</td>
          <td class="px-3 py-2 border-t">${CATALOG_CELL}</td>
          <td class="px-3 py-2 border-t font-mono">${value ?? '(vazio)'}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderStatus(container, message) {
    container.innerHTML = `<p class="text-sm text-gray-600">${message}</p>`;
}

async function loadControlTableFromSheet() {
    const container = document.getElementById('settings-sheet-control');
    if (!container) return;

    renderStatus(container, `Carregando cabeçalho do catálogo (${CATALOG_CELL})...`);

    const savedSheetId = await getSavedSheetId();
    if (!savedSheetId) {
        renderStatus(container, `Salve o ID do Apps Script pelo catálogo para carregar ${CATALOG_TAB_NAME}!${CATALOG_CELL}.`);
        return;
    }

    try {
        const value = await fetchCatalogHeader(savedSheetId);
        renderTable(container, value);
    } catch (error) {
        console.error(`Erro ao buscar ${CATALOG_TAB_NAME}!${CATALOG_CELL}`, error);
        renderStatus(container, `Não foi possível carregar a célula ${CATALOG_CELL} da aba ${CATALOG_TAB_NAME}.`);
    }
}

window.addEventListener('DOMContentLoaded', loadControlTableFromSheet);
