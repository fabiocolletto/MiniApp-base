# Configuração pública do MiniApp

Arquivos desta pasta expõem variáveis globais não sensíveis que o shell e os miniapps carregam diretamente no navegador. Utilize-os para publicar identificadores de clientes OAuth, chaves públicas ou _flags_ que precisam estar acessíveis antes da inicialização dos módulos.

## Convenções
- Declare apenas objetos no `window` (ex.: `window.__APP_CONFIG__`). Evite variáveis globais soltas que possam colidir com outros scripts.
- Não adicione segredos ou tokens privilegiados: tudo aqui é entregue ao cliente final.
- Sempre documente novas chaves e mantenha valores de exemplo claros para facilitar a configuração manual após o deploy.

## Chaves disponíveis
- `OAUTH_CLIENT_ID`: Client ID OAuth 2.0 utilizado pelo shell para fluxos de autenticação Google.
- `DISABLE_AUTH_GUARDS`: Quando definido como `true`, desativa o fluxo de login e libera todos os MiniApps para testes controlados.
- `INITIAL_CATALOG_SHEET_ID`: Identificador (ou marcador estático) aplicado automaticamente pelo shell para pular a tela de configuração do catálogo enquanto o catálogo permanecer embutido.
