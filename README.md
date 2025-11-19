# MiniApp 5Horas – núcleo reduzido (base React)

O repositório foi higienizado para manter apenas o que é necessário para os MiniApps em criação, o header legado e o footer principal. O shell agora é uma PWA estática servida por bundles React, preservando a entrega via arquivos estáticos e exibindo quatro ícones fixos no rodapé (Catálogo, Favoritos, Recentes e Configurações). Como parte da conclusão da implantação, os miniapps legados que não impactam o fluxo atual foram removidos do bundle para manter somente o que o sistema utiliza.

## Itens preservados
- **MiniApps base controlados pelo footer**: `catalog`, `favorites`, `recents` e `settings`, todos acionados diretamente pelos ícones fixos do rodapé. Catálogo, Favoritos e Recentes agora compartilham o mesmo template React, com cards compactos, modal de detalhes e abertura em tela cheia pelo ícone no canto superior direito.
- **Footer oficial** (`docs/components/app-shared-footer.js`), agora publicado como componente React funcional fixo no shell.
- **Header compartilhado** (`docs/components/app-shared-header.js`) exportado como componente React modular para uso nos MiniApps.
- **Componentes base** (`docs/components/app-shared-ui.js`) com AppCard/AppButton/AppSection desenhados sobre Material UI.
- **Contexto de modais** (`docs/components/app-modal-context.js`) que padroniza Dialog/Drawer/Snackbar para todos os MiniApps.
- **Shell do catálogo** (`index.html`), agora montado por um app React que controla os stages via `app-shared-footer` e utiliza Material UI para distribuir os cards responsivos enquanto `docs/miniapp-global.css` cuida apenas de tokens e layout.

## Estrutura atual
```
.
├── assets/                # Ícones e imagens usados pelo shell
├── docs/
│   ├── components/        # Header/footer + AppCard/AppModal compartilhados
│   ├── miniapp-card.css   # Estilos dos cartões do catálogo
│   ├── miniapp-card.js    # Renderização e listeners dos cartões
│   ├── miniapp-data.js    # Fonte de dados do catálogo com os MiniApps publicados
│   └── miniapp-global.css # Tokens + layout base do shell
├── js/
│   ├── googleSync.js      # Integração opcional com Google e fila offline
│   ├── indexeddb-store.js # Acesso ao IndexedDB
│   └── miniapp-data-loader.js # Loader com fallback remoto para miniapp-data.js (importável por React)
├── miniapps/              # MiniApps em desenvolvimento (apenas os quatro do rodapé + painéis complementares ativos)
│   ├── catalog/app.js     # Template compartilhado para Catálogo/Favoritos/Recentes
├── pwa/                   # Manifesto do PWA
├── service-worker.js      # Service worker usado pelo shell
└── index.html             # Shell principal sem header
```

## Base técnica em React
- **React/ReactDOM como padrão**: novos componentes e miniapps devem ser escritos em React, preferencialmente com componentes funcionais. O bundle gerado deve continuar produzindo saída estática para publicação simples.
- **Compatibilidade com utilitários existentes**: `googleSync.js`, `indexeddb-store.js` e `miniapp-data-loader.js` podem ser consumidos pelos componentes React, mantendo caminhos e APIs atuais.
- **Montagem do shell**: `index.html` injeta React/ReactDOM via CDN, renderiza o shell em `#root` e monta os componentes `AppSharedHeader` e `AppSharedFooter` dentro do React. O footer permanece como controlador de navegação e expõe o estado (`expanded`/`collapsed`) via props e callbacks.

## Layout responsivo com Material UI
- **Container/Box/ Grid oficiais**: o Stage do shell (`index.html`) foi reescrito com `MaterialUI.Container`, `Box` e `Grid` para garantir breakpoints consistentes (xs, sm, md, lg, xl) sem media queries manuais.
- **Componentes reutilizáveis**: `docs/components/app-shared-ui.js` expõe `AppCard`, `AppButton` e `AppSection` com os tokens 5Horas; todos os novos cards de MiniApps devem utilizá-los.
- **Sistema de modais**: `docs/components/app-modal-context.js` fornece `AppModalProvider`/`useAppModal` para abrir `Dialog`, `Drawer` e `Snackbar` padronizados (com fechamento por ESC/click externo).
- **CSS global enxuto**: `docs/miniapp-global.css` mantém apenas tokens, reset e layout do Stage/Footer. A responsividade passa a ser responsabilidade do Material UI.

## Comunicação entre shell e MiniApps
- O shell React escuta mensagens `postMessage` do tipo `catalog:height` vindas dos miniapps carregados em iframe. Quando o evento chega de uma origem confiável e corresponde ao miniapp ativo, o iframe tem a altura atualizada para coincidir com o conteúdo interno, eliminando a rolagem dupla.
- O MiniApp Catálogo utiliza `ResizeObserver` para detectar mudanças de layout, calcula o `scrollHeight` da `miniapp-stage` e envia o valor ao shell junto com o `sourceId`. O fallback mantém o mínimo de 70–75 vh para miniapps que ainda não publicam a mensagem.

## Fonte de dados do catálogo
O arquivo `docs/miniapp-data.js` agora registra oficialmente os quatro MiniApps expostos pelo footer. Cada objeto inclui `id`, `title`, `description`, `category`, `contract`, `owner`, `status` e o `url` que leva diretamente ao painel correspondente. O MiniApp Catálogo consome essa lista via `loadMiniAppData`, permitindo testar o comportamento dos cards, o preenchimento do quadro e a sincronização de favoritos com o IndexedDB. Qualquer novo MiniApp precisa ser adicionado a essa fonte antes de ser divulgado para os usuários.

## Template compartilhado para catálogo, favoritos e recentes
- O arquivo `miniapps/catalog/app.js` concentra o grid React e é reutilizado pelos MiniApps `catalog`, `favorites` e `recents`, aplicando filtros automáticos para mostrar todos os apps, apenas os favoritos persistidos no IndexedDB ou o histórico local de aberturas.
- O botão "Abrir MiniApp" foi substituído por um ícone de expansão no canto superior direito do card, que abre o painel em tela cheia e alterna para o ícone de fechamento quando ativo.
- As informações de contrato foram movidas do card para o modal de detalhes, que agora inclui um botão de favorito para alimentar o MiniApp Favoritos.
- O link de detalhes divide a mesma linha do indicador de status, deixando a face inicial do card mais compacta.

## Status dos MiniApps
Cada pasta em `miniapps/` expõe um `index.html` dedicado. Catálogo, Favoritos e Recentes já usam o template React compartilhado descrito acima; Configurações segue com o painel em React + MUI; os demais permanecem placeholders simples enquanto os fluxos não são finalizados. Todos são obrigatórios para o shell funcionar e deverão ser preenchidos com componentes React conforme evoluírem, respeitando o isolamento dentro de suas respectivas pastas. Além dos quatro miniapps acionados pelo rodapé, existe o painel complementar `miniapps/payments/`, dedicado a consolidar as formas de pagamento (iniciado com Mercado Pago no Brasil) dentro da mesma base estática.

- **MiniApp Catálogo**: deixou a tabela estática e agora renderiza um grid de `AppCard` com ícone de expansão para abrir o MiniApp em tela cheia, status e link de detalhes na mesma linha e modal enriquecido com contrato + botão de favorito. O grid consome `docs/miniapp-data.js` via `loadMiniAppData`, mostra placeholders durante o carregamento e reaproveita o empty state "Catálogo em criação".
- **MiniApps Favoritos e Recentes**: passaram a usar o mesmo grid do catálogo. Favoritos filtra os itens persistidos no IndexedDB (via botão do modal), enquanto Recentes exibe o histórico local gerado ao abrir um MiniApp pelo ícone de expansão.
- **MiniApp Configurações**: remodelado em React + MUI com quatro cards (Perfil, Pagamentos, MiniSystems e Memória). Os fluxos de usuário/memória usam `Dialog` do contexto global, persistem tema/idioma, aplicam o tema diretamente nos AppCards e traduzem os textos principais de acordo com o idioma escolhido, além de espelharem as leituras do IndexedDB em tempo real.

## Desenvolvimento local
Nenhuma dependência Node é necessária além do precache do service worker para servir os arquivos resultantes do build. Use qualquer servidor HTTP simples (ex.: `python -m http.server`) para navegar pelo shell e verificar os placeholders gerados pelo React.

## Garantia de captura de tela
- O shell e os MiniApps não incluem flags nativos nem listeners que escondam ou apaguem o conteúdo durante capturas de tela; o layout HTML/CSS permanece sempre renderizado.
- O script `npm test` executa `tests/ensure-screen-capture.js`, que verifica automaticamente se algum arquivo introduziu referências conhecidas por bloquear screenshots em Android (`FLAG_SECURE`, `setFlags`/`setSecure`) ou iOS (`isScreenCaptureDisabled`). Caso um bloqueio seja encontrado, o comando falhará orientando a limpeza.
- Para validar em qualquer dispositivo, rode `npm test` antes da publicação e utilize a própria navegação do shell em um navegador móvel ou WebView. Se o teste passar e o container nativo não definir flags restritivos, o print screen permanecerá liberado.
