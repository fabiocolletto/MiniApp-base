# MiniApp 5Horas – núcleo reduzido (base React)

O repositório foi higienizado para manter apenas o que é necessário para os cinco MiniApps em criação, o header legado e o footer principal. O shell agora é uma PWA estática servida por bundles React, preservando a entrega via arquivos estáticos.

## Itens preservados
- **5 MiniApps base (obrigatórios)**: `home`, `alerts`, `catalog`, `settings` e `account`, todos apenas com aviso de desenvolvimento. Os nomes das pastas acompanham os ícones do rodapé para manter rastreabilidade direta.
- **Footer oficial** (`docs/components/app-shared-footer.js`), responsável por controlar o stage do shell e passível de exposição como componente React.
- **Header legado** (`docs/components/app-shared-header.js`) para MiniApps que precisarem de barra superior interna.
- **Shell do catálogo** (`index.html`), agora montado por um app React que controla os stages via `app-shared-footer` e mantém os cartões renderizados por `docs/miniapp-card.js` e estilos em `docs/miniapp-global.css` e `docs/miniapp-card.css`.

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
│   └── miniapp-data-loader.js # Loader com fallback remoto para miniapp-data.js (importável por React)
├── miniapps/              # MiniApps em desenvolvimento
├── pwa/                   # Manifesto do PWA
├── service-worker.js      # Service worker usado pelo shell
└── index.html             # Shell principal sem header
```

## Base técnica em React
- **React/ReactDOM como padrão**: novos componentes e miniapps devem ser escritos em React, preferencialmente com componentes funcionais. O bundle gerado deve continuar produzindo saída estática para publicação simples.
- **Compatibilidade com utilitários existentes**: `googleSync.js`, `indexeddb-store.js` e `miniapp-data-loader.js` podem ser consumidos pelos componentes React, mantendo caminhos e APIs atuais.
- **Montagem do shell**: `index.html` injeta React/ReactDOM via CDN, renderiza o shell em `#root` e mantém o controle de navegação via eventos do `app-shared-footer`, sem header global. O footer emite `app:navigate` para troca de stage e tem seu estado (`expanded`/`collapsed`) sincronizado via `MutationObserver`.

## Status dos MiniApps
Cada pasta em `miniapps/` expõe um `index.html` simples apenas com aviso de que o conteúdo está em construção. Nenhum fluxo completo foi publicado. Todos são obrigatórios para o shell funcionar e deverão ser preenchidos com componentes React conforme evoluírem, respeitando o isolamento dentro de suas respectivas pastas.

## Desenvolvimento local
Nenhuma dependência Node é necessária além do precache do service worker para servir os arquivos resultantes do build. Use qualquer servidor HTTP simples (ex.: `python -m http.server`) para navegar pelo shell e verificar os placeholders gerados pelo React.
