# CHANGELOG

## [Unreleased]
- Estrutura base do MiniApp-Base com Hubs e MiniApps plugáveis.
- Pipeline GitHub Pages com `index.html` na raiz.
- feat(index): botão de backup exposto no header do novo index
- feat(backup): página `src/pages/backup-google.html` disponível para o fluxo Google
- feat(backup): ativação Drive/OneDrive no perfil do aluno
- fix(backup): inicialização resiliente de OAuth e pendências por provedor
- fix(perfil aluno): persistência local dos dados e compatibilidade do painel com alternância de tema
- feat(core/header): helper centralizado de dados do usuário e autofill no perfil do aluno
- feat(core/header): header unificado com estado compartilhado entre rotas
- fix(core/header): carregamento absoluto do header para manter o localforage e dados em todas as telas
- fix(core/header): cache de carregamento para evitar assets duplicados e reforço de acessibilidade/foco no painel do usuário
- feat(core/header): botão de backup dedicado abrindo fluxo existente no index
- chore(public): restauração da home legada e dos artefatos estáticos (manifest, service worker, MiniApp Educação)
- docs(painel aluno): diretrizes de rotas, cartões clicáveis, ocultação de botões ao rolar, padrões de tema e checklist visual
- chore: armazenamento local compartilhado validado manualmente no smoke-test
- chore: padronização dos HTMLs com placeholder de header global e remoção de barras locais
- fix(auth): validação explícita do Client ID do Google com erro orientativo no fluxo de login
- docs(backup): instruções para injetar Client IDs de OAuth no ambiente de deploy
- fix(responsividade catálogo): cards do catálogo e seleção de persona reajustados para telas pequenas, evitando sobreposição

## [2024-06-07]
- Ingestão do pacote `cards-2000` para alimentar o novo index dinâmico.
- Ativação do novo `index.html` com link para home legada preservada em `public/legacy/`.
- Organização dos MiniApps e dados em `src/`, movendo o Educação para `src/miniapps/educacao/`.
- Inclusão de manifest/service worker mínimos e remoção do `TEMP_INBOX/` temporário.
