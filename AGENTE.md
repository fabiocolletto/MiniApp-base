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

## Fluxo de Backup — Google/OneDrive
- Sempre usar OAuth disparado por interação do usuário (sem pré-autorização automática).
- Tokens devem ser armazenados apenas em IndexedDB via `idb-keyval` e nunca em arquivos versionados.
- Client IDs devem vir de variáveis globais injetadas em tempo de execução (`window.GOOGLE_CLIENT_ID`, `window.MS_CLIENT_ID` ou `window.__BACKUP_OAUTH__`).
- Mantém o layout existente das telas; apenas conecte botões a fluxos reais de autenticação.
