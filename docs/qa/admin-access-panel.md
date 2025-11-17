# Processo de QA – Painel administrativo via Apps Script

Este plano valida o fluxo que exibe o ícone administrativo no rodapé após confirmar o ID salvo do Apps Script e garante que o painel de controle abra o valor de `Catalogo!A1` quando o usuário clica no botão.

## Escopo
- Shell principal (`index.html`) com footer compartilhado.
- Scripts `js/admin-access.js` e `docs/components/app-shared-footer.js` responsáveis por validar o ID e revelar o ícone.
- MiniApp Configurações do Sistema, que usa a mesma fonte de dados para testar `Catalogo!A1`.

## Ambiente
- Servidor estático local iniciado automaticamente pelo script de QA.
- Navegador: Chromium via Playwright (`npx playwright install-deps chromium` e `npx playwright install chromium` na primeira execução).

## Comando de execução
1. Instale dependências e binários (apenas na primeira vez):
```bash
npm install
npx playwright install-deps chromium
npx playwright install chromium
```
2. Rode a suíte dedicada para o painel admin:
```bash
npm run qa:admin-access
```

## Termos de aceitação
1. O `prompt` pede o ID da planilha apenas na primeira carga (sem repetir após reload quando o ID estiver salvo no IndexedDB).
2. O ícone `#footer-config-icon` perde a classe `hidden`, fica com `aria-hidden="false"` e `tabindex="0"` após a validação.
3. Ao clicar no ícone, o painel `#adminControlPanel` é aberto e exibe o valor retornado para `Catalogo!A1`.
4. Após recarregar a página, o painel abre novamente usando o ID salvo, sem novas solicitações de ID.

## Registro de resultados
- A execução imprime uma tabela com os cenários validados no console.
- Em caso de falha, ajuste o fluxo de validação (endpoint, storage ou renderização) e repita os testes até atender todos os termos de aceitação.
