# Miniapp TTS

Este protótipo concentra as telas e interações do gerador de roteiros para locução.

## Conteúdo
- `index.html`: interface principal do gerador com suporte a múltiplos idiomas (sincronizados pelo shell) e prévia de áudio com ajustes de velocidade, volume e pausa entre blocos.

## Manutenção
- Sempre revise `AGENTE.md` na raiz para aplicar as convenções gerais.
- Ao incluir novos campos ou textos, lembre-se de atualizar o objeto de traduções para `pt-BR`, `en-US` e `es-ES`.
- O idioma da interface é definido pelo shell via mensagens `postMessage({ action: 'set-locale', locale })`; o miniapp inicia solicitando `postMessage({ action: 'request-locale' })` quando carregado. Evite reintroduzir controles manuais de idioma no HTML.
