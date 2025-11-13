# Guia do Agente

- Leia este arquivo, bem como `README.md` e `CHANGELOG.md`, antes de qualquer alteração para entender o estado atual do pacote base.
- O shell em `index.html` deve permanecer como ponto único de navegação. Sempre valide se o catálogo (`miniapp-catalogo/index.html`) envia eventos compatíveis com `window.parent.loadMiniApp` e se os miniapps confirmam o cabeçalho via `{ action: 'miniapp-header', title, subtitle }`.
- Scripts compartilhados residem em `js/` ou dentro dos diretórios dos miniapps. Evite duplicar lógica; prefira funções já expostas pelo shell ou pelo MiniApp.
- O CSS está centralizado em `miniapp-base/style/styles.css`. Preserve o escopo `.ma`, as camadas `@layer` e utilize tokens existentes antes de adicionar novos.
- Sempre que criar ou atualizar pastas, mantenha um `README.md` descrevendo propósito, pontos de atenção e instruções de manutenção.
- Ao finalizar uma tarefa, atualize este guia caso novas regras sejam necessárias e sincronize o `CHANGELOG.md` com as alterações relevantes.
- Assegure que o Service Worker (`sw.js`) continue atendendo ao shell e aos miniapps essenciais. Qualquer asset novo necessário offline deve ser adicionado à lista de pré-cache quando fizer sentido.
- A pasta `miniapp-base/icons/` permanece apenas com documentação. Não suba placeholders binários; os ícones reais (`icon-192.png` e `icon-512.png`) serão adicionados manualmente fora do fluxo do agente.

## SISTEMA DE USUÁRIOS — FASE 1
- O módulo de autenticação reside em `miniapp-base/js/auth.js` e usa o adaptador `miniapp-base/js/adapters/users-appscript.js` para falar com o Web App do Apps Script.
- O shell consulta `Auth.bootstrap()` antes de abrir o catálogo. Se `adminMissing` for `true`, carregue `miniapp-usuarios/index.html?mode=setup` e mantenha `window.__catalogDisabled__ = true` até concluir o bootstrap.
- MiniApps administrativos precisam marcar os cards do catálogo com `data-required-role="admin"` (veja o array `STATIC_CATALOG_ITEMS` em `miniapp-catalogo/index.html`). O shell bloqueia `loadMiniApp` quando o papel atual não atende ao requisito.
- Documentação e backend ficam em `docs/USUARIOS.md` e `docs/apps-script/users.gs`. Sempre atualize esses arquivos ao alterar regras de segurança ou formato do `usuarios.json`.
