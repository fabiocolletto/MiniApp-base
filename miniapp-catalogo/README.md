# miniapp-catalogo

Catálogo público de MiniApps com filtros de busca. Os dados são carregados do array `STATIC_CATALOG_ITEMS` declarado no próprio `index.html`, permitindo que todas as alterações sejam feitas diretamente neste arquivo.【F:miniapp-catalogo/index.html†L60-L154】

## Dados estáticos
- Cada MiniApp exibido no catálogo deve possuir um objeto dentro do `STATIC_CATALOG_ITEMS` com `id`, `name`, `description`, `url`, `icon_url`, além dos metadados `category`, `category_key`, `status`, `status_key` e, opcionalmente, `required_role` e `translations` para localizar os campos por idioma.【F:miniapp-catalogo/index.html†L60-L154】
- Alterações no catálogo exigem apenas a atualização deste array; não há dependências com Firestore ou planilhas externas.
- O script normaliza os campos, aplica valores padrão (`Geral`/`Disponível`) quando necessário e preserva as traduções para que o shell continue recebendo os eventos `load-miniapp` com o idioma correto.【F:miniapp-catalogo/index.html†L150-L298】

### Tradução dos cards
- O miniapp respeita o evento `{ action: 'shell-language' }` disparado pelo shell, renderizando `name`, `description`, `category` e `status` conforme os dados do locale corrente. Quando um item não traz tradução específica, o texto padrão em português é utilizado como fallback, seguido pelo rótulo mapeado em `catalog.card.statusByKey` quando houver um `status_key` conhecido.【F:miniapp-catalogo/index.html†L150-L298】【F:js/i18n.js†L1-L122】
- Para adicionar um novo idioma, preencha `translations[locale]` nos itens relevantes e inclua o locale em `js/i18n.js` (metadados + `catalog.card.statusByKey`). Sempre valide trocando o idioma no shell e confirmando a atualização dos filtros, cards e metadados enviados via `postMessage`.

## Integração com o shell
- Recebe `{ action: 'shell-theme', theme }` para alternar entre temas claro e escuro. O script principal responde com `{ action: 'miniapp-theme-ready' }` ao carregar e confirma a aplicação via `{ action: 'miniapp-theme-applied', theme }` após atualizar `body[data-theme]` e os estilos Tailwind sobrescritos.
- Os links com `data-open-miniapp` continuam enviando `{ action: 'load-miniapp', url, metadata }` para abrir o conteúdo no painel principal do shell.
