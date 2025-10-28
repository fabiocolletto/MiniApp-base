# Arquivo 2025-10-28

Esta pasta preserva os módulos removidos durante a limpeza pós-conversão PWA concluída em 28/10/2025.

## Conteúdo movido

- `Arquivados/` – registros históricos anteriores à reorganização atual.
- `MiniApps/` – código-fonte e documentação dos miniapps legados (mantidos apenas para referência).
- `app/`, `router/`, `ui/` – shell anterior baseado em múltiplos painéis e roteador customizado.
- `core/bootstrap.*`, `core/task-store.js` – bootstrap legado e armazenamento de tarefas, substituídos pelo shell simplificado.
- `scripts/` (subpastas) – visões administrativas, utilitários de UI, temas e integrações não utilizados no fluxo atual.
- `src/`, `tests/`, `temp/` – experimentos, testes automatizados e workspaces temporários.

## Como reutilizar

1. Avalie se o módulo atende às diretrizes atuais do PWA (desempenho, installability, offline controlado).
2. Caso precise reativar algum componente, copie-o para uma nova pasta de trabalho (ex.: `temp/<slug>/`) e adapte à arquitetura vigente.
3. Atualize `CHANGELOG.md` e `docs/migration-pre-to-post-pwa.md` sempre que algo retornar do arquivo.

Nenhum desses diretórios deve voltar à raiz sem revisão técnica e aprovação explícita.
