# Guia de governança de dados do simulado ENEM

Este diretório reúne o acervo de simulados do ENEM utilizado pelos microapps de educação. Cada **curso** corresponde a um ano do exame (ex.: `2023/`, `2024/`) e segue um padrão de pastas e JSONs pensado para garantir rastreabilidade, consistência e fácil automação.

## Visão geral da estrutura

```
docs/microapps/educacao/enem/public/
  ├─ <ano-do-curso>/
  │  ├─ details.json          # Catálogo de questões e metadados do curso
  │  └─ questions/
  │     ├─ <indice>/          # Questão monolíngue
  │     │  └─ details.json
  │     └─ <indice>-<idioma>/ # Questão multilíngue (ex.: 1-espanhol)
  │        └─ details.json
  └─ course-template/
     ├─ details.json          # Modelo pronto para duplicar
     └─ questions/001/details.json
```

### `details.json` do curso (ex.: `2023/details.json`)

Campo | Tipo | Obrigatório | Descrição
---|---|---|---
`title` | string | sim | Nome exibido do curso/ano.
`year` | number | sim | Ano de aplicação (também usado como identificador do curso).
`disciplines` | array de objetos | sim | Lista controlada de áreas. Cada item precisa de `label` (nome exibido) e `value` (slug sem espaços, minúsculo e com hífen).
`languages` | array de objetos | opcional | Idiomas extras para versões alternativas da mesma questão (estrutura igual a `disciplines`). Deixe ausente ou vazio se não houver versões em outro idioma.
`questions` | array de objetos | sim | Catálogo compacto das questões. Cada item deve conter `title`, `index` (número inteiro único dentro do curso), `discipline` (um dos valores de `disciplines`) e `language` (nulo para versão padrão ou um dos valores de `languages`).

Regras de integridade:
- Os `index` listados aqui precisam existir como pastas dentro de `questions/` (seguindo as regras abaixo).
- Cada combinação `index` + `language` deve ser única; use `null` para a versão principal.
- Utilize o mesmo `title` em `questions` e no arquivo da questão para facilitar buscas.

### `questions/<indice>/details.json`

Cada pasta de questão guarda um JSON completo, pensado para consumo direto pelo microapp. Estrutura recomendada:

Campo | Tipo | Obrigatório | Descrição
---|---|---|---
`title` | string | sim | Título da questão (use o mesmo padrão do catálogo).
`index` | number | sim | Índice inteiro conforme definido em `details.json` do curso.
`year` | number | sim | Ano do curso.
`language` | string ou null | sim | `null` para versão padrão ou um dos códigos definidos em `languages`.
`discipline` | string | sim | Valor definido em `disciplines`.
`context` | string | sim | Enunciado completo; use `\n\n` para parágrafos.
`files` | array | sim | URLs ou caminhos (strings) de recursos usados no enunciado; deixe `[]` se não houver.
`correctAlternative` | string | sim | Letra (A-E) da alternativa correta.
`alternativesIntroduction` | string | sim | Texto introdutório antes das alternativas.
`alternatives` | array de objetos | sim | Cada alternativa possui `letter`, `text`, `file` (URL ou `null`) e `isCorrect` (boolean).

Boas práticas:
- Utilize apenas caracteres UTF-8 e mantenha quebras de linha explícitas (`\n`).
- Links externos devem ser estáveis; prefira CDN controlada pelo produto quando possível.
- Evite remover campos: se algo não existir use `null`, `[]` ou string vazia conforme o tipo.

## Como adicionar um novo curso (ano do ENEM)

1. **Duplicar o modelo**: copie `course-template/` para o novo ano, por exemplo `cp -R course-template 2024`.
2. **Preencher `details.json`**:
   - Atualize `title` e `year`.
   - Revise `disciplines` e `languages` conforme o exame daquele ano.
   - Cadastre as questões no array `questions`, garantindo unicidade de `index` e combinação `index`+`language`.
3. **Criar pastas de questões**:
   - Para cada entrada em `questions`, crie a pasta `questions/<index>` ou `questions/<index>-<idioma>` conforme o campo `language`.
   - Preencha `details.json` de cada questão seguindo o esquema acima.
4. **Validar consistência**:
   - Confirme que todos os `index` listados em `details.json` possuem a respectiva pasta e arquivo.
   - Verifique se `discipline` e `language` utilizam apenas valores permitidos.
   - Garantir que apenas uma alternativa possua `isCorrect: true`.
5. **Revisão de qualidade de dados**:
   - Padronize títulos e índices para facilitar buscas.
   - Centralize anexos em local único e referencie via URL.
   - Adote controle de versão (git) para rastrear alterações em cada curso.

## Regras e limites para o simulado

- **Tamanho de arquivo**: mantenha JSONs pequenos, dividindo anexos pesados em URLs externas; evite armazenar binários aqui.
- **Nomenclatura**: use apenas números para `index` e hífen para idiomas (`1-ingles`, `1-espanhol`).
- **Duplicações**: não reutilize o mesmo `index` para conteúdos diferentes dentro de um ano; crie novo índice se necessário.
- **Disciplines e idiomas controlados**: qualquer novo valor deve ser previamente documentado no `details.json` do curso.
- **Compatibilidade**: preserva os campos existentes para que o microapp leia qualquer pasta de curso sem ajustes de código.

## Teste rápido usando o ENEM 2023

O curso `2023/` segue exatamente o padrão descrito aqui. Cada questão localizada em `2023/questions/<indice>/details.json` é catalogada no `questions` do `2023/details.json`, demonstrando como a aplicação pode ler vários cursos apenas percorrendo as pastas.

---
Este guia segue princípios de governança de dados: catálogo centralizado (`details.json`), nomenclatura controlada, validação de integridade e reutilização via modelo (`course-template/`).
