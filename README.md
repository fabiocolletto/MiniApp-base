# MiniApp 5Horas – núcleo reduzido

O repositório foi higienizado para manter apenas o que é necessário para os cinco MiniApps em criação, o header legado e o footer principal. O shell continua sendo uma PWA estática com HTML, CSS e módulos ES simples.

## Itens preservados
- **5 MiniApps em criação**: `home`, `alertas`, `gestao-de-catalogo`, `gestao-de-conta-do-usuario` e `configuracoes-do-sistema`, todos apenas com aviso de desenvolvimento.
- **Footer oficial** (`docs/components/app-shared-footer.js`), responsável por controlar o stage do shell.
- **Header legado** (`docs/components/app-shared-header.js`) para MiniApps que precisarem de barra superior interna.
- **Shell do catálogo** (`index.html`), com cartões renderizados por `docs/miniapp-card.js` e estilos em `docs/miniapp-global.css` e `docs/miniapp-card.css`.

## Estrutura atual
```
.
├── assets/                # Ícones e imagens usados pelo shell
├── docs/
│   ├── components/        # Header e footer compartilhados
│   ├── miniapp-card.css   # Estilos dos cartões do catálogo
│   ├── miniapp-card.js    # Renderização e listeners dos cartões
│   ├── miniapp-data.js    # Fonte de dados do catálogo (pode ficar vazia durante a criação)
│   └── miniapp-global.css # Estilos globais do shell
├── js/
│   ├── googleSync.js      # Integração opcional com Google e fila offline
│   ├── indexeddb-store.js # Acesso ao IndexedDB
│   └── miniapp-data-loader.js # Loader com fallback remoto para miniapp-data.js
├── miniapps/              # MiniApps em desenvolvimento
├── pwa/                   # Manifesto do PWA
├── service-worker.js      # Service worker usado pelo shell
└── index.html             # Shell principal sem header
```

## Status dos MiniApps
Cada pasta em `miniapps/` expõe um `index.html` simples apenas com aviso de que o conteúdo está em construção. Nenhum fluxo completo foi publicado.

## Desenvolvimento local
Nenhuma dependência Node é necessária além do precache do service worker. Use qualquer servidor HTTP simples (ex.: `python -m http.server`) para navegar pelo shell e verificar os placeholders.
