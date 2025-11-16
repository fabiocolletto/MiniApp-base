# Processo de QA – Auto-save em Gestão de Catálogo

Valida que o painel de catálogo salva rascunhos localmente, reidrata após recarga e mantém operações de CRUD prontas para sincronização.

## Escopo
- MiniApp: `miniapps/gestao-de-catalogo/index.html`
- Funcionalidades validadas: cadastro, edição, duplicação, exclusão e prontidão de sincronização

## Ambiente
- Servidor local: iniciado automaticamente pelo script de QA com `python3 -m http.server` na raiz do repositório (porta dinâmica iniciando em 8000).
- Navegador: Chromium via Playwright (`npx playwright install-deps chromium` e `npx playwright install chromium` na primeira execução ou após reinstalações).

## Comando de execução
1. Instale dependências e binários (apenas na primeira vez):
```bash
npm install
npx playwright install-deps chromium
npx playwright install chromium
```
2. Rode a suíte dedicada ou a suíte completa:
```bash
npm run qa:gestao-catalogo
# ou
npm test
```

## Termos de aceitação
1. **Cadastro**: Um novo MiniApp incluído via formulário aparece na tabela e continua presente após recarregar a página.
2. **Edição**: Alterações realizadas em um registro existente permanecem visíveis após recarregar a página.
3. **Duplicação**: A ação de duplicar gera uma cópia com ID incremental (`-copy`) que permanece após recarregar.
4. **Exclusão**: Ao confirmar a exclusão de uma cópia, o item desaparece da tabela e não retorna após recarregar.
5. **Prontidão de sincronização**: Com rascunho ativo na tabela, o botão “Salvar no sistema” permanece habilitado para enfileirar a sincronização.

## Passo a passo dos testes automatizados
1. Limpar o rascunho existente (`gestaoCatalogoDraft`) e recarregar o MiniApp.
2. Criar um novo registro preenchendo todos os campos obrigatórios e salvar.
3. Recarregar a página e confirmar que o registro permanece na tabela.
4. Editar o registro, salvar e validar que o novo título permanece após recarga.
5. Duplicar o registro, recarregar e verificar que a cópia está presente.
6. Excluir a cópia (aceitando o diálogo), recarregar e confirmar que ela não reaparece.
7. Validar que o botão “Salvar no sistema” está habilitado enquanto o rascunho permanece na tabela.

## Registro de resultados
A execução imprime uma tabela com cada cenário e se passou ou falhou. Anexe a saída do comando ao log do commit/PR para comprovar os termos de aceitação. Em caso de falha, corrija o comportamento, repita o fluxo e somente conclua quando todos os cenários forem aprovados.
