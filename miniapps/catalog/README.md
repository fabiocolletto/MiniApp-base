# MiniApp - Gestão de Catálogo

Status: **Em criação**, exibindo cards React do pipeline atual (Catálogo, Configurações, Pagamentos, Favoritos, Recentes e Alertas) com Material UI.

Painel associado ao ícone de catálogo do rodapé. Centraliza a gestão de MiniApps publicados e a preparação de novos itens para o catálogo oficial.

## Estrutura atual
- `index.html`: monta o grid em React usando `ThemeProvider`, `AppModalProvider`, `AppCard`/`AppButton`/`AppSection` e `Grid` responsivo (xs 12 / sm 6 / md 4).
- `docs/components/app-shared-ui.js`: provê o visual base dos cartões.
- `docs/components/app-modal-context.js`: garante que o Dialog de detalhes siga o padrão oficial.
- `CHANGELOG.md`: histórico de evolução do painel.

## Funcionalidades implementadas
1. Lista estática de MiniApps com AppCards de 320px, chip de status e botões para abrir o MiniApp ou ver detalhes.
2. Dialog de detalhes (categoria, contrato, responsável) construído com `useAppModal`.
3. Layout 100% controlado pelo `Grid` do Material UI, sem media queries locais, aproveitando `docs/miniapp-global.css` apenas como base.

## Próximos passos
1. Consolidar a integração com a lista oficial de MiniApps.
2. Ajustar fluxos de criação/edição conforme o design final.
3. Atualizar mensagens de placeholder após homologação.
