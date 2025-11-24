# MiniApp Hub (PWA estático)

Hub central para MiniApps com entrega estática (GitHub Pages). A home `index.html` consome o catálogo `cards-2000` e expõe os MiniApps ativos, mantendo a home anterior como fallback para validação.

## Estrutura
```
.
├─ index.html            # Novo index ativo (carrega cards-2000)
├─ AGENTE.md             # Guia operacional do Codex
├─ CHANGELOG.md          # Histórico de releases
├─ public/
│  ├─ manifest.json      # Metadados PWA
│  ├─ sw.js              # Service worker placeholder
│  ├─ legacy/index-legacy.html # Home antiga preservada
│  └─ miniapps/educacao/ # Build estático do MiniApp Educação
├─ src/
│  ├─ app/index/         # Fonte do novo index (mesmo HTML do root)
│  ├─ modules/content/catalog/cards-2000.json # Catálogo de cards
│  └─ miniapps/educacao/ # Fonte do MiniApp Educação
└─ docs/architecture.md  # Detalhamento da arquitetura
```

## Como usar
1. Sirva a raiz com um servidor estático (`python -m http.server 8000`).
2. Acesse `/` para ver o novo index alimentado pelos cards.
3. Para a versão legada, abra `/public/legacy/index-legacy.html`.
4. O MiniApp Educação segue disponível em `/public/miniapps/educacao/`.

## Contribuição
- Novos MiniApps vão para `src/miniapps/<nome>/`.
- Catálogos/dados públicos ficam em `src/modules/content/catalog/`.
- Ao adicionar funcionalidades, atualize `CHANGELOG.md` e `AGENTE.md`.
- Não deixe `TEMP_INBOX/` no repositório final.
