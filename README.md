# MiniApp Base — Reset 100%

Este repositório contém o pacote base atualizado do ecossistema de MiniApps da 5 Horas. A estrutura foi simplificada para servir como shell PWA independente, com catálogo inicial, MiniApp Prefeito e suporte offline.

> **Integração recomendada com WordPress/Elementor**: publique esta pasta em um host estático (GitHub Pages, Vercel, etc.) e incorpore o shell (`index.html`) via `<iframe>` no site principal. Não injete CSS ou JS deste repositório diretamente no WordPress.

## Componentes principais
- **Shell PWA (`index.html`)** – hospeda o catálogo e os miniapps em um iframe único (`#miniapp-panel`). Expõe `window.loadMiniApp(url, metadata)` para abrir miniapps dinamicamente e registra `sw.js` para operação offline.
- **Catálogo (`miniapp-catalogo/index.html`)** – lista de miniapps que consome `catalog.json`, uma planilha pública em CSV ou o fallback embutido.
- **MiniApp Prefeito (`miniapp-prefeito/`)** – experiência padrão carregada pelo catálogo, capaz de consumir dados em JSON/CSV ou incorporar um painel externo via iframe seguro.
- **Design System (`miniapp-base/style/styles.css`)** – CSS escopado com a classe `.ma`, responsável por reset, tokens, componentes e utilitários compartilhados.

## Estrutura
```
index.html               # Shell PWA
manifest.webmanifest     # Manifesto do app
sw.js                    # Service Worker cache-first
catalog.json             # Fonte local de miniapps (fallback)
js/
  app.js                 # Lógica do shell (postMessage, instalação, SW)
  catalog.js             # Loader/renderizador do catálogo
miniapp-base/
  style/styles.css       # Único arquivo de estilo compartilhado
  icons/README.md        # Instruções para adicionar manualmente os ícones PWA
miniapp-catalogo/index.html      # Catálogo inicial com fallback embutido
miniapp-prefeito/
  index.html             # MiniApp Prefeito com painel de dados/iframe
  js/config-source.js    # Utilitários para escolher e validar a fonte de dados
  data/sample.json       # Fallback local para modo offline
```

Todas as pastas possuem um `README.md` próprio descrevendo responsabilidades e limites de manutenção.

## Fluxo de desenvolvimento
1. Leia `AGENTE.md` e o `CHANGELOG.md` antes de iniciar uma modificação.
2. Abertura de novos miniapps exige adicionar o cartão correspondente ao `catalog.json` e opcionalmente ao fallback do catálogo embutido.
3. Miniapps devem enviar `window.parent.postMessage({ action: 'miniapp-header', title, subtitle })` assim que carregarem para atualizar o cabeçalho do shell.
4. Ao alterar o CSS, mantenha o escopo `.ma` e preserve a organização por camadas (`@layer`).
5. Atualize o `CHANGELOG.md` a cada alteração relevante.

## Publicação
1. Gere um build estático copiando a raiz do projeto para o host.
2. Limpe o cache do navegador e abra `index.html` hospedado.
3. Ao ser solicitado, utilize o botão **Instalar** para testar o modo PWA.
4. Com a internet desconectada, verifique o catálogo, abra o MiniApp Prefeito e confirme o fallback de dados local.

## Licença
Uso interno. Consulte os responsáveis antes de compartilhar ou reutilizar.
