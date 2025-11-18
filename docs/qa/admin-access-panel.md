# Processo de QA – Painel administrativo via Apps Script

Este plano valida o fluxo simplificado que solicita o ID do Apps Script apenas quando o usuário abre a aba **Configurações** e garante que o MiniApp renderize o valor de `Catalogo!A1` na primeira carga e nas visitas seguintes.

## Escopo
- Shell principal (`index.html`) com footer compartilhado.
- Scripts `js/admin-access.js` e `docs/components/app-shared-footer.js` responsáveis por solicitar e salvar o ID da planilha.
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
1. O `prompt` pede o ID da planilha ao abrir a aba **Configurações** pela primeira vez (sem repetir após salvar no IndexedDB).
2. A aba **Configurações** permanece visível no rodapé em todas as telas.
3. Ao acessar o MiniApp de configurações, o painel exibe o valor retornado para `Catalogo!A1`.
4. Após recarregar a página ou retornar ao catálogo, o painel volta a abrir usando o ID salvo, sem novas solicitações.

## Registro de resultados
- A execução imprime uma tabela com os cenários validados no console.
- Em caso de falha, ajuste o fluxo de validação (endpoint, storage ou renderização) e repita os testes até atender todos os termos de aceitação.
