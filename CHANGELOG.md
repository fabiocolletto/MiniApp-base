# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Adicionado
- Placeholders controlados pelo rodapé para cada ícone do RodaPack, exibindo o título do MiniApp correspondente.
- `miniapps/README.md` documentando a estrutura definitiva de MiniApps na revisão 3.0.
- Módulo `js/miniapp-data-loader.js` com fallback remoto (GitHub Raw) e cache local para carregar `miniapp-data.js` mesmo quando o arquivo não está disponível no ambiente atual.
- Web Component `<app-shared-header>` em `docs/components/` permanece disponível para MiniApps que precisarem de header interno (o shell 3.0 segue sem header).
- Biblioteca CSS [Open Props](https://open-props.style) incorporada ao shell e MiniApps para destravar tokens fluidos reutilizáveis nas larguras e espaçamentos.
- Estrutura de pastas para templates de MiniApps (`templates/`) e para o futuro Design System (`docs/design-system/`).
- READMEs iniciais orientando o uso dessas novas pastas.
- MiniApp **Gestão de Catálogo** agora integra diretamente com `js/googleSync.js`, salva o catálogo revisado no IndexedDB e dispara a sincronização automática via Apps Script/Google APIs, sem necessidade de exportar arquivos manualmente.
- Suporte ao campo opcional `updatedAt` no `miniapp-data.js` para rastrear revisões diretamente na interface administrativa.

### Alterado
- Shell principal agora opera sem header e mantém o rodapé em estado compacto por padrão, controlando o stage entre catálogo e placeholders hidratados diretamente do `miniapp-data.js`.
- `index.html` e o MiniApp **Gestão de Catálogo** agora consomem os dados via loader com fallback, evitando falhas quando os documentos do repositório não podem ser lidos localmente.
- Shell principal agora usa largura fluida, grade responsiva e otimizações de espaçamento que aproveitam telas maiores sem perder a base mobile-first.
- Shell principal passa a respeitar altura fixa de `100vh`, mantendo header e footer sempre visíveis e delegando a rolagem para o painel central com barra oculta.
- Grade do catálogo recalibrada para permitir que o shell ocupe 100% da viewport e encaixe mais cartões por linha conforme a largura aumenta, agora com cartões sempre fixos em **300px**.
- Painéis do MiniApp **Gestão de Conta do Usuário** abrem diretamente ao clique em cada linha interativa, mantendo acessibilidade via teclado.
- Catálogo configurado para listar apenas o MiniApp **Gestão de Catálogo**, mantendo o foco no fluxo de publicação principal.

### Documentação
- `AGENTE.md` e `README.md` descrevem o novo loader e o fallback remoto configurável para `miniapp-data.js`.
- `AGENTE.md` atualizado com a descrição da estrutura auxiliar e o playbook para processar templates de MiniApps.
- `README.md` mencionando a nova pasta de templates.
- `README.md` agora inclui instruções atualizadas do fluxo guiado com botão **Salvar no sistema** e sincronização automática.
- `docs/responsiveness-report.md` registra capturas e comportamento do grid em diferentes larguras, mantendo shell em 100vh com rolagem central.
- `AGENTE.md` e `README.md` documentam o playbook e os comandos oficiais de QA para gestão de conta e catálogo, com termos de aceitação e registro obrigatório da saída dos testes.
- `README.md` e `docs/qa/runs/2025-11-17.md` registram a política de arquivamento das execuções de QA e o histórico da rodada realizada em 2025-11-17.

## [0.1.0] - 2024-04-XX
### Adicionado
- Cadastro do MiniApp **Catálogo 5Horas** com identificador único (`catalogo-5horas`) e imagem placeholder dedicada.
- Salvaguardas no `index.html` para gerar identificadores válidos antes de usar a fila offline ou salvar preferências.
- Persistência de `id` nos cards (`docs/miniapp-card.js`) para manter consistência entre grid, modal e IndexedDB.
- Documentação inicial (`README.md`) com protocolo para inclusão, teste e governança de MiniApps.

### Alterado
- Normalização do arquivo `docs/miniapp-data.js` para formato multilinha e inclusão explícita de `id` para todos os MiniApps.
