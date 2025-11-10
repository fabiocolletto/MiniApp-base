# Catálogo de MiniApps

Esta pasta contém o catálogo padrão carregado pelo shell (`index.html`). O arquivo `index.html` lista os miniapps disponíveis e deve manter as seguintes regras:

- Todos os links precisam apontar para a entrada HTML do miniapp com `target="miniapp-panel"` e atributos `data-miniapp-target`, `data-miniapp-name`, `data-miniapp-description`, `data-miniapp-icon-symbol` e `data-miniapp-icon-theme`.
- Os ícones exibidos nos cartões utilizam as classes `.app-icon` combinadas com as variações `app-icon--theme-*` definidas em `miniapp-base/style/styles.css`.
- Qualquer novo miniapp deve atualizar este catálogo antes de solicitar carregamento direto via `postMessage`.

## Barra de favoritos

- Cada cartão possui um botão com o ícone de estrela (`.catalog-card__favorite`) posicionado no canto superior direito. Esse botão
  alterna o estado de favorito, atualiza a classe `is-favorited` no cartão e persiste a seleção em `localStorage` (`miniappCatalogFavorites`).
- Quando há pelo menos um item marcado, a seção de favoritos (`.catalog-favorites`) é exibida acima da grade principal como um
  carrossel horizontal que replica os cartões originais. Remover a estrela em qualquer lugar (grade ou carrossel) sincroniza o estado
  em ambos os contextos.
- Todos os textos visíveis e atributos acessíveis utilizam chaves i18n definidas diretamente em `index.html`. Sempre que novos itens
  ou mensagens forem adicionados, inclua traduções para `pt-BR`, `en-US` e `es-ES` no objeto `translations` do script inline.
