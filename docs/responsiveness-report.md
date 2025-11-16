# Relatório de Responsividade do Shell

Este relatório registra validações visuais do shell e do grid de cards após os ajustes de largura máxima e altura fixa do contêiner.

## Configuração de teste
- Servidor estático local iniciado com `python -m http.server 8000` na raiz do projeto.
- Visualizações capturadas via Playwright com viewport em 360x720, 820x1180 e 1400x900.
- Tema padrão claro, com header e footer renderizados pela estrutura existente do `index.html`.

## Observações por resolução
- **360px (mobile)**: o shell ocupa 100% da altura (`100vh`), mantendo header e footer sempre visíveis. O painel central rola de forma independente sem barra aparente. O grid fixa os cards em **300px** e comporta **1 coluna** com gap de 1.2rem, respeitando o padding lateral do contêiner.
- **820px (tablet)**: o contêiner permanece centralizado e limitado a 1280px. O grid comporta **2 colunas** de 300px com cards alinhados ao topo, mantendo o espaçamento lateral e o gap de 1.2rem. O footer continua fixo enquanto o painel central rola.
- **1400px (desktop widescreen)**: o shell é limitado a 1280px e centralizado, deixando margens laterais visíveis no body. O grid usa cards de **300px** e normalmente exibe **4 colunas** (ou 3 quando o espaço remanescente não acomoda outra coluna completa), mantendo os cards alinhados ao topo.

## Comportamentos confirmados
- `.app-shell` mantém largura máxima de 1280px, padding de 1rem e altura travada em `100vh`, evitando scroll externo no body.
- `.app-main` consome o espaço remanescente entre header e footer, com `overflow-y: auto` e barra de rolagem oculta, garantindo que apenas o painel central role.
- `.responsive-panel-grid` utiliza `repeat(auto-fit, minmax(300px, 300px))` com gap de 1.2rem, fixando os cards em 300px de largura, alinhando itens ao topo e sem padding duplicado no grid.
