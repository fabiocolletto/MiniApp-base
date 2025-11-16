# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]
### Adicionado
- Biblioteca CSS [Open Props](https://open-props.style) incorporada ao shell e MiniApps para destravar tokens fluidos reutilizáveis nas larguras e espaçamentos.
- Estrutura de pastas para templates de MiniApps (`templates/`) e para o futuro Design System (`docs/design-system/`).
- READMEs iniciais orientando o uso dessas novas pastas.
- MiniApp **Gestão de Catálogo** agora integra diretamente com `js/googleSync.js`, salva o catálogo revisado no IndexedDB e dispara a sincronização automática via Apps Script/Google APIs, sem necessidade de exportar arquivos manualmente.
- Suporte ao campo opcional `updatedAt` no `miniapp-data.js` para rastrear revisões diretamente na interface administrativa.

### Alterado
- Shell principal agora usa largura fluida, grade responsiva e otimizações de espaçamento que aproveitam telas maiores sem perder a base mobile-first.
- Grade do catálogo recalibrada para permitir que o shell ocupe 100% da viewport e encaixe mais cartões por linha conforme a largura aumenta, mantendo cartões em tamanho padrão.
- Painéis do MiniApp **Gestão de Conta do Usuário** abrem diretamente ao clique em cada linha interativa, mantendo acessibilidade via teclado.
- Catálogo configurado para listar apenas o MiniApp **Gestão de Catálogo**, mantendo o foco no fluxo de publicação principal.

### Documentação
- `AGENTE.md` atualizado com a descrição da estrutura auxiliar e o playbook para processar templates de MiniApps.
- `README.md` mencionando a nova pasta de templates.
- `README.md` agora inclui instruções atualizadas do fluxo guiado com botão **Salvar no sistema** e sincronização automática.

## [0.1.0] - 2024-04-XX
### Adicionado
- Cadastro do MiniApp **Catálogo 5Horas** com identificador único (`catalogo-5horas`) e imagem placeholder dedicada.
- Salvaguardas no `index.html` para gerar identificadores válidos antes de usar a fila offline ou salvar preferências.
- Persistência de `id` nos cards (`docs/miniapp-card.js`) para manter consistência entre grid, modal e IndexedDB.
- Documentação inicial (`README.md`) com protocolo para inclusão, teste e governança de MiniApps.

### Alterado
- Normalização do arquivo `docs/miniapp-data.js` para formato multilinha e inclusão explícita de `id` para todos os MiniApps.
