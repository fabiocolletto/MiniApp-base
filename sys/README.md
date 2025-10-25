# Pasta `sys`

## Propósito
A pasta `sys/` concentra utilidades de sistema compartilhadas entre diferentes áreas do MiniApp. Aqui ficam módulos de log, ferramentas de integração com serviços externos e demais helpers que não pertencem a um miniapp específico. Use este diretório para tudo que precise permanecer estável e disponível para todo o shell.

## Estrutura atual
- `tools/`: conjunto de ferramentas reutilizáveis, como integrações com APIs externas e o utilitário de log compartilhado.

## O que pode conter
- Wrappers utilitários que precisam ser acessados por múltiplas views ou miniapps.
- Adaptadores de serviços externos que devam ser reaproveitados pelo shell do sistema.
- Documentação complementar (ex.: READMEs e logs) descrevendo como operar e evoluir cada ferramenta.

## Como utilizar
1. Consulte o README do subdiretório relevante antes de consumir ou criar novos helpers.
2. Registre cada alteração funcional no `Log.md`, mantendo a versão aberta indicada no arquivo raiz.
3. Sempre que adicionar uma nova ferramenta, crie um log dedicado (em `sys/tools/<tool>.log.md`) documentando versões, uso previsto e impactos.
4. Prefira escrever os módulos em TypeScript e gerar os equivalentes em JavaScript apenas quando necessário para compatibilidade.

## Como preservar esta página
- Não remova seções existentes; complemente-as com novos itens quando necessário.
- Liste novas entradas na seção "Estrutura atual" e ajuste a seção "O que pode conter" apenas para ampliar exemplos aceitos.
- Ao registrar orientações específicas, descreva o passo a passo com linguagem direta voltada ao agente para evitar ambiguidade.
- Cite explicitamente os arquivos criados ou modificados sempre que orientar ações, permitindo que o histórico seja rastreável.
