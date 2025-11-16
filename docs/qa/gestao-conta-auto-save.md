# Processo de QA – Auto-save em Gestão de Conta do Usuário

Este plano valida que as alterações aplicadas ao painel de gestão da conta salvam automaticamente os dados do usuário e são reidratadas após recarregar a página.

## Escopo
- MiniApp: `miniapps/gestao-de-conta-do-usuario/index.html`
- Funcionalidades validadas: perfil, MFA, notificações e favoritos (auto-save + reidratação)

## Ambiente
- Servidor local: iniciado automaticamente pelo script de QA com `python3 -m http.server` na raiz do repositório (porta dinâmica iniciando em 8000).
- Navegador: Chromium via Playwright (`npx playwright install-deps chromium` e `npx playwright install chromium` na primeira execução, ou dependência `playwright@1.56.1`).

## Comando de execução
1. Instale dependências e binários (apenas na primeira vez):
```bash
npm install
npx playwright install-deps chromium
npx playwright install chromium
```
2. Rode a suíte dedicada:
```bash
npm run qa:gestao-conta
```

## Termos de aceitação
1. **Perfil**: Nome, e-mail e telefone editados no modal são mantidos após recarregar a página e reabrir o modal.
2. **Segurança (MFA)**: A opção selecionada no `<select>` de MFA permanece após recarregar a página.
3. **Notificações**: O estado dos toggles com `data-setting` no modal de notificações permanece após recarregar a página.
4. **Favoritos**: O estado das checkboxes com `data-favorite` no modal de favoritos permanece após recarregar a página.

## Passo a passo dos testes manuais/automatizados
1. Abrir `http://localhost:8000/miniapps/gestao-de-conta-do-usuario/index.html`.
2. **Perfil**: abrir “Editar Perfil”, alterar nome/e-mail/telefone, aguardar indicador de sync e recarregar; reabrir modal e confirmar valores.
3. **MFA**: abrir “Segurança”, trocar opção do select, aguardar indicador de sync e recarregar; reabrir modal e confirmar valor.
4. **Notificações**: abrir “Alertas e Notificações”, alternar toggle `data-setting="productNews"`, aguardar indicador de sync e recarregar; reabrir modal e confirmar estado do toggle.
5. **Favoritos**: abrir “MiniApps Favoritos”, alternar checkbox `data-favorite="aprovacao-despesas"`, aguardar indicador de sync e recarregar; reabrir modal e confirmar estado.

## Registro de resultados
A execução automática imprime uma tabela por cenário no console. Salve a saída no log do commit/PR para comprovação. Em caso de falha, ajuste a implementação e repita os testes até atender todos os termos de aceitação.
