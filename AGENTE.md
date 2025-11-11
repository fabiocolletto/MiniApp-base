# Guia do Agente

- Leia este arquivo, bem como `README.md` e `CHANGELOG.md`, antes de qualquer alteração para entender o estado atual do pacote base.
- O shell em `index.html` deve permanecer como ponto único de navegação. Sempre valide se o catálogo (`miniapp-catalogo/index.html`) envia eventos compatíveis com `window.parent.loadMiniApp` e se os miniapps confirmam o cabeçalho via `{ action: 'miniapp-header', title, subtitle }`.
- Scripts compartilhados residem em `js/` ou dentro dos diretórios dos miniapps. Evite duplicar lógica; prefira funções já expostas pelo shell ou pelo MiniApp.
- O CSS está centralizado em `miniapp-base/style/styles.css`. Preserve o escopo `.ma`, as camadas `@layer` e utilize tokens existentes antes de adicionar novos.
- Sempre que criar ou atualizar pastas, mantenha um `README.md` descrevendo propósito, pontos de atenção e instruções de manutenção.
- Ao finalizar uma tarefa, atualize este guia caso novas regras sejam necessárias e sincronize o `CHANGELOG.md` com as alterações relevantes.
- Assegure que o Service Worker (`sw.js`) continue atendendo ao shell e aos miniapps essenciais. Qualquer asset novo necessário offline deve ser adicionado à lista de pré-cache quando fizer sentido.
- A pasta `miniapp-base/icons/` permanece apenas com documentação. Não suba placeholders binários; os ícones reais (`icon-192.png` e `icon-512.png`) serão adicionados manualmente fora do fluxo do agente.
