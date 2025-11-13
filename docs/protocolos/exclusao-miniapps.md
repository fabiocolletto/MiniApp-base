# Protocolo — Remoção de MiniApps

Siga este roteiro sempre que um MiniApp precisar ser descontinuado do shell.

## 1. Atualizar o catálogo e navegação
- Remova o item correspondente do array `STATIC_CATALOG_ITEMS` em `miniapp-catalogo/index.html`, mantendo apenas os MiniApps ativos.
- Garanta que o shell permaneça navegável offline ao menos com o catálogo padrão. Se um novo MiniApp substituir o catálogo como experiência principal, valide a navegação antes da remoção definitiva.

## 2. Revisar dependências técnicas
- Faça uma busca global pelo identificador do MiniApp removido para localizar integrações (`postMessage`, loaders dedicados, autenticação, tests) e limpe referências órfãs.
- Atualize o `sw.js` e quaisquer assets offline relacionados para que o Service Worker deixe de armazenar arquivos inexistentes.
- Ajuste suites de teste automatizadas que carregavam o MiniApp retirado.

## 3. Documentar a alteração
- Atualize os `README.md` impactados e descreva que o MiniApp foi removido, incluindo quais experiências permanecem como padrão.
- Registre a mudança no `CHANGELOG.md`, citando motivo e impacto esperado.
- Se novos protocolos surgirem durante a remoção, adicione-os a este diretório e atualize os índices correspondentes.

## 4. Comunicar e versionar
- Abra uma solicitação de revisão descrevendo motivo, impacto e telas afetadas; anexe o trecho pertinente do `CHANGELOG.md`.
- Após aprovação, publique a alteração seguindo o fluxo padrão do projeto (build estático, validação offline, etc.).
