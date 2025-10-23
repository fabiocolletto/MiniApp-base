# Diretrizes do Projeto MiniApp

## Instruções Gerais
- Leia este arquivo antes de executar qualquer solicitação.
- Antes de qualquer planejamento ou ação, consulte o `README.md` para instruções e o `Log.md` para contexto atualizado.
- Siga as demandas do usuário de forma literal e priorize respostas objetivas.
- Cada alteração no repositório deve ser registrada em `Log.md`. Enquanto estivermos trabalhando na mesma edição, complemente a
  entrada já existente (atualizando data e hora) em vez de criar um novo número de versão. Quando uma nova edição começar, siga
  a sequência numérica de versões.
- Mantenha o README atualizado apenas com informações aprovadas pelo usuário.
- Priorize o reaproveitamento de estilos globais existentes. Caso um novo padrão visual seja indispensável, implemente-o como
  utilitário compartilhado para que futuros painéis, widgets ou miniapps possam reutilizá-lo.

## Requisitos do Aplicativo
- O aplicativo deve ser responsivo, entregando uma experiência consistente em diferentes tamanhos de tela.
- O rodapé deve exibir a versão atualizada do aplicativo sempre que uma nova versão for lançada.

## Registro de Alterações
- Sempre que uma modificação for realizada, adicione uma nova entrada ao `Log.md`.
- As versões devem ser incrementadas cronologicamente (por exemplo: `v0.1.0`, `v0.1.1`, `v0.2.0`, ...).
- Descreva resumidamente o que mudou em cada versão.
- Registre também a data e o horário no fuso de Brasília (BRT) para cada versão documentada no `Log.md`, atualizando o horário
  sempre que complementar uma entrada existente.
- Ao identificar documentação obsoleta, mova-a para a pasta `Arquivados/` e descreva o motivo no `Log.md`. Caso ainda não exista
  um documento descrevendo o processo, crie-o.
