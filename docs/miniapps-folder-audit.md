# Auditoria da pasta `MiniApps/`

## Objetivo
Avaliar se a pasta destinada a receber novos MiniApps está preparada para manter a organização e as boas práticas adotadas no
restante do repositório.

## Itens verificados
- Existência de diretrizes atualizadas para estrutura, documentação e testes.
- Orientações sobre integração com catálogos, painéis e metadados globais do aplicativo.
- Recomendações de manutenção alinhadas ao fluxo de versionamento descrito no `Log.md` e no `AGENTS.md` principal.

## Conclusões
- O guia de contribuição em `MiniApps/readme.mb` foi expandido para detalhar a estrutura mínima de pastas (`src/`, `ui/`,
  `styles/`, `tests/`, `docs/`, `assets/`) e os artefatos obrigatórios (`README.md`, `CHANGELOG.md` ou `log.md`, suites de teste
  e seeds/mocks quando necessários).
- As instruções agora orientam a sincronização dos catálogos (`scripts/data/miniapp-store.js` e `scripts/views/miniapp-store.js`)
  e testes (`tests/miniapp-store-data.test.js`) sempre que um MiniApp for criado ou alterado.
- Boas práticas sobre reutilização de estilos, responsividade, acessibilidade e limpeza de artefatos foram registradas, reforçando
  a consistência com o restante do projeto.

Com isso, a pasta `MiniApps/` está preparada para receber novos MiniApps mantendo a organização esperada.
