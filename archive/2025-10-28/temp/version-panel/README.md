# Painel de Versões Temporárias

Este protótipo fica na pasta `temp/` e permite inspecionar rapidamente builds temporárias do MiniApp hospedadas em branches do GitHub. O painel carrega a lista de branches de um repositório público e, ao selecionar uma opção, renderiza o arquivo definido em `config.js` dentro de um iframe dedicado.

## Como usar

1. Edite o arquivo `config.js` com as credenciais do repositório que deseja monitorar.
   - `GITHUB_OWNER`: usuário ou organização que hospeda o repositório.
   - `GITHUB_REPO`: nome do repositório que contém a versão temporária do MiniApp.
   - `DEFAULT_BRANCH`: branch preferencial para carregar na abertura (por exemplo, `temp` ou `develop`).
   - `PREVIEW_PATH`: caminho para o arquivo HTML a ser exibido (por padrão `index.html`).
   - `MAX_BRANCHES`: quantidade máxima de branches recuperada na listagem inicial.
2. Hospede a pasta em um servidor estático (por exemplo, `npx serve` ou a extensão de live server da IDE) para testar localmente.
3. Abra `index.html` no navegador. O painel buscará os branches no GitHub, exibirá os detalhes do último commit e mostrará a renderização do arquivo definido em `PREVIEW_PATH`.
4. Caso o branch não contenha o arquivo indicado, uma mensagem descritiva será exibida no topo do painel.

## Observações

- Este projeto permanece isolado dentro de `temp/version-panel` até que o usuário autorize a integração ao aplicativo principal.
- O painel faz chamadas anônimas para a API pública do GitHub. Para repositórios privados, adicione um proxy com autenticação antes de integrar ao fluxo definitivo.
- O layout utiliza apenas CSS nativo e evita dependências externas para facilitar ajustes rápidos durante a fase temporária.
