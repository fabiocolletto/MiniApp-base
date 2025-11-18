# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Adicionado
- Shell 100% React com navegação por componentes e suporte a iframe externo.

### Alterado
- Layout React ajustado para refletir o visual do shell estático anterior (stage centralizado e rodapé compacto).
- `package.json` atualizado para Vite + React, com novos scripts de build e preview.
- `index.html` convertido para entrada Vite com montagem do root React.
- Documentação (`README.md`) ajustada para refletir a nova arquitetura.

## [0.1.0] - 2024-04-XX
### Adicionado
- Cadastro do MiniApp **Catálogo 5Horas** com identificador único (`catalogo-5horas`) e imagem placeholder dedicada.
- Salvaguardas no `index.html` para gerar identificadores válidos antes de usar a fila offline ou salvar preferências.
- Persistência de `id` nos cards (`docs/miniapp-card.js`) para manter consistência entre grid, modal e IndexedDB.
- Documentação inicial (`README.md`) com protocolo para inclusão, teste e governança de MiniApps.

### Alterado
- Normalização do arquivo `docs/miniapp-data.js` para formato multilinha e inclusão explícita de `id` para todos os MiniApps.
