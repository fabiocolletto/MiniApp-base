# Configuração pública do MiniApp

Arquivos desta pasta expõem variáveis globais não sensíveis que o shell e os miniapps carregam diretamente no navegador. Utilize-os para publicar identificadores de clientes OAuth, chaves públicas ou _flags_ que precisam estar acessíveis antes da inicialização dos módulos.

## Convenções
- Declare apenas objetos no `window` (ex.: `window.__APP_CONFIG__`). Evite variáveis globais soltas que possam colidir com outros scripts.
- Não adicione segredos ou tokens privilegiados: tudo aqui é entregue ao cliente final.
- Sempre documente novas chaves e mantenha valores de exemplo claros para facilitar a configuração manual após o deploy.

## Chaves disponíveis
O arquivo padrão (`app-config.js`) inicializa `window.__APP_CONFIG__` como um objeto vazio para manter compatibilidade com versões anteriores. Adicione novas chaves conforme necessário e documente-as nesta seção.
