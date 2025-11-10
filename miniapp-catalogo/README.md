# Catálogo de MiniApps

Esta pasta hospeda o catálogo padrão carregado pelo shell (`index.html`). O arquivo é propositalmente simples e cria dois carrosséis horizontais utilizando o utilitário `miniapp-base/components/carousel.js`:

- **Favoritos:** linha fixa com os MiniApps destacados (`favorite: true` no array do script).
- **Todos os MiniApps:** linha com a lista completa disponível no MiniApp Base.

## Como funciona

- Os dados de cada MiniApp ficam centralizados no array `miniapps` dentro do script inline. Sempre que um novo MiniApp for adicionado ao repositório, basta incluir um objeto com `id`, `name`, `description`, `icon`, `theme` e `href` e, opcionalmente, marcar `favorite: true` para mantê-lo na linha de favoritos.
- Cada cartão é gerado dinamicamente por `createCard`, que monta a estrutura `.catalog-card` com os atributos exigidos pelo shell (`data-miniapp-target`, `data-miniapp-name`, etc.) e aplica as classes do design system (`.app-card`, `.app-icon`, `app-icon--theme-*`).
- Após popular os containers, o script chama `CarouselManager.mount(container)` para que o carrossel compartilhado trate o comportamento responsivo, botões de navegação e acessibilidade.
- Ao finalizar a renderização, o catálogo notifica o shell via `postMessage` com `{ action: 'miniapp-header', title, subtitle, icon, iconTheme }`, garantindo a sincronização do cabeçalho.

## Diretrizes

- Não há sistema de tradução: todos os textos são definidos diretamente em português.
- Utilize apenas os estilos presentes em `miniapp-base/style/styles.css`. Qualquer ajuste visual deve ser feito no design system ao invés de CSS local.
- Certifique-se de manter os ícones com as classes temáticas (`app-icon--theme-*`) para preservar o formato circular e seguir o padrão do HEAD.
