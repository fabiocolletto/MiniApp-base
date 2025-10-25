# Pasta `sys/tools`

## Visão geral
`sys/tools/` reúne ferramentas reutilizáveis do shell, focadas em integrações com serviços externos ou rotinas utilitárias que precisam ser acessadas por múltiplas telas.

## Conteúdo atual
- `cep.ts`: função `fetchCep` que consulta a API ViaCEP, trata respostas e entrega o endereço normalizado para preenchimento automático de formulários.
- `cep.log.md`: log dedicado acompanhando alterações e consumo da ferramenta de CEP.

## O que pode conter
- Novas ferramentas isoladas por domínio (ex.: `auth.ts`, `analytics.ts`).
- Documentação e logs complementares por ferramenta (`<tool>.log.md`).
- Testes específicos das ferramentas quando necessário.

## Checklist para novas ferramentas
1. Crie o módulo TypeScript em `sys/tools/<tool>.ts` descrevendo a função principal e exportando apenas o necessário.
2. Cadastre o arquivo na seção "Conteúdo atual" acima, mantendo a descrição curta e objetiva.
3. Abra um log em `sys/tools/<tool>.log.md` com histórico cronológico, indicando data/hora BRT e decisões de uso.
4. Atualize o `Log.md` na versão aberta registrando a nova ferramenta e indicando onde está documentada.
5. Se a ferramenta exigir configuração adicional, detalhe o passo a passo na seção seguinte sem alterar regras já existentes.

## Como preservar esta página
- Mantenha os títulos das seções exatamente como definidos para que o agente reconheça o fluxo.
- Atualize listas adicionando novos itens ao final, preservando exemplos anteriores.
- Sempre que remover uma ferramenta, mova o log para `Arquivados/` e descreva o motivo tanto aqui quanto no `Log.md`.
- Ao retirar uma função do sistema, remova também o item correspondente da lista em "Conteúdo atual" para manter o inventário atualizado.
- Evite duplicar instruções; referencie os logs específicos quando houver detalhes operacionais.
