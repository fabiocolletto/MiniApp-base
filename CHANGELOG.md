# Changelog

## [2025-11-15] Alternância de tema integrada ao shell
### Adicionado
- Botão para alternar tema claro/escuro diretamente no cabeçalho do shell, com persistência em `localStorage`, atualização do `<meta name="theme-color">` e broadcast do estado via `{ action: 'shell-theme', theme }` para catálogo e MiniApps.【F:index.html†L32-L51】【F:js/app.js†L20-L333】
- Scripts utilitários nos iframes (catálogo, gestor e MiniApp Prefeito) para responder aos eventos `{ action: 'shell-theme' }`, confirmar com `{ action: 'miniapp-theme-applied' }` e aplicar as classes `data-theme` necessárias.【F:miniapp-catalogo/index.html†L1-L396】【F:miniapp-gestor-de-catalogo/index.html†L1-L836】【F:miniapp-prefeito/index.html†L1-L52】
### Alterado
- Catálogo público e gestor administrativo receberam overrides de Tailwind condicionados a `body[data-theme="dark"]`, garantindo contraste adequado quando o shell força o modo escuro.【F:miniapp-catalogo/index.html†L8-L206】【F:miniapp-gestor-de-catalogo/index.html†L1-L120】
- Documentação atualizada com o fluxo de tema e handshake necessário para novos MiniApps.【F:README.md†L1-L60】【F:miniapp-catalogo/README.md†L1-L9】【F:miniapp-prefeito/README.md†L1-L13】

## [2025-11-11] Validação automatizada do catálogo e gestor
### Adicionado
- Suite de testes end-to-end com Playwright cobrindo catálogo público e gestor administrativo, usando servidor estático embutido e stubs do Firebase para validar persistência local e importação via Google Sheets.【F:playwright.config.js†L1-L17】【F:tests/catalog.spec.js†L1-L36】【F:tests/manager.spec.js†L1-L74】【F:tests/helpers/firebase.js†L1-L32】
### Corrigido
- Gestor de catálogos salva o ID da planilha importada no armazenamento local mesmo sem Firebase configurado, mantendo o shell sincronizado após importações offline.【F:miniapp-gestor-de-catalogo/index.html†L679-L686】

## [2025-11-14] Fallback local do catálogo sem Firebase
### Corrigido
- Catálogo passa a carregar automaticamente os MiniApps essenciais e itens do `catalog.json` quando a configuração do Firebase está ausente ou indisponível, mantendo a navegação pelo shell durante testes offline.【F:miniapp-catalogo/index.html†L118-L263】
- Tratamento de falhas no listener do Firestore foi atualizado para exibir o catálogo local em vez de deixar a tela vazia, garantindo acesso ao MiniApp Gestor e retorno ao catálogo.【F:miniapp-catalogo/index.html†L265-L323】
- Normalização dos itens do catálogo antes da renderização para evitar falhas quando campos obrigatórios (como `name`, `category` ou `status`) chegam incompletos do Firestore, mantendo os MiniApps essenciais visíveis mesmo com dados inconsistentes.【F:miniapp-catalogo/index.html†L205-L253】

## [2025-11-13] Shell com visões dedicadas e setup de planilha
### Adicionado
- Visões `#catalog-view` e `#app-view` no shell com helper `window.changeView` para alternar entre catálogo e MiniApps sem recarregar a página, além do formulário `#setup-sheet-view` para configurar a planilha do catálogo.【F:index.html†L32-L66】【F:js/app.js†L20-L134】
- Fluxo de bootstrap que consulta `artifacts/{appId}/admin/sheet_config` no Firestore (com fallback em cache) para recuperar o `GOOGLE_SHEET_ID`, exibindo o setup quando necessário.【F:js/app.js†L80-L223】
### Alterado
- Botão do catálogo passa a reabrir `#catalog-view` sem trocar o iframe principal, e o catálogo envia `postMessage` para carregar MiniApps no painel dedicado.【F:js/app.js†L51-L134】【F:miniapp-catalogo/index.html†L123-L375】
- CSS base incorpora estilos para as novas visões e campos de formulário utilizados na configuração da planilha.【F:miniapp-base/style/styles.css†L126-L169】

## [2025-11-12] Documentação de integração do catálogo
### Adicionado
- Orientações no `README.md` sobre como carregar o `miniapp-gestor-de-catalogo` a partir do shell e publicar o catálogo final.
- Detalhes de uso do `miniapp-catalogo`, incluindo dependências do Firestore e requisitos dos dados consumidos.

## [2025-11-11] Reset 100%
### Adicionado
- Shell PWA simplificado em `index.html` com botão de catálogo fixo, restauração do último miniapp e fluxo de instalação PWA.
- Service Worker `sw.js` com estratégia cache-first para operação offline, incluindo catálogo e MiniApp Prefeito.
- Manifesto `manifest.webmanifest` configurado com ícones placeholders (`miniapp-base/icons/icon-192.png` e `icon-512.png`).
- Catálogo base em `miniapp-catalogo/index.html` consumindo `catalog.json`, uma planilha CSV pública ou o fallback embutido.
- Novo design system escopado (`miniapp-base/style/styles.css`) com camadas `@layer`, tokens, componentes e utilitários únicos.
- MiniApp Prefeito reescrito em `miniapp-prefeito/` com seleção de fonte remota (JSON/CSV ou iframe) e fallback local (`data/sample.json`).
- Guia atualizado em cada pasta (`README.md`) descrevendo responsabilidades e manutenção.
- Pasta `miniapp-base/icons/` agora contém apenas instruções textuais para inclusão manual dos ícones PWA (`icon-192.png` e `icon-512.png`), já que os assets binários são providenciados fora do fluxo do agente.

### Alterado
- Organização do projeto reduzida para focar em shell, catálogo e MiniApp Prefeito, mantendo o CSS compartilhado em um único arquivo.
- `catalog.json` passa a representar o catálogo local padrão, alinhado ao fallback exibido quando nenhuma fonte externa é fornecida.
- Fluxo de comunicação via `postMessage` padronizado para `load-miniapp` e `miniapp-header`, simplificando integrações futuras.
- MiniApp Prefeito envia atualizações de cabeçalho ao shell conforme a fonte de dados selecionada ou mensagens de erro.

### Removido
- Miniapps legados (Cadastro, Importador, TTS) e scripts associados.
- Estrutura anterior de design system distribuído em `atoms`, `molecules` e `organisms`.
- Documentação antiga em `docs/` relacionada ao fluxo anterior do shell e catálogo.
