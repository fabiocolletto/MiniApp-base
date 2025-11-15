# Backend Apps Script para MiniApp Base

Este guia descreve como criar um backend 100% dentro do ecossistema Google utilizando **Apps Script** para receber dados do MiniApp e persistir em uma planilha do Google Sheets.

## 1. Criar o projeto Apps Script

1. Acesse [https://script.google.com](https://script.google.com) com a conta administradora.
2. Clique em **Novo projeto** e dê um nome identificável (ex.: `MiniApp Sync Backend`).
3. No editor do Apps Script, substitua o conteúdo padrão do arquivo `Code.gs` pelo script abaixo.

```javascript
const SPREADSHEET_ID = 'SUBSTITUA_PELO_ID_DA_PLANILHA';
const SHEET_NAME = 'MiniAppLogs';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Requisição sem corpo JSON.');
    }

    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME) ||
      SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);

    const timestamp = new Date();
    const row = [
      timestamp.toISOString(),
      JSON.stringify(payload)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', id: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Dicas
- Crie a planilha `MiniAppLogs` previamente ou deixe que o script crie automaticamente na primeira execução.
- Ajuste o `SPREADSHEET_ID` com o identificador da planilha (parte da URL). Nenhum segredo deve ser commitado no repositório.

## 2. Publicar como Web App

1. No Apps Script, clique em **Implantar → Nova implantação**.
2. Em **Tipo de implantação**, escolha **Aplicativo da Web**.
3. Defina:
   - **Descrição**: algo como `Recepção MiniApp`.
   - **Executar como**: Proprietário.
   - **Quem tem acesso**: `Qualquer pessoa com o link` (ou restrinja a contas específicas, conforme a política interna).
4. Clique em **Implantar** e autorize as permissões solicitadas.
5. Copie a **URL do Web App** gerada. Ela será usada no front-end.

## 3. Configurar o front-end

O módulo `js/googleSync.js` aceita configurações sem que seja necessário editar o arquivo fonte:

1. **Definindo variáveis globais antes do carregamento do módulo**
   ```html
   <script>
     window.MINIAPP_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_SCRIPT/exec';
     window.MINIAPP_SYNC_TARGET = 'appsScript'; // ou 'gapi'
     window.MINIAPP_GOOGLE_CONFIG = {
       apiKey: 'SUA_API_KEY',
       clientId: 'SEU_CLIENT_ID.apps.googleusercontent.com',
       scope: 'https://www.googleapis.com/auth/drive.file'
     };
   </script>
   <!-- em seguida mantenha o <script type="module"> existente que importa ./js/googleSync.js -->
   ```

2. **Ou dinamicamente após o carregamento**
   ```javascript
   miniappSync.configureGoogleSync({
     appsScriptUrl: 'https://script.google.com/macros/s/SEU_SCRIPT/exec',
     syncTarget: 'appsScript'
   });
   ```

3. Quando optar por `syncTarget: 'gapi'`, complete `MINIAPP_GOOGLE_CONFIG` com `apiKey`, `clientId`, `scope` e `discoveryDocs` válidos.

4. Nunca commit credenciais: utilize variáveis de ambiente ou arquivos ignorados para armazenar chaves no ambiente de build quando necessário.

## 4. Fluxo de sincronização

1. O MiniApp adiciona dados ao IndexedDB através das funções em `js/indexeddb-store.js`.
2. Itens pendentes ficam na store `pendingSync` com status `pending`.
3. Quando há conexão e autenticação:
   - `syncPendingChanges()` envia cada item via `fetch` para o Apps Script.
   - Em sucesso, o item é marcado como `synced` e removido da fila.
4. Em caso de falha, o item permanece na fila para nova tentativa.

## 5. Auditoria e segurança

- Ative o registro de execução no Apps Script para monitorar erros.
- Considere adicionar validação de schema no Apps Script antes de escrever na planilha.
- Limite o acesso do Web App conforme a sensibilidade dos dados.
- Revogue a implantação pelo painel do Apps Script caso a URL vaze ou precise ser atualizada.

Com esses passos, o MiniApp mantém o fluxo **offline-first** e utiliza apenas infraestrutura Google para persistir e sincronizar dados.
