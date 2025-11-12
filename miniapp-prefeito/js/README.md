# miniapp-prefeito/js/

Scripts específicos do MiniApp Prefeito.

## Arquivos
- `config-source.js` – módulo auto contido responsável por validar URLs, testar conectividade, armazenar a fonte atual e expor utilitários (`PrefeitoConfig`).
- `config-source-simple.js` – controlador usado no demo que oferece gerenciamento de múltiplas planilhas, sincronização em lote, cache individual (`prefeito.cache.<id>`) e utilitários `window.PrefeitoCache` para leitura/escrita do cache.

## Boas práticas
- Mantenha o módulo sem dependências externas e compatível com navegadores modernos executando o miniapp dentro do shell.
- Sempre que expor novas funções no objeto `PrefeitoConfig` ou `PrefeitoCache`, documente-as aqui e no `miniapp-prefeito/README.md`.
- Lembre-se de atualizar a lista de assets do Service Worker se o miniapp passar a depender de novos arquivos críticos.
