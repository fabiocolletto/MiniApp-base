# Auditoria da pasta `MiniApps/`

## Objetivo
Avaliar se a pasta destinada a receber novos MiniApps está preparada para manter a organização e as boas práticas adotadas no
restante do repositório.

## Situação atual

O shell agora opera como experiência **white label** focada em um único MiniApp ativo. A pasta `miniapps/` concentra apenas o
registro `primary/`, que expõe `index.js` com o módulo padrão carregado automaticamente pelo loader oficial. Estruturas
legadas de catálogo, widgets ou listas públicas permanecem arquivadas em `archive/` e não participam mais do build.

Para substituir o MiniApp padrão, ajuste `miniapps/registry.json` com o novo `id` e `entry` e mantenha um diretório dedicado
no mesmo formato (`miniapps/<slug>/index.js`). Documente requisitos específicos do módulo em `docs/` e registre as mudanças
no `CHANGELOG.md`. Caso o shell volte a hospedar múltiplos MiniApps, reavalie estas diretrizes e restaure os fluxos de
catálogo a partir do material arquivado.
