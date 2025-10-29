# Diretrizes do Projeto MiniApp

## Instruções Gerais
- Leia este arquivo antes de executar qualquer solicitação.
- Antes de qualquer planejamento ou ação, consulte o `README.md` para instruções e o `Log.md` para contexto atualizado.
- Ao trabalhar em tarefas relacionadas a miniapps, consulte também o `MiniApps/readme.mb` antes de iniciar as ações.
- Para itens em `sys/` (incluindo `sys/tools/`), siga as orientações de uso e manutenção descritas nos READMEs e logs dedicados do diretório; utilize este `AGENTS.md` apenas como ponte para essas instruções, sem duplicá-las.
- Siga as demandas do usuário de forma literal e priorize respostas objetivas.
- Preserve integralmente o que já estiver publicado no painel, evitando apagar ou sobrescrever conteúdos consolidados salvo
  instrução expressa do usuário.
- Mantenha o README atualizado apenas com informações aprovadas pelo usuário.
- Priorize o reaproveitamento de estilos globais existentes. Caso um novo padrão visual seja indispensável, implemente-o como
  utilitário compartilhado para que futuros painéis, widgets ou miniapps possam reutilizá-lo.
- Sempre que o usuário declarar que um trabalho deve começar na pasta `temp/`, crie (ou reutilize) a subpasta correspondente
  dentro dela e mantenha todo o código, assets e documentação do trabalho em andamento restritos a esse local até que o
  usuário solicite explicitamente a integração ao aplicativo principal. Somente após essa autorização mova ou copie os
  artefatos para suas pastas definitivas.

## Requisitos do Aplicativo
- O aplicativo deve ser responsivo, entregando uma experiência consistente em diferentes tamanhos de tela.
- O rodapé deve exibir a versão atualizada do aplicativo sempre que uma nova versão for lançada.

## Registro de Alterações
- Registre toda modificação no `Log.md`, mantendo a sequência numérica de versões (por exemplo: `v0.1.0`, `v0.1.1`, `v0.2.0`, ...).
- Trate cada versão como imutável após a conclusão da edição em andamento: não altere, remova ou reorganize entradas de versões anteriores. Se algum registro histórico estiver incorreto, registre a correção na versão atual explicando o ajuste em vez de editar o passado.
- Durante a mesma edição (até o envio do pull request), complemente apenas a versão já aberta no `Log.md`, acrescentando itens sem apagar os existentes. Atualize data e horário dessa versão somente enquanto ela estiver em andamento; após o envio do PR, considere a versão congelada.
- Sempre que uma nova etapa for autorizada pelo usuário, abra a próxima versão sequencial seguindo o padrão definido e informe o horário vigente em Curitiba/BR (BRT, UTC-3) no momento da atualização.
- Informe resumidamente o que mudou e utilize sempre a data e o horário oficiais de Curitiba/BR (BRT, UTC-3) vigentes no momento da atualização do registro.
- Ao identificar documentação obsoleta, mova-a para a pasta `Arquivados/` e descreva o motivo no `Log.md`. Caso ainda não exista um documento descrevendo o processo, crie-o.

## Memória local: IndexedDB (padrão oficial)
- Origem do código: `shared/vendor/idb.min.js` (versão 7.x em ESM com cabeçalho de licença).
- Bancos padrão: `marco_core` (sistema Base) e bancos dedicados por MiniApp, como `pesquisa_studio`.
- Estrutura: os arquivos de API residem em `shared/storage/idb/` (`databases.js`, `marcocore.js`, `surveystudio.js`, `migrate.js`, `persistence.js`).
- Migração/onupgradeneeded: incremente versões com inteiros crescentes e utilize os helpers de `databases.js` para garantir stores/índices; mantenha migrações idempotentes.
- Persistência e cota: use `ensurePersistentStorage()` e `getStorageEstimate()` (expostos em `persistence.js`) para solicitar armazenamento persistente e reportar uso/quota.
- Restrições: nunca armazene segredos ou dados sensíveis (LGPD) no navegador. Limite-se a chaves públicas ou caches descartáveis.

## Como um MiniApp deve acessar armazenamento
- Importar a API ESM correspondente (ex.: `import { upsertSurvey } from '../../shared/storage/idb/surveystudio.js';`).
- Evitar o uso de `localStorage` ou outros storages legados. Toda persistência deve passar pela camada IndexedDB padronizada.
