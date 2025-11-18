# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Alterado
- `README.md` atualizado para refletir o repositório enxuto e os itens preservados (5 MiniApps em criação, header e footer compartilhados).
- Slugs dos MiniApps base renomeados para `home`, `alerts`, `catalog`, `settings` e `account`, alinhando os ícones do rodapé e marcando-os como obrigatórios na documentação.
- `service-worker.js` atualizado para precache das novas rotas dos MiniApps base e versão `v3.1` para forçar atualização do cache.

### Removido
- Pastas de QA, validação, design system e templates que não eram necessárias para manter os MiniApps e componentes principais.
- Documentação legada (`docs/admin-endpoint-usage.md`, `docs/apps-script-backend.md`, `docs/card-model.html`, `docs/responsiveness-report.md` e `docs/sw.js`).
- Suítes Playwright, diretório `node_modules/` e scripts de QA anteriores; `package.json` agora contém apenas um comando de teste informativo.

## [0.1.0] - 2024-04-XX
### Adicionado
- Cadastro do MiniApp **Catálogo 5Horas** com identificador único (`catalogo-5horas`) e imagem placeholder dedicada.
- Salvaguardas no `index.html` para gerar identificadores válidos antes de usar a fila offline ou salvar preferências.
- Persistência de `id` nos cards (`docs/miniapp-card.js`) para manter consistência entre grid, modal e IndexedDB.
- Documentação inicial (`README.md`) com protocolo para inclusão, teste e governança de MiniApps.

### Alterado
- Normalização do arquivo `docs/miniapp-data.js` para formato multilinha e inclusão explícita de `id` para todos os MiniApps.
