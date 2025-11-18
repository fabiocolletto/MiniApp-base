# MiniApp React Shell

A aplicação foi reescrita para React usando Vite, mantendo os cinco stages principais (home, alerts, catalog, settings e account)
 e adicionando placeholders e um iframe externo controlados por estado.

## Estrutura
```
.
├── index.html            # Entrada Vite com root React
├── src/
│   ├── App.jsx           # Orquestra navegação e estágios
│   ├── main.jsx          # Bootstrap React
│   ├── components/
│   │   ├── IframeStage.jsx
│   │   ├── PlaceholderStage.jsx
│   │   └── StageFooter.jsx
│   └── styles/
│       ├── app.css
│       └── index.css
├── pwa/                  # Manifesto PWA preservado
├── service-worker.js     # Arquivo legado (não registrado pelo shell React)
├── package.json          # Scripts de build/dev com Vite
└── vite.config.js
```

## Scripts
- `npm install` – instala React, Vite e dependências.
- `npm run dev` – inicia o shell React em modo desenvolvimento.
- `npm run build` – gera o bundle para produção.
- `npm run preview` – serve o bundle gerado para revisão.

## Notas
- O antigo shell estático em HTML/JS foi substituído por componentes React, mas o visual permanece próximo ao layout clássico
 (stage centralizado, rodapé com ícones).
- O stage `account` abre um iframe externo como exemplo; ajuste `launchUrl` em `src/App.jsx` conforme necessário.
- O manifesto PWA e o service worker antigo permanecem na raiz para compatibilidade, mas a aplicação React não registra o servic
 e worker automaticamente.
