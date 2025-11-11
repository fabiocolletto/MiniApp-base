# miniapp-catalogo

Catálogo público de MiniApps com filtros de busca. Os dados são carregados de forma estática a partir do arquivo `catalog.json` localizado na raiz do repositório.

## Dados estáticos
- Cada MiniApp exibido no catálogo deve possuir um objeto no `catalog.json` com `id`, `name`, `description`, `url`, `icon_url`, `category` e `status`.
- Alterações no catálogo exigem apenas a atualização deste arquivo; não há dependências com Firestore ou planilhas externas.
- O script normaliza os campos e aplica valores padrão (`Geral`/`Disponível`) quando necessário, garantindo que o shell continue recebendo os eventos `load-miniapp`.

## Integração com o shell
- Recebe `{ action: 'shell-theme', theme }` para alternar entre temas claro e escuro. O script principal responde com `{ action: 'miniapp-theme-ready' }` ao carregar e confirma a aplicação via `{ action: 'miniapp-theme-applied', theme }` após atualizar `body[data-theme]` e os estilos Tailwind sobrescritos.
- Os links com `data-open-miniapp` continuam enviando `{ action: 'load-miniapp', url, metadata }` para abrir o conteúdo no painel principal do shell.
