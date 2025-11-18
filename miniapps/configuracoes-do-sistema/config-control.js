import { getSavedSheetId } from '../../js/admin-access.js';

const DEFAULT_ADMIN_VERIFY_URL = 'https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec';
const ADMIN_VERIFY_URL = typeof window !== 'undefined' && window.MINIAPP_ADMIN_VERIFY_URL
    ? window.MINIAPP_ADMIN_VERIFY_URL
    : DEFAULT_ADMIN_VERIFY_URL;

async function fetchCatalogHeader(sheetId) {
    const response = await fetch(ADMIN_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getCatalogHeader', sheetId }),
    });

    if (!response.ok) {
        throw new Error(`Falha ao ler Catalogo!A1 (${response.status})`);
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
          <td class="px-3 py-2 border-t">Catalogo</td>
          <td class="px-3 py-2 border-t">A1</td>
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

    renderStatus(container, 'Carregando cabeçalho do catálogo (A1)...');

    const savedSheetId = await getSavedSheetId();
    if (!savedSheetId) {
        renderStatus(container, 'Salve o ID do Apps Script pelo catálogo para carregar Catalogo!A1.');
        return;
    }

    try {
        const value = await fetchCatalogHeader(savedSheetId);
        renderTable(container, value);
    } catch (error) {
        console.error('Erro ao buscar Catalogo!A1', error);
        renderStatus(container, 'Não foi possível carregar a célula A1 da aba Catalogo.');
    }
}

window.addEventListener('DOMContentLoaded', loadControlTableFromSheet);
