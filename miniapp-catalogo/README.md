# miniapp-catalogo/

HTML responsável por listar os miniapps disponíveis dentro do shell.

## Arquivo principal
- `index.html` – carrega o design system compartilhado, injeta `window.CATALOG_FALLBACK` e importa `../js/catalog.js` para montar os cartões clicáveis.

## Manutenção
- Sempre que adicionar um miniapp novo, atualize `catalog.json` e considere incluir o item no fallback embutido para ambientes offline.
- Links devem continuar chamando `window.parent.loadMiniApp(url, metadata)` via evento de clique para manter a navegação dentro do shell.
- Evite inserir estilos adicionais aqui; ajustes visuais pertencem a `miniapp-base/style/styles.css`.
