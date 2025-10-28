# MiniApp Criador de Provas

O MiniApp Criador de Provas ajuda equipes pedagógicas a planejar avaliações alinhadas à BNCC
reaproveitando componentes do Gestor de Tarefas. O painel atual prioriza a revisão das avaliações
com um cabeçalho único que reúne filtros obrigatórios (disciplina, ano letivo, dificuldade e tempo
máximo) e as principais ações de impressão/cadastro. Após definir o contexto, o professor revisa a
prova selecionada no cartão de pré-visualização enquanto a lista de provas em andamento ou agendadas
permanece à direita. A base padrão inclui ao menos cinco modelos de prova por disciplina, com
variações de tipo e dificuldade para simular diferentes cenários didáticos.

## Recursos principais

- **Cabeçalho contextual** com filtros de disciplina, ano letivo, dificuldade e tempo limite,
  além dos botões de impressão e cadastro para ações rápidas sem sair do topo do painel.
- **Visualização da prova** mostrando objetivo pedagógico, orientações e resumo das questões
  associadas em um cartão dedicado, pronto para revisão após escolher a prova.
- **Modelo de impressão padronizado** com cabeçalho BNCC-ready e diferentes tipos de questões
  seguindo o template estático fornecido, disponível na prévia e nos botões de impressão.
- **Lista de provas em andamento/agendadas** com seleção rápida, status destacado e previsão
  de aplicação de cada avaliação cadastrada.
- **Catálogo inicial robusto** com cinco provas por disciplina cobrindo diferentes dificuldades e tipos,
  permitindo testar filtros e fluxos de impressão sem cadastrar novos dados.
- **Formulário simplificado** que reutiliza validações do Gestor de Tarefas para registrar novas
  provas com os campos essenciais (data, duração, objetivo e instruções).

## Estrutura

- `scripts/views/exams.js`: view principal carregada pelo shell, responsável pelos filtros, pela
  lista e pela pré-visualização com estilos injetados dinamicamente.
- `MiniApps/exam-planner/`: pasta dedicada com documentação, espaço para componentes específicos e
  históricos de evolução.

## Executando e testando

1. Instale as dependências do projeto raiz (quando aplicável):
   ```bash
   npm install
   ```
2. Rode os testes automatizados (inclui a suíte de dados dos miniapps):
   ```bash
   npm test
   ```

## Próximos passos sugeridos

- Persistir as provas criadas usando IndexedDB com API semelhante à do Gestor de Tarefas.
- Reintroduzir filtros e curadoria do banco de questões diretamente na visualização para apoiar a
  seleção de exercícios.
- Criar relatórios exportáveis com as versões de impressão organizadas por turma.

## Licença

Este miniapp segue a mesma licença do repositório principal.
