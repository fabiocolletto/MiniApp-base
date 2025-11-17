const CONTROL_SHEET_ENDPOINT =
    'https://script.google.com/macros/s/SEU_ID/exec?action=getCell&sheet=Catalogo&cell=A1';
// TODO: substituir SEU_ID pela URL real do Apps Script usado no projeto.

async function loadControlTableFromSheet() {
    const container = document.getElementById('settings-sheet-control');
    if (!container) return;

    let value = '(carregando...)';

    try {
        const response = await fetch(CONTROL_SHEET_ENDPOINT);
        const data = await response.json();

        // Esperado: resposta no formato { value: "..." }
        value = data?.value ?? '(vazio)';
    } catch (error) {
        console.error('Erro ao buscar Catalogo!A1', error);
        value = '(erro ao carregar A1)';
    }

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
          <td class="px-3 py-2 border-t font-mono">${value}</td>
        </tr>
      </tbody>
    </table>
  `;
}

window.addEventListener('DOMContentLoaded', loadControlTableFromSheet);
