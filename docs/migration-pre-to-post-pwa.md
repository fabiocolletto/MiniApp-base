# Migração pré ➜ pós PWA

A limpeza de 28/10/2025 consolidou o shell PWA na raiz e moveu todo o legado para `archive/2025-10-28/`. Esta página registra onde cada módulo vivia e o destino correspondente.

## Shell e fluxo principal

| Componente | Antes | Depois |
| --- | --- | --- |
| Tela de autenticação | `app/`, `ui/`, `router/` | `index.html`, `styles/`, `scripts/views/` |
| MiniApp Store legado | `scripts/views/miniapp-store.js` | Arquivado em `archive/2025-10-28/scripts/views/miniapp-store.js` |
| Painéis admin/usuário | `scripts/views/{admin,user}.js` | Arquivo completo em `archive/2025-10-28/scripts/views/` |
| Armazenamento de tarefas | `core/task-store.js` | `archive/2025-10-28/core/task-store.js` |

## MiniApps

| Item | Antes | Depois |
| --- | --- | --- |
| Código e documentação legada | `MiniApps/` | `archive/2025-10-28/MiniApps/` |
| Fichas ativas | – | `docs/miniapps/<slug>.md` |
| Atalhos públicos | – | `public/icons/shortcut-*.svg` + `/?app=<slug>` |

## Testes e ferramentas

| Item | Antes | Depois |
| --- | --- | --- |
| Testes automatizados | `tests/` | `archive/2025-10-28/tests/` |
| Utilidades de UI | `scripts/view-cleanup.js`, `scripts/system/`, `scripts/theme/` | `archive/2025-10-28/scripts/` |
| Protótipos temporários | `temp/` | `archive/2025-10-28/temp/` |

## Documentação

- Inventário completo e cobertura: `reports/pwa-cleanup-2025-10-28/`
- Histórico detalhado do legado: [`archive/2025-10-28/README.md`](../archive/2025-10-28/README.md)

Sempre que for necessário resgatar um componente antigo, consulte o diretório de arquivo correspondente e avalie se vale reintegrar ou reescrever adotando o shell PWA atual.
