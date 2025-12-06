# Catálogo de cursos do App Quiz

O arquivo `catalog.json` centraliza o catálogo de cursos carregados pelo App Quiz e é a referência para identificar quais edições e disciplinas estão disponíveis. Ele deve refletir fielmente os diretórios e dados presentes em `products/educacao/app-quiz/courses`.

## Estrutura do `catalog.json`
- `baseDir`: raiz relativa onde os cursos ficam armazenados (por padrão, `courses`).
- `courses`: lista de objetos de curso com:
  - `id`: identificador curto que corresponde ao nome da pasta do curso.
  - `label`: nome apresentado na interface.
  - `description`: descrição breve do curso/exame.
  - `years`: array com as edições disponíveis no catálogo.
  - `disciplines`: lista de disciplinas, cada uma com `id` (slug) e `label` (nome exibido).
  - `questionBanks`: objeto que mapeia cada ano (`"2023"`, `"2022"` etc.) para o caminho do arquivo de banco de questões correspondente. Use caminhos relativos à raiz do repositório para o aplicativo conseguir carregar o JSON diretamente.

## Manutenção e novos cursos
Sempre que implantarmos, mantivermos ou editarmos cursos, devemos garantir que `catalog.json` seja atualizado para refletir o estado real dos diretórios e dados:
1. **Novos cursos ou edições**: incluir o curso/ano recém-adicionado no `courses`, mantendo o `id` igual ao nome da pasta e acrescentando o ano em `years`.
2. **Disciplinas**: ao adicionar ou renomear disciplinas, ajustar as entradas de `disciplines` para corresponder aos arquivos disponíveis.
3. **Bancos de questões**: apontar o caminho do arquivo `questions.json` (ou equivalente) para cada ano em `questionBanks`, garantindo que o caminho exista no repositório. Ao remover um ano, remova também a chave correspondente.
4. **Validação**: confirmar se a combinação de `baseDir`, `id` e `years` aponta para pastas existentes, se os caminhos de `questionBanks` estão corretos e se o aplicativo carrega o catálogo sem erros.

Manter o catálogo sincronizado evita lacunas entre os dados armazenados e o que é exposto no aplicativo, reduzindo falhas de carregamento durante publicações ou ajustes de conteúdo.

## Estado atual de idiomas
- **Catálogo monolíngue**: o `catalog.json` não possui campo de idioma e pressupõe que todos os cursos e disciplinas estejam em um único idioma (português). Os diretórios também não têm convenção para separar conteúdos por idioma.
- **Mesmo curso em idiomas diferentes**: para suportar edições multilíngues do mesmo curso, será necessário definir uma convenção antes de criar novos diretórios ou entradas no catálogo. Exemplos possíveis: adicionar um campo `locale` por curso/ano ou criar subpastas por idioma (por exemplo, `enem/2023/pt-BR` e `enem/2023/en-US`).
- **Próximos passos**: enquanto essa convenção não for definida, mantenha o catálogo e as pastas no formato atual (um idioma). Caso um novo idioma seja solicitado, alinhe primeiro o padrão de diretório e a chave de idioma a ser adicionada ao `catalog.json` para garantir consistência entre os dados e o carregamento no aplicativo.

## Remoção de cursos ou edições
Para exclusão de conteúdo, execute este checklist para garantir que o catálogo continue confiável:
1. **Remover pastas correspondentes**: excluir o diretório do curso/ano dentro de `products/educacao/app-quiz/courses`.
2. **Atualizar o `catalog.json`**: eliminar o curso ou ano removido da lista `courses`, mantendo `id` e `years` coerentes com as pastas que permanecem.
3. **Conferir disciplinas remanescentes**: validar se as disciplinas listadas ainda existem no curso; se o curso for apagado por completo, remova suas disciplinas do catálogo.
4. **Validar carregamento**: abrir o aplicativo com o novo catálogo e verificar se nenhuma referência obsoleta é carregada.
