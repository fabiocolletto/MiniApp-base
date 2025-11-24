# MiniApp-Base (Projeto Marco / MiniApps 5 Horas)

Este repositório é a base PWA (offline-first) para múltiplos MiniApps.  
Ele contém um *Stage* central (iframe/rotas) e Hubs compartilhados (persistência, sync, auth, i18n, payments etc).

## Entradas principais
- `index.html` na raiz é o HTML servido pelo GitHub Pages.
- `public/` contém apenas assets públicos (sw.js, manifest, icons).
- `src/` contém os Hubs (`src/core/`) e MiniApps (`src/miniapps/`).

## Como contribuir (resumo)
1. Coloque qualquer novo MiniApp dentro de `src/miniapps/<nome>/`.
2. Sempre use os Hubs de `src/core/` — nada de lógica duplicada.
3. Atualize `CHANGELOG.md` e `AGENTE.md` quando adicionar/alterar funcionalidades.

Mais detalhes em `docs/architecture.md`.
