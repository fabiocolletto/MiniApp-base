# Catálogo de MiniApps

Esta pasta contém o catálogo padrão carregado pelo shell (`index.html`). O arquivo `index.html` lista os miniapps disponíveis e deve manter as seguintes regras:

- Todos os links precisam apontar para a entrada HTML do miniapp com `target="miniapp-panel"` e atributos `data-miniapp-target`, `data-miniapp-name`, `data-miniapp-description`, `data-miniapp-icon-symbol` e `data-miniapp-icon-theme`.
- Os ícones exibidos nos cartões utilizam as classes `.app-icon` combinadas com as variações `app-icon--theme-*` definidas em `miniapp-base/style/styles.css`.
- Qualquer novo miniapp deve atualizar este catálogo antes de solicitar carregamento direto via `postMessage`.
