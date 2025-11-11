# Changelog

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
