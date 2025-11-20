# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Adicionado
- `docs/components/app-shared-ui.js` com AppCard/AppButton/AppSection padronizados sobre Material UI.
- `docs/components/app-modal-context.js` expondo `AppModalProvider`/`useAppModal` para Dialog/Drawer/Snackbar.
- Grid React do MiniApp Catálogo utilizando AppCards e Dialog de detalhes.
- Template compartilhado `miniapps/catalog/app.js` reutilizado por Catálogo/Favoritos/Recentes, aplicando filtros por favoritos do IndexedDB e histórico local de aberturas.
- Fluxos de Perfil e Memória no MiniApp Configurações com Dialogs acessíveis e Snackbar de confirmação.
- Pastas `miniapps/favorites/` e `miniapps/recents/` alimentadas pelo mesmo template do catálogo, mantendo documentação e filtros específicos do rodapé.
- Script `tests/ensure-screen-capture.js` rodado via `npm test` para garantir que nenhum arquivo inclua flags que bloqueiem prints em Android/iOS.
- Seção no `README.md` documentando a política de captura de tela e o procedimento de validação.
- MiniApp complementar `miniapps/payments/` com card compacto/expandido dedicado à assinatura brasileira via Mercado Pago.
- Card MiniSystems dentro de `miniapps/settings/` para gerenciar preferências globais (tema claro/escuro e idiomas PT/EN/ES) com persistência local e broadcast via `postMessage`.
- Pasta `miniapps/minisystems/` com placeholder dedicado às preferências globais e links diretos para o painel de Configurações.
- Mapa de cópias multilíngues no MiniApp Configurações garantindo tradução imediata dos cards quando o idioma global é alterado.
- Handshake `catalog:height` entre o shell React e miniapps em iframe para sincronizar automaticamente a altura do Stage quando o conteúdo interno cresce.
- Registros oficiais dos quatro MiniApps ativos dentro de `docs/miniapp-data.js`, permitindo validar o grid, favoritos e os quadros do catálogo.
- Fonte `docs/miniapp-data.js` simplificada para manter apenas os quatro MiniApps do rodapé e garantir que o catálogo sempre renderize o conjunto atual.

### Alterado
- `index.html` passou a usar `ThemeProvider`, `Container` e `Box` do Material UI para controlar o Stage responsivo.
- `docs/miniapp-global.css` foi reduzido a tokens/layout base, delegando a responsividade para o Material UI.
- MiniApp Configurações reescrito em React + MUI com quatro cards (Perfil, Pagamentos, MiniSystems, Memória) e utilitários isolados em `config-control.js`.
- MiniApp Catálogo deixou a tabela fixa e agora renderiza os cards em `Grid` com AppCard, ícone de expansão para abrir o MiniApp em tela cheia, status + link de detalhes na mesma linha e dados de contrato movidos para o modal (com botão de favorito integrado).
- Footer compartilhado atualizado para exibir os quatro ícones principais (Catálogo, Favoritos, Recentes e Configurações) e alinhar a navegação ao novo padrão.
- `index.html` agora monta apenas os MiniApps do rodapé fixo e abre cada item diretamente em iframes apontando para `miniapps/<slug>/index.html`.
- Documentação (`README.md` e `miniapps/README.md`) revisada para refletir a nova navegação permanente e os MiniApps legados preservados.
- `service-worker.js` incrementado para `v3.2` e com precache das rotas `miniapps/favorites/index.html` e `miniapps/recents/index.html`.
- Diretrizes existentes mantidas para preservar o shell React e os componentes compartilhados.
- MiniApp de Configurações volta a concentrar apenas o monitoramento do IndexedDB, deixando pagamentos para o painel dedicado.
- `miniapps/settings/index.html` ajustado para exibir simultaneamente o snapshot de pagamentos e o cartão MiniSystems, removendo o overflow invisível e aplicando o layout padrão do shell.
- `README.md` e `miniapps/README.md` atualizados para citar o novo MiniSystems e deixar claro o vínculo entre os cards de Configurações e seus respectivos MiniApps (`account`, `payments` e `minisystems`).
- `docs/components/app-shared-ui.js` passou a consumir o palette do tema atual para ajustar borda, sombra e fundo dos AppCards independentemente do modo claro/escuro.
- `miniapps/settings/index.html` agora utiliza o mapa de cópias e os helpers `resolveThemeLabel`/`resolveLanguageLabel` para refletir tema e idioma nos cards de Perfil, Pagamentos, MiniSystems e Memória.
- MiniApp Catálogo passou a consumir `loadMiniAppData`/`docs/miniapp-data.js`, exibir skeletons enquanto carrega, reaproveitar o empty state "Catálogo em criação" e disparar Snackbar em erros ao buscar dados.
- `service-worker.js` atualizado para `v3.4`, incluindo o precache do template compartilhado do catálogo.
- `README.md` e `miniapps/README.md` atualizados para refletir a limpeza final da implantação.

### Removido
- Pastas de QA, validação, design system e templates que não eram necessárias para manter os MiniApps e componentes principais.
- Documentação legada (`docs/admin-endpoint-usage.md`, `docs/apps-script-backend.md`, `docs/card-model.html`, `docs/responsiveness-report.md` e `docs/sw.js`).
- Suítes Playwright, diretório `node_modules/` e scripts de QA anteriores; `package.json` agora contém apenas um comando de teste informativo.
- Pastas `miniapps/home/`, `miniapps/alerts/` e `miniapps/account/`, além da referência obsoleta a `docs/card-model.html`.

## [0.1.0] - 2024-04-XX
### Adicionado
- Cadastro do MiniApp **Catálogo 5Horas** com identificador único (`catalogo-5horas`) e imagem placeholder dedicada.
- Salvaguardas no `index.html` para gerar identificadores válidos antes de usar a fila offline ou salvar preferências.
- Persistência de `id` nos cards (`docs/miniapp-card.js`) para manter consistência entre grid, modal e IndexedDB.
- Documentação inicial (`README.md`) com protocolo para inclusão, teste e governança de MiniApps.

### Alterado
- Normalização do arquivo `docs/miniapp-data.js` para formato multilinha e inclusão explícita de `id` para todos os MiniApps.
