# CHANGELOG

## [Unreleased]
- Estrutura base do MiniApp-Base com Hubs e MiniApps plugáveis.
- Pipeline GitHub Pages com `index.html` na raiz.
- feat(backup): ativação Drive/OneDrive no perfil do aluno
- fix(backup): inicialização resiliente de OAuth e pendências por provedor
- fix(perfil aluno): persistência local dos dados e compatibilidade do painel com alternância de tema
- docs(painel aluno): diretrizes de rotas, cartões clicáveis, ocultação de botões ao rolar, padrões de tema e checklist visual

## [2024-06-07]
- Ingestão do pacote `cards-2000` para alimentar o novo index dinâmico.
- Ativação do novo `index.html` com link para home legada preservada em `public/legacy/`.
- Organização dos MiniApps e dados em `src/`, movendo o Educação para `src/miniapps/educacao/`.
- Inclusão de manifest/service worker mínimos e remoção do `TEMP_INBOX/` temporário.
