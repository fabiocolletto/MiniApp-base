# Como usar o endpoint de verificação administrativa

> **Status**: fluxo legado descontinuado. O sistema não utiliza mais validação administrativa; mantenha este documento apenas como histórico de implementação.

Este guia mostra como utilizar o endpoint Apps Script publicado em:

```
https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec
```

O script (`doPost`) compara o `sheetId` recebido com o valor salvo em **Script Properties** (`adm_sheet_id`) e, opcionalmente, valida o e-mail do usuário autenticado (`adm_user_id`). Quando ambos batem, ele responde `{ ok: true, message: 'authorized' }`.

## 1. Configurar o Apps Script

1. Abra o projeto no editor do Apps Script.
2. Em **Configurações do projeto → Propriedades do script**, crie:
   - `adm_sheet_id`: ID da planilha usada para administração.
   - `adm_user_id`: (opcional) e-mail autorizado. Se estiver em branco, qualquer usuário autenticado poderá validar o `sheetId`.
3. Clique em **Implantar → Nova implantação → Aplicativo da Web** e publique com acesso adequado (ex.: "Qualquer pessoa").

## 2. Fazer uma chamada de teste

Envie um POST JSON contendo `sheetId`. Não é necessário outro campo; o script ignora chaves adicionais.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"sheetId":"SEU_ID_DA_PLANILHA"}' \
  "https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec"
```

Resposta esperada:

```json
{"ok":true,"message":"authorized"}
```

Se o ID ou o usuário não forem válidos, a resposta será `{ "ok": false, "message": "unauthorized" }`.

## 3. Usar no MiniApp

### Fluxo automático ao abrir o catálogo

1. Ao carregar a página, o MiniApp verifica se há conexão e tenta validar a conta Google ativa contra o Apps Script usando o `sheetId` salvo no IndexedDB (válido por 30 dias).
2. Se a conta não estiver autorizada ou o ID tiver expirado, o app solicita um novo `sheetId`, persiste o valor por mais 30 dias e tenta novamente.
3. Depois da validação, o painel administrativo é preenchido automaticamente com o valor da célula **A1** da aba `catalogo`.

### Alterar o endpoint

Para direcionar para um endpoint diferente (por exemplo, outro deploy), defina a variável global antes de carregar os módulos:

```html
<script>
  window.MINIAPP_ADMIN_VERIFY_URL = 'https://script.google.com/macros/s/SEU_DEPLOY/exec';
</script>
```

Depois disso, carregue normalmente os scripts do catálogo (incluindo `js/admin-access.js`). O fluxo mantém as confirmações de uso do ID salvo e respeita as respostas `ok/unauthorized` vindas do Apps Script.

## 4. Dicas de autenticação

- O Apps Script lê `Session.getActiveUser().getEmail()`. Publique o Web App exigindo login Google para que o e-mail seja preenchido.
- Para depurar, abra **Executar → Registro de execução** no Apps Script e verifique as entradas geradas no `Logger`.
