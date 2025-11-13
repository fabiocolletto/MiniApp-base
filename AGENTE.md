# Guia do Agente

- Leia este arquivo, bem como `README.md`, `CHANGELOG.md` e a pasta `docs/protocolos/`, antes de qualquer alteração para entender o estado atual do pacote base e verificar se já existe um protocolo aplicável.
- O shell em `index.html` deve permanecer como ponto único de navegação. Sempre valide se o catálogo embutido (`js/catalog-app.js`) emite eventos compatíveis com `window.parent.loadMiniApp` e se os miniapps confirmam o cabeçalho via `{ action: 'miniapp-header', title, subtitle }`.
- Scripts compartilhados residem em `js/` ou dentro dos diretórios dos miniapps. Evite duplicar lógica; prefira funções já expostas pelo shell ou pelo MiniApp.
- O CSS está centralizado em `miniapp-base/style/styles.css`. Preserve o escopo `.ma`, as camadas `@layer` e utilize tokens existentes antes de adicionar novos.
- Sempre que criar ou atualizar pastas, mantenha um `README.md` descrevendo propósito, pontos de atenção e instruções de manutenção.
- Ao finalizar uma tarefa, atualize este guia caso novas regras sejam necessárias e sincronize o `CHANGELOG.md` com as alterações relevantes.
- Assegure que o Service Worker (`sw.js`) continue atendendo ao shell e aos miniapps essenciais. Qualquer asset novo necessário offline deve ser adicionado à lista de pré-cache quando fizer sentido.
- A pasta `miniapp-base/icons/` permanece apenas com documentação. Não suba placeholders binários; os ícones reais (`icon-192.png` e `icon-512.png`) serão adicionados manualmente fora do fluxo do agente.

## Manutenção do repositório
- Centralize todos os artefatos de teste sob `tests/`, utilizando subpastas específicas (`tests/e2e`, `tests/helpers`, etc.) conforme o tipo. Atualize `playwright.config.js` sempre que mover as suítes para garantir que o runner siga apontando para o diretório correto.
- Cada nova pasta criada deve incluir um `README.md` com propósito, instruções de execução e dependências necessárias. Se uma pasta for reestruturada, atualize o README correspondente com o histórico e as novas convenções.
- Revise `CHANGELOG.md` ao final de cada entrega para registrar ajustes relevantes em arquitetura, testes e fluxo de desenvolvimento.
- Prefira reaproveitar utilitários existentes antes de adicionar dependências ou scripts duplicados; caso uma nova ferramenta seja imprescindível, documente o racional e o passo a passo de uso.

## AUTENTICAÇÃO E GUARDAS
- O shell não carrega mais módulos de autenticação. Sempre mantenha os MiniApps acessíveis sem depender de sessão.
- Caso algum MiniApp futuro exija controle de acesso, documente o fluxo antes de introduzir novas dependências e garanta que o catálogo continue totalmente navegável quando os guardas estiverem desativados.
