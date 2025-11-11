# miniapp-prefeito/

MiniApp padrão focado em consumo de dados públicos para prefeitos.

## Estrutura
- `index.html` – interface principal com chamada para configurar a fonte de dados, painel em iframe e visualização do JSON.
- `js/config-source.js` – utilitário para validar, salvar e testar URLs de dados ou painéis externos.
- `data/sample.json` – dados locais utilizados como fallback offline.

## Regras de integração
- A página principal já envia `window.parent.postMessage({ action: 'miniapp-header', ... })` ao carregar e quando a fonte muda; mantenha esse comportamento se fizer ajustes.
- Dados remotos devem ser acessados via HTTPS. URLs inválidas devem ser bloqueadas pelo `config-source.js`.
- Se novos modos de visualização forem adicionados, preserve a lógica de fallback e atualize este README com as instruções.
