# Miniapp de Cadastro de Usuários

Este miniapp apresenta um fluxo guiado para cadastrar novos usuários da plataforma. Ele foi projetado para ser carregado pelo shell principal (`index.html`) ou pelo catálogo padrão (`miniapp-catalogo/index.html`).

## Conteúdo
- `index.html`: marcação principal do miniapp e estrutura do formulário com layout compacto e integrado ao cabeçalho/rodapé do shell.
- `js/cadastro.js`: script responsável pela tradução das cópias, validação do formulário, persistência local dos dados e comunicação com o shell.

## Integração com o Shell
- O miniapp envia a mensagem `miniapp-header` via `postMessage` para sincronizar título, subtítulo e ícone com o shell, que agora exibe essas informações no cabeçalho compartilhado.
- Elementos com o atributo `data-i18n` são traduzidos dinamicamente para `pt-BR`, `en-US` e `es-ES` conforme o idioma informado pelo shell via `postMessage({ action: 'set-locale' })`.

## Manutenção
- Sempre que novos campos forem adicionados ao formulário, atualize as traduções em `js/cadastro.js` e garanta que as seções de dados pessoais e profissionais permaneçam consistentes.
- O miniapp reutiliza o stylesheet compartilhado em `miniapp-base/style/styles.css`; evite criar novos arquivos de estilo e centralize ajustes usando os seletores específicos `.miniapp-cadastro`.
- Os dados do formulário são armazenados no `localStorage` do navegador após um envio válido para permitir reaproveitamento em visitas futuras. Preserve a estrutura serializada em `js/cadastro.js` ao incluir ou renomear campos e avalie se senhas ou dados sensíveis devem continuar sendo omitidos da persistência.
- O formulário exibe um feedback visual de sucesso ou erro no rodapé por alguns segundos após o envio; mantenha as traduções dos rótulos em `feedback.*` sincronizadas ao alterar as mensagens e preserve o tempo configurado no script.
- O painel de cadastro apresenta apenas o formulário principal e oferece ações de cancelar e excluir dados salvos; mantenha os rótulos e traduções dessas ações sincronizados com o script em `miniapp-base/js/organisms/miniapp-cadastro.js`.
