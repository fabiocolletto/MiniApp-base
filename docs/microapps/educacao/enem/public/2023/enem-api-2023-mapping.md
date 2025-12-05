# ENEM 2023 — Importação yunger7/enem-api

## Campos do dataset (yunger7/enem-api/public/2023)
Cada `questions/<indice(-idioma)>/details.json` do repositório de origem já traz os campos abaixo, que mapeiam diretamente para o modelo descrito em `docs/microapps/educacao/enem/public/README.md`:

| Campo no dataset | Tipo | Mapeamento para o modelo do microapp |
| --- | --- | --- |
| `title` | string | `title` |
| `index` | number | `index` |
| `year` | number | `year` |
| `language` | string ou `null` | `language` (`null` = versão principal) |
| `discipline` | string | `discipline` |
| `context` | string ou `null` | `context` (texto do enunciado) |
| `files` | array de string | `files` (URLs usadas no enunciado) |
| `alternativesIntroduction` | string | `alternativesIntroduction` |
| `alternatives[].letter` | string | `alternatives[].letter` |
| `alternatives[].text` | string | `alternatives[].text` |
| `alternatives[].file` | string ou `null` | `alternatives[].file` |
| `alternatives[].isCorrect` | boolean | `alternatives[].isCorrect` |
| `correctAlternative` | string | `correctAlternative` |

## Arquivos gerados
- `enem-api-2023-raw.json`: dump consolidado com 183 questões (cada uma no formato acima) e metadados de origem.
- `enem-api-2023-status.csv`: planilha de status para cruzar índice/idioma/ disciplina com a existência da pasta correspondente em `docs/microapps/educacao/enem/public/2023/questions`.

## Observações rápidas
- O `details.json` local do curso 2023 lista 185 combinações de índice+idioma; o dataset remoto retorna 183 registros válidos. O CSV evidencia quais combinações têm pasta criada (`existente`) e quais seguem ausentes (`faltante`).
- Contagem atual de pastas em `questions/`: 185 diretórios (incluindo variações por idioma), usada como referência para o status "existente" no CSV.
