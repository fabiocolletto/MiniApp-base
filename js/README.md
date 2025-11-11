# js/

Scripts compartilhados entre o shell (`index.html`) e os miniapps.

## Arquivos
- `app.js` – controla o iframe principal, integra `postMessage`, restaura o último miniapp aberto e registra o Service Worker.
- `catalog.js` – carrega a lista de miniapps a partir de `window.CATALOG_GOOGLE_SHEET_CSV`, `catalog.json` ou do fallback embutido e renderiza os cartões clicáveis.

## Manutenção
- Prefira funções puras e utilitários reutilizáveis. Novos módulos devem ser adicionados aqui apenas quando realmente compartilhados entre múltiplos miniapps.
- Evite dependências externas. Os scripts devem funcionar abrindo o HTML diretamente no navegador.
- Atualize este README sempre que novos arquivos forem criados ou removidos.
