# Miniapp de Cadastro de Usuários

Este miniapp apresenta um fluxo guiado para cadastrar novos usuários da plataforma. Ele foi projetado para ser carregado pelo shell principal (`index.html`) ou pelo catálogo padrão (`miniapp-catalogo/index.html`).

## Conteúdo
- `index.html`: marcação principal do miniapp e estrutura do formulário.
- `js/cadastro.js`: script responsável pela tradução das cópias, validação do formulário, persistência local dos dados e comunicação com o shell.

## Integração com o Shell
- O miniapp envia a mensagem `miniapp-header` via `postMessage` para sincronizar título, subtítulo e ícone com o shell.
- Elementos com o atributo `data-i18n` são traduzidos dinamicamente para `pt-BR`, `en-US` e `es-ES` conforme a preferência detectada ou selecionada pelo usuário.

## Manutenção
- Sempre que novos campos forem adicionados ao formulário, atualize as traduções em `js/cadastro.js` e garanta que as seções de dados pessoais e profissionais permaneçam consistentes.
- O miniapp reutiliza o stylesheet compartilhado em `miniapp-base/style/styles.css`; evite criar novos arquivos de estilo.
- Os dados do formulário são armazenados no `localStorage` do navegador após um envio válido para permitir reaproveitamento em visitas futuras. Preserve a estrutura serializada em `js/cadastro.js` ao incluir ou renomear campos e avalie se senhas ou dados sensíveis devem continuar sendo omitidos da persistência.
- O formulário exibe um feedback visual de sucesso ou erro após o envio; mantenha as traduções dos rótulos em `feedback.*` sincronizadas ao alterar as mensagens.
