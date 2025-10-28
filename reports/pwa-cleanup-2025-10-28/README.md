# Relatório da limpeza PWA — 28/10/2025

## Resumo
- Branch de trabalho: `maintenance/pwa-cleanup-2025-10-28`.
- Tag pré-limpeza criada: `pre-pwa-cleanup-Rx.y.z`.
- Estrutura ativa reduzida ao shell PWA (`index.html`, `public/`, `styles/`, `scripts/`, `core/`, `sys/`).
- Legado movido para `archive/2025-10-28/` preservando árvore original (app shell anterior, MiniApps, testes, protótipos e utilitários redundantes).
- Manifesto convertido para `public/manifest.webmanifest` com atalhos `/?app=<slug>` e ícones dedicados.
- Novo offline fallback (`public/offline.html`) e pré-cache de fichas `docs/miniapps/*.md`.
- Documentação atualizada: `README.md`, [`docs/pwa.md`](../../docs/pwa.md), [`docs/migration-pre-to-post-pwa.md`](../../docs/migration-pre-to-post-pwa.md) e fichas dos MiniApps.
- `styles/main.css` reduzido ao núcleo do shell atual, eliminando utilitários órfãos apontados pelo coverage inicial.

## Inventário
- Arquivo: [`reports/pwa-cleanup-2025-10-28/inventory.json`](inventory.json)
- Arquivos rastreados: 59
- Itens essenciais (status `required`): 38
- Itens de suporte/documentação (status `referenced`): 21
- Órfãos: 0

## Cobertura CSS/JS (DevTools)
- Desktop: [`coverage-report/desktop.json`](coverage-report/desktop.json)
  - JS: 100% (141.423 bytes executados)
  - CSS: 81,32% após a consolidação dos estilos essenciais (`auth.css`, `main.css`, `tokens.css`)
- Mobile (iPhone 13): [`coverage-report/mobile.json`](coverage-report/mobile.json)
  - JS: 100% (141.423 bytes executados)
  - CSS: 81,32%

## Validações executadas
- **Service Worker**: registrado, cache `miniapp-base::pwa::0.2.0` contém `public/offline.html` e navigation preload ativado para evitar respostas stale.
- **Offline básico**: navegando sem rede, a resposta retorna `public/offline.html` automaticamente e restaura o shell ao retomar a conexão.
- **Atalhos MiniApp**: `/?app=task-manager` redireciona para `docs/miniapps/task-manager.md`.

## Próximos passos sugeridos
- Monitorar `inventory.json` em limpezas trimestrais para evitar reincidência de órfãos.
- Manter proteção da branch `main` ativa até concluir code review do PR desta limpeza.
- Avaliar automação de testes de fallback offline (ex.: Playwright) para complementar as validações manuais.
