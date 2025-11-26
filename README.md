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

## Backup e sincronização
- No index, use o botão de **backup** no header para abrir a janela dedicada ao Drive/OneDrive.
- Na janela, escolha o provedor, conclua o OAuth na nova aba e acompanhe o status antes de fechar.
- Configure os client IDs no runtime expondo `window.GOOGLE_CLIENT_ID` e `window.MS_CLIENT_ID` antes de carregar o index/fluxo de backup.

### Injetando CLIENT_ID no deploy
- Injete as variáveis globais antes de carregar a página (ex.: snippet inline no HTML servido pelo ambiente de deploy):
  ```html
  <script>
    window.GOOGLE_CLIENT_ID = "seu-client-id-google";
    window.MS_CLIENT_ID = "seu-client-id-onedrive";
    // Opcional: objeto agrupado para backups
    window.__BACKUP_OAUTH__ = { googleClientId: window.GOOGLE_CLIENT_ID };
  </script>
  ```
- Não comitar client IDs; use injeção no runtime ou secrets do pipeline para preencher o HTML entregue ao usuário.

## Diretrizes do painel do aluno
- **Subpáginas e rotas**: o painel deve expor as entradas `/painel-aluno`, `/painel-aluno/aulas`, `/painel-aluno/atividades`, `/painel-aluno/notas` e `/painel-aluno/configuracoes`, mantendo o estado de navegação consistente entre elas.
- **Cards 100% clicáveis**: todo card que representa uma aula, atividade ou atalho de configuração deve ter a área completa clicável e levar à rota correspondente.
- **Ocultar botões ao rolar**: botões flutuantes ou de ação rápida devem recolher/ocultar ao rolar para baixo e reexibir ao rolar para cima para preservar a leitura.
- **Tema claro/escuro**: use apenas os padrões globais de tema claro/escuro do projeto (tokens de cor e classes de tema existentes) ao criar/alterar telas do painel.
- **Checklist visual**: antes de enviar alterações, valide alinhamento dos cards, contraste mínimo WCAG AA, comportamento hover/focus, responsividade (mobile/desktop) e legibilidade em ambos os temas.

## Contribuição
- Novos MiniApps vão para `src/miniapps/<nome>/`.
- Catálogos/dados públicos ficam em `src/modules/content/catalog/`.
- Ao adicionar funcionalidades, atualize `CHANGELOG.md` e `AGENTE.md`.
- Não deixe `TEMP_INBOX/` no repositório final.
