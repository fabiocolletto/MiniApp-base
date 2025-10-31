# Auditoria da pasta `MiniApps/`

## Objetivo
Avaliar se a pasta destinada a receber novos MiniApps está preparada para manter a organização e as boas práticas adotadas no
restante do repositório.

## Situação atual

O MiniApp Base foi convertido em **MiniApp Educação**, um único produto sem catálogo de MiniApps. A pasta `MiniApps/` permanece
arquivada apenas para referência histórica e não recebe mais contribuições ativas. As rotinas de sincronização de catálogo,
widgets e testes associados (`scripts/data/miniapp-store.js`, `scripts/views/miniapp-store.js`, `tests/miniapp-store*.test.js`)
foram descontinuadas.

Novos módulos educacionais devem ser documentados diretamente dentro do painel Educação ou em `docs/`, seguindo o fluxo padrão
de versionamento (`CHANGELOG.md` e registros no `AGENTS.md`). Caso seja necessário reativar múltiplos MiniApps no futuro, este
documento deverá ser revisado com novas diretrizes.
