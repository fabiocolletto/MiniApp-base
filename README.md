# MiniApp – catálogo simplificado

Este repositório agora entrega apenas um shell HTML estático com o catálogo principal e o primeiro MiniApp placeholder (Educação). Tudo foi reduzido para facilitar integrações que consomem HTML direto, sem dependências ou bundles.

## Estrutura
```
.
├── assets/              # Ícones genéricos disponíveis para futuros usos
├── index.html           # Tela inicial com os quatro cards do catálogo
├── miniapps/
│   └── educacao/
│       └── index.html   # Página do MiniApp Educação com quatro cards placeholder
└── styles.css           # Estilos compartilhados entre o catálogo e o MiniApp
```

## Como usar
1. Sirva o diretório com qualquer servidor estático (por exemplo, `python -m http.server 8000`).
2. Acesse `http://localhost:8000/` para ver o catálogo com quatro cards estáticos.
3. Clique em **Educação** para abrir a página dedicada, também com quatro cards estáticos prontos para integrar novos fluxos.

Não há dependências adicionais ou build: os arquivos HTML referenciam apenas a folha de estilos compartilhada e a fonte Inter via CDN.
