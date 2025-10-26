# Log do MiniApp Criador de Provas

## v0.1.254 - 2025-10-26
- Adiciona filtro por status no painel, permitindo visualizar apenas provas em rascunho, revisão, agendadas ou publicadas.
- Mantém "Todos os status" como seleção padrão e aplica a escolha ao formulário para acelerar a criação/edição.
- Atualiza metadados públicos do miniapp para refletir a versão 0.1.254.

## v0.1.251 - 2025-10-26
- Consolida o painel do Criador de Provas com cabeçalho único concentrando filtros e ações de impressão,
  deixando a pré-visualização e a lista de provas lado a lado no corpo principal.
- Integra o modelo de impressão padronizado fornecido e amplia o banco de questões para ofertar pelo menos
  cinco modelos prontos por disciplina com diferentes dificuldades.
- Documenta a unificação da release em 0.1.251, atualiza catálogo e metadados e registra a validação visual
  das provas com o novo conjunto de modelos.

## v0.1.3 - 2025-10-26
- Move os estilos dedicados do painel para a própria view, evitando interferência em outros miniapps
  do shell.
- Mantém apenas utilitários compartilhados na folha global, preservando o layout simplificado do
  preview e da lista de provas.
- Refaz a validação visual do dashboard garantindo que a divisão entre pré-visualização e lista
  permaneça coerente após a reorganização dos estilos.

## v0.1.2 - 2025-10-26
- Simplifica o painel com visualização da prova à esquerda e lista de provas à direita, focando na
  revisão antes da impressão.
- Remove indicadores, timeline e banco de questões da tela principal, destacando botões de impressão
  para alunos e professores.
- Atualiza estilos e documentação para refletir o fluxo dedicado à preparação das avaliações.

## v0.1.1 - 2025-10-26
- Corrige o handler de busca do painel para evitar múltiplas execuções após reabrir o miniapp.
- Valida visualmente o dashboard integrado ao shell principal, assegurando consistência com o Gestor de Tarefas.

## v0.1.0 - 2025-10-26
- Publica o painel inicial de provas reutilizando o layout do Gestor de Tarefas com indicadores,
  cronograma e formulário de criação.
- Inclui banco de questões com filtros por disciplina, competência BNCC e nível de dificuldade.
- Documenta execução e próximos passos dentro da estrutura `MiniApps/`.
