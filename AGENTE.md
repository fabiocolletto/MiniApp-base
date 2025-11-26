# AGENTE.md — Guia Operacional do Codex

## Objetivo
Este arquivo define **como o Codex deve operar neste repositório**:
- padrões de pastas/arquivos
- fluxo seguro de implantação
- regras de revisão antes de commit
- limpeza de artefatos temporários

## Fluxo padrão de implantação via TEMP_INBOX
1. Receber um arquivo ZIP do usuário.
2. Descompactar em `TEMP_INBOX/`.
3. Validar:
   - nomes de arquivos/pastas
   - compatibilidade com tokens/estilos globais
   - ausência de segredos/keys no código
4. Mover **um a um** para o destino correto no repo.
5. Ajustar imports/paths se necessário.
6. Atualizar `CHANGELOG.md`.
7. Excluir `TEMP_INBOX/` e qualquer artefato temporário.
8. Criar commit com mensagem clara.

## Diretrizes específicas — Painel do Aluno
- Subpáginas obrigatórias: `/painel-aluno`, `/painel-aluno/aulas`, `/painel-aluno/atividades`, `/painel-aluno/notas` e `/painel-aluno/configuracoes`, com navegação sincronizada (breadcrumb/estado ativo).
- Cards devem ser totalmente clicáveis e direcionar para a rota configurada; não use botões internos como único alvo de clique.
- Botões de ação flutuantes devem ocultar ao rolar para baixo e reaparecer ao rolar para cima; evite sobrepor conteúdo textual.
- Respeite os tokens/classes globais de tema claro/escuro; não introduza paletas locais.
- Checklist visual obrigatório: alinhamento de grid, contraste WCAG AA, estados hover/focus, responsividade mobile/desktop e conferência de legibilidade nos dois temas.
- Sempre que alterar fluxos/UX do painel do aluno, registre a mudança em `CHANGELOG.md`.

## Convenções de pastas
- Hubs compartilhados: `src/core/<hub>/`
- Funcionalidades de alto nível: `src/modules/<modulo>/`
- MiniApps plugáveis: `src/miniapps/<miniapp>/`
- UI reutilizável: `src/ui/`
- Assets públicos: `public/`
- Home legada: `public/legacy/index-legacy.html` (não remover)
- Novo index fonte: `src/app/index/` (raiz publica em `index.html`)

## Segurança
- Nunca commitar `.env`, tokens, chaves.
- Variáveis sensíveis devem ir para secrets no pipeline ou placeholders.

## Observações operacionais
- Client IDs de backup (`window.GOOGLE_CLIENT_ID`, `window.MS_CLIENT_ID`) devem ser injetados apenas em tempo de execução (ex.: script inline configurado na plataforma de deploy) antes de carregar o index/páginas de backup.

## Fluxo de Backup — Google/OneDrive
- Sempre usar OAuth disparado por interação do usuário (sem pré-autorização automática).
- Tokens devem ser armazenados apenas em IndexedDB via `idb-keyval` e nunca em arquivos versionados.
- Client IDs devem vir de variáveis globais injetadas em tempo de execução (`window.GOOGLE_CLIENT_ID`, `window.MS_CLIENT_ID` ou `window.__BACKUP_OAUTH__`).
- Mantém o layout existente das telas; apenas conecte botões a fluxos reais de autenticação.
