# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Adicionado
- Pastas `miniapps/favorites/` e `miniapps/recents/` com documentação e placeholders dedicados para suportar o novo padrão do rodapé.

### Alterado
- Footer compartilhado atualizado para exibir os quatro ícones principais (Catálogo, Favoritos, Recentes e Configurações) e alinhar a navegação ao novo padrão.
- `index.html` agora monta apenas os MiniApps do rodapé fixo e abre cada item diretamente em iframes apontando para `miniapps/<slug>/index.html`.
- Documentação (`README.md` e `miniapps/README.md`) revisada para refletir a nova navegação permanente e os MiniApps legados preservados.
- `service-worker.js` incrementado para `v3.2` e com precache das rotas `miniapps/favorites/index.html` e `miniapps/recents/index.html`.
- Diretrizes existentes mantidas para preservar o shell React e os componentes compartilhados.

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
