# Guia de Implantação de MiniApps

Este documento centraliza os requisitos funcionais e visuais para publicar um novo miniapp dentro do shell (`index.html`). Antes de abrir um PR, valide cada item abaixo.

## 1. Metadados do catálogo
- Adicione um cartão em `miniapp-catalogo/index.html` apontando para o HTML principal do miniapp com `target="miniapp-panel"`.
- Informe os atributos `data-miniapp-name`, `data-miniapp-description`, `data-miniapp-icon-symbol` (nome do ícone da biblioteca Material Symbols) e `data-miniapp-icon-theme` (sufixo utilizado nas classes `.app-icon--theme-*`).
- Se o miniapp precisar de um tema de ícone inédito, crie a variação correspondente em `miniapp-base/style/styles.css` seguindo o padrão `app-icon--theme-novoTema`.

## 2. Mensagem para o shell
- Assim que o miniapp finalizar o carregamento, envie `window.parent.postMessage({ action: 'miniapp-header', title, subtitle, icon, iconTheme }, window.location.origin)`.
- Utilize o mesmo par `icon`/`iconTheme` cadastrado no catálogo para manter o cabeçalho e o ícone sincronizados.
- Em caso de fallback (ex.: erro de comunicação), mantenha os textos legíveis e utilize o tema `shell` como reserva.

> ℹ️ O retorno ao catálogo é resolvido pelo botão fixo do shell no rodapé; os miniapps não precisam renderizar um atalho próprio.

## 3. Checklist final
- Atualize `README.md`, `CHANGELOG.md` e este guia se novas regras surgirem.
- Garanta que os miniapps continuem a enviar traduções completas para `pt-BR`, `en-US` e `es-ES` quando aplicável.
- Revise o shell em `index.html` para confirmar que o ícone, título e subtítulo são atualizados corretamente ao alternar entre miniapps.
