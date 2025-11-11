# miniapp-catalogo

Catálogo público de MiniApps com filtros de busca, integração com Firestore e fallback local.

## Integração com o shell
- Recebe `{ action: 'shell-theme', theme }` para alternar entre temas claro e escuro. O script principal responde com `{ action: 'miniapp-theme-ready' }` ao carregar e confirma a aplicação via `{ action: 'miniapp-theme-applied', theme }` após atualizar `body[data-theme]` e os estilos Tailwind sobrescritos.
- Os links com `data-open-miniapp` continuam enviando `{ action: 'load-miniapp', url, metadata }` para abrir o conteúdo no painel principal do shell.
