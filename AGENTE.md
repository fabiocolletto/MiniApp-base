# AGENTE – Governança mínima do MiniApp 5Horas (base React)

> Documento de controle lido pelo Codex. As instruções abaixo são obrigatórias para preservar os 5 MiniApps em criação, os componentes compartilhados (header e footer) e a nova base React do shell.

## 1. Propósito
Manter o repositório enxuto e estável enquanto o shell passa a ser servido a partir de bundles React. Tudo que não sirva diretamente aos MiniApps em criação, ao shell da PWA ou aos componentes globais deve permanecer fora do código-fonte.

## 2. Estrutura permitida
- `index.html` – Shell principal sem header, controlado pelo footer e servido por um bundle React.
- `docs/components/app-shared-footer.js` – Footer oficial que controla o stage (pode ser exposto como componente React).
- `docs/components/app-shared-header.js` – Header legado para MiniApps que precisarem de barra superior interna.
- `docs/miniapp-card.js`, `docs/miniapp-card.css`, `docs/miniapp-global.css` – Renderização e estilos do catálogo (ponto de montagem para componentes React que listam os MiniApps).
- `docs/miniapp-data.js` – Fonte de dados (pode ficar vazia enquanto os MiniApps estão em criação).
- `js/googleSync.js`, `js/indexeddb-store.js`, `js/miniapp-data-loader.js` – Utilidades essenciais do shell, importáveis por componentes React sem alterar os caminhos atuais.
- `miniapps/*/index.html` – 5 MiniApps em desenvolvimento apenas com aviso de construção.
- `assets/`, `pwa/`, `service-worker.js` – Arquivos estáticos necessários para a PWA.

## 3. O Codex NÃO deve
- Adicionar novas dependências, ferramentas ou frameworks além do necessário para React/ReactDOM.
- Recriar pastas removidas (templates, QA, validação, design system) sem solicitação explícita.
- Alterar a estrutura do shell (continuar sem header global e com controle pelo footer).
- Remover ou substituir os 5 MiniApps em criação, o footer ou o header legado.

## 4. O Codex DEVE
- Manter o projeto estritamente estático e mobile-first, servindo a saída compilada do React.
- Preservar caminhos e imports existentes nos arquivos listados em **Estrutura permitida**.
- Garantir que novos componentes sejam escritos em React (preferencialmente funcionais) e compatíveis com a saída estática.
- Atualizar `README.md` e `CHANGELOG.md` sempre que a estrutura mudar ou novos MiniApps forem adicionados.
- Validar que o carregamento do `miniapp-data.js` continua funcional mesmo vazio.

## 5. Testes
Não há suítes automatizadas ativas após a limpeza. O comando `npm test` apenas informa a ausência de testes.

## 6. Segurança e dados
- Não incluir credenciais, tokens ou chaves no front-end.
- Não registrar informações sensíveis em logs ou persistência local.

## 7. Encerramento
Estas diretrizes são a autoridade para manter o repositório limpo e focado nos MiniApps em criação. Qualquer alteração estrutural fora do escopo acima requer instrução explícita.
