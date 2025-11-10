# Scripts do miniapp de cadastro

Este diretório concentra a lógica do fluxo de cadastro de usuários.

## Arquivos
- `cadastro.js`: aplica as traduções, executa as validações de formulário e envia o cabeçalho atualizado para o shell.

## Diretrizes
- Mantenha todas as cópias traduzidas dentro do objeto `translations` para `pt-BR`, `en-US` e `es-ES`.
- Qualquer novo comportamento deve preservar a comunicação com o shell via `window.parent.postMessage`.
