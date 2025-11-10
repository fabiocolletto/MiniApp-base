# Catálogo de MiniApps

Esta pasta hospeda o catálogo padrão carregado pelo shell (`index.html`). O arquivo cria dois carrosséis horizontais utilizando o utilitário `miniapp-base/js/carousel.js` e mantém o estado de favoritos no `localStorage` quando disponível:

- **Favoritos:** linha fixa com os MiniApps destacados (`favorite: true` no array do script).
- **Todos os MiniApps:** linha com a lista completa disponível no MiniApp Base.

## Como funciona

- Os dados de cada MiniApp ficam centralizados no array `miniapps` dentro do script inline. Sempre que um novo MiniApp for adicionado ao repositório, inclua um objeto com `id`, `name`, `description`, `icon`, `theme` e `href`. A chave `favorite` continua servindo como sugestão inicial para o conjunto padrão.
- O estado de favoritos é calculado a partir de `favoritesSet`: primeiro tenta carregar o valor salvo em `localStorage` (`miniappCatalog.favorites`) e, se não houver dados válidos, usa os itens com `favorite: true` como default. A função `toggleFavorite` mantém o `Set`, atualiza o array base e dispara `renderCatalog()` para remontar os carrosséis.
- Cada cartão é gerado dinamicamente por `createCard`, que monta a estrutura `.catalog-card`, injeta o botão `.catalog-card__favorite` com o ícone de estrela e aplica os atributos exigidos pelo shell (`data-miniapp-target`, `data-miniapp-name`, etc.).
- `renderCatalog` chama `mountCarousel` para preencher os carrosséis. Quando o container já está vinculado ao `CarouselManager`, o helper atualiza apenas a `carousel-track` e aciona `CarouselManager.refresh` para preservar a acessibilidade.
- Ao finalizar a renderização, o catálogo notifica o shell via `postMessage` com `{ action: 'miniapp-header', title, subtitle, icon, iconTheme }`, garantindo a sincronização do cabeçalho.
- O cabeçalho enviado ao shell e os rótulos do botão de favorito possuem variações em `pt-BR`, `en-US` e `es-ES`, usando `getActiveLocale()` para escolher o texto correto.
- O container visual de cada MiniApp no catálogo nasce do `<template data-miniapp-card-template>` em `index.html`. O organismo `catalog.js` clona o modelo, preenche os dados (ícone, título, descrição e atributos do shell) e aplica os estados de favorito, permitindo reutilizar o mesmo layout em qualquer carrossel.

## Diretrizes

- Utilize apenas os estilos presentes em `miniapp-base/style/styles.css`. Qualquer ajuste visual deve ser feito no design system ao invés de CSS local.
- Certifique-se de manter os ícones com as classes temáticas (`app-icon--theme-*`) para preservar o formato circular e seguir o padrão do HEAD.
- Sempre que adicionar novos textos dinâmicos, atualize os objetos `FAVORITE_COPY` e/ou `CATALOG_HEADER_COPY` para contemplar os três idiomas suportados (pt-BR, en-US, es-ES).
