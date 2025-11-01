# Ripple – Pacote de Documentos v1 (dados + schemas + exemplos)

> Conjunto mínimo de arquivos para publicar no GitHub (Pages) e habilitar o MiniApp Educação (Ripple) a carregar banco de perguntas, filtrar, montar prova e exportar PDF.

---

## 1) Estrutura de pastas (proposta)
```
/data/
  manifest.json
  tokens.json
  topicos.historia.json            
  historia.EF8.json                

/schema/
  question-bank.schema.json
  tokens.schema.json
  topics.schema.json
  exam.schema.json

/assets/print/
  prova.css

/docs/
  README_data.md
```
> Observação: multiplique arquivos `disciplina.SERIE.json` conforme for publicando (ex.: `matematica.EF5.json`, `portugues.EM1.json` etc.).

---

## 2) /data/manifest.json (exemplo)
```json
{
  "schemaVersion": 1,
  "contentVersion": "2025-11-01",
  "idioma": "pt-BR",
  "disciplinas": ["historia"],
  "rotas": {
    "historia.EF8": "/data/historia.EF8.json"
  }
}
```

---

## 3) /data/tokens.json (exemplo mínimo)
```json
{
  "schemaVersion": 1,
  "tokens": [
    {
      "id_token": "hist_colecaoX_ef8_2024",
      "slug": "hist_colecaoX_ef8_2024",
      "rotulo": "Coleção X História EF8 2024",
      "categoria": "livro_didatico",
      "editora": "-",
      "etapa_ano": "EF8",
      "perfil_estilo_json": { "registro": "expositivo", "linguagem": "guiada" },
      "status_token": "ativo"
    },
    {
      "id_token": "met_investigativa",
      "slug": "met_investigativa",
      "rotulo": "Metodologia Investigativa",
      "categoria": "metodologia",
      "status_token": "ativo"
    }
  ]
}
```

---

## 4) /data/topicos.historia.json (catálogo de tópicos)
```json
{
  "schemaVersion": 1,
  "topicos": [
    {
      "slug": "hist.colonia.inconfidencia_mineira",
      "rotulo": "Inconfidência Mineira",
      "sinonimos": ["Conjuração Mineira", "Tiradentes"],
      "palavras_chave": ["derrama", "Vila Rica", "Minas Gerais", "século XVIII"],
      "bncc_sugeridos": ["EF08HI05"]
    },
    {
      "slug": "hist.colonia.conjuracoes_coloniais",
      "rotulo": "Conjurações Coloniais",
      "sinonimos": ["Conjuração Mineira", "Conjuração Baiana"],
      "palavras_chave": ["movimentos", "contestação", "colonial"],
      "bncc_sugeridos": ["EF08HI05", "EF08HI06"]
    }
  ]
}
```

---

## 5) /data/historia.EF8.json (amostra de itens)
```json
{
  "meta": {
    "schemaVersion": 1,
    "contentVersion": "2025-11-01",
    "disciplina": "História",
    "etapa_ano": "EF8"
  },
  "itens": [
    {
      "id_item": "HIS-EF8-0001",
      "disciplina": "História",
      "etapa_ano": "EF8",
      "bncc_codigo": "EF08HI05",
      "bncc_habilidade": "Analisar movimentos de contestação na América Portuguesa no século XVIII.",
      "eixo_tematico": "Brasil Colônia",
      "tema": "Inconfidência Mineira",
      "subtema": "Conjurações Coloniais",
      "topico_slug": "hist.colonia.inconfidencia_mineira",
      "sinonimos": ["Conjuração Mineira", "Tiradentes"],
      "palavras_chave": ["derrama", "Vila Rica", "Minas Gerais", "século XVIII"],
      "periodo": "século XVIII",
      "localidade": "Minas Gerais",
      "personagens": ["Tiradentes"],
      "tipo_item": "objetiva",
      "nivel_dificuldade": 3,
      "nivel_cognitivo": "analisar",
      "tempo_estimado_min": 3,
      "enunciado_html": "<p>Sobre a Inconfidência Mineira, assinale a alternativa correta.</p>",
      "alternativas_json": [
        { "letra": "A", "texto_html": "Foi um movimento do século XVIII em Minas Gerais influenciado por ideias iluministas.", "correta": true },
        { "letra": "B", "texto_html": "Ocorreu no Rio Grande do Sul no século XIX.", "correta": false },
        { "letra": "C", "texto_html": "Teve como líder Zumbi dos Palmares.", "correta": false },
        { "letra": "D", "texto_html": "Defendia a manutenção dos monopólios da Coroa.", "correta": false }
      ],
      "gabarito_tipo": "alternativa",
      "gabarito_valor": { "alternativa": "A" },
      "status_item": "validado",
      "tokens": [ { "id_token": "hist_colecaoX_ef8_2024", "categoria": "livro_didatico", "grau_aderencia": 4 } ],
      "midias_json": [],
      "acess_alt_text": null,
      "print_safe": true,
      "search_text": "inconfidencia mineira conjuracao mineira tiradentes derrama vila rica minas gerais seculo xviii"
    },
    {
      "id_item": "HIS-EF8-0002",
      "disciplina": "História",
      "etapa_ano": "EF8",
      "bncc_codigo": "EF08HI05",
      "bncc_habilidade": "Analisar movimentos de contestação na América Portuguesa no século XVIII.",
      "eixo_tematico": "Brasil Colônia",
      "tema": "Inconfidência Mineira",
      "subtema": "Documentos históricos",
      "topico_slug": "hist.colonia.inconfidencia_mineira",
      "sinonimos": ["Conjuração Mineira", "Tiradentes"],
      "palavras_chave": ["autos da devassa", "iluminismo", "derrama"],
      "periodo": "século XVIII",
      "localidade": "Vila Rica",
      "personagens": ["Tomás Antônio Gonzaga"],
      "tipo_item": "resposta_curta",
      "nivel_dificuldade": 3,
      "nivel_cognitivo": "entender",
      "tempo_estimado_min": 4,
      "enunciado_html": "<p>Explique brevemente o que foi a 'derrama' e sua relação com a Inconfidência Mineira.</p>",
      "gabarito_tipo": "respostas",
      "gabarito_valor": { "palavras_chave": ["cobrança de impostos atrasados", "aumento da pressão fiscal", "estopim do movimento"] },
      "status_item": "validado",
      "tokens": [ { "id_token": "met_investigativa", "categoria": "metodologia", "grau_aderencia": 3 } ],
      "midias_json": [],
      "acess_alt_text": null,
      "print_safe": true,
      "search_text": "derrama cobranca impostos relacao inconfidencia mineira explicacao"
    }
  ]
}
```

---

## 6) /schema/question-bank.schema.json (JSON Schema – mínimo funcional)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QuestionBank",
  "type": "object",
  "required": ["meta", "itens"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["schemaVersion", "contentVersion", "disciplina", "etapa_ano"],
      "properties": {
        "schemaVersion": { "type": "integer", "minimum": 1 },
        "contentVersion": { "type": "string" },
        "disciplina": { "type": "string" },
        "etapa_ano": { "type": "string" }
      }
    },
    "itens": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id_item", "disciplina", "etapa_ano", "bncc_codigo", "tema",
          "tipo_item", "nivel_dificuldade", "nivel_cognitivo",
          "enunciado_html", "gabarito_tipo", "gabarito_valor", "tempo_estimado_min", "status_item"
        ],
        "properties": {
          "id_item": { "type": "string" },
          "disciplina": { "type": "string" },
          "etapa_ano": { "type": "string" },
          "bncc_codigo": { "type": "string" },
          "bncc_habilidade": { "type": "string" },
          "eixo_tematico": { "type": "string" },
          "tema": { "type": "string" },
          "subtema": { "type": "string" },
          "topico_slug": { "type": "string" },
          "sinonimos": { "type": "array", "items": {"type": "string"} },
          "palavras_chave": { "type": "array", "items": {"type": "string"} },
          "periodo": { "type": "string" },
          "localidade": { "type": "string" },
          "personagens": { "type": "array", "items": {"type": "string"} },
          "tipo_item": { "type": "string", "enum": ["objetiva", "vf", "associacao", "lacuna", "resposta_curta", "dissertativa"] },
          "nivel_dificuldade": { "type": "integer", "minimum": 1, "maximum": 5 },
          "nivel_cognitivo": { "type": "string", "enum": ["lembrar", "entender", "aplicar", "analisar", "avaliar", "criar"] },
          "tempo_estimado_min": { "type": "number", "minimum": 0.5 },
          "enunciado_html": { "type": "string" },
          "alternativas_json": { "type": "array" },
          "gabarito_tipo": { "type": "string", "enum": ["alternativa", "verdadeiro", "respostas", "pares", "expectativa"] },
          "gabarito_valor": { "type": "object" },
          "status_item": { "type": "string", "enum": ["validado", "revisao", "rascunho"] },
          "tokens": { "type": "array" },
          "midias_json": { "type": "array" },
          "acess_alt_text": { "type": ["string", "null"] },
          "print_safe": { "type": ["boolean", "null"] },
          "search_text": { "type": ["string", "null"] }
        }
      }
    }
  }
}
```

---

## 7) /schema/tokens.schema.json (JSON Schema – mínimo)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tokens",
  "type": "object",
  "required": ["schemaVersion", "tokens"],
  "properties": {
    "schemaVersion": { "type": "integer" },
    "tokens": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id_token", "slug", "rotulo", "categoria", "status_token"],
        "properties": {
          "id_token": { "type": "string" },
          "slug": { "type": "string" },
          "rotulo": { "type": "string" },
          "categoria": { "type": "string", "enum": ["livro_didatico", "literatura", "metodologia", "referencia"] },
          "editora": { "type": ["string", "null"] },
          "colecao": { "type": ["string", "null"] },
          "obra": { "type": ["string", "null"] },
          "autor_obra": { "type": ["string", "null"] },
          "isbn": { "type": ["string", "null"] },
          "edicao_ano": { "type": ["string", "null"] },
          "etapa_ano": { "type": ["string", "null"] },
          "bncc_map_json": { "type": ["object", "null"] },
          "perfil_estilo_json": { "type": ["object", "null"] },
          "observacoes": { "type": ["string", "null"] },
          "status_token": { "type": "string", "enum": ["ativo", "inativo"] }
        }
      }
    }
  }
}
```

---

## 8) /schema/topics.schema.json (JSON Schema)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TopicsCatalog",
  "type": "object",
  "required": ["schemaVersion", "topicos"],
  "properties": {
    "schemaVersion": { "type": "integer" },
    "topicos": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["slug", "rotulo"],
        "properties": {
          "slug": { "type": "string" },
          "rotulo": { "type": "string" },
          "sinonimos": { "type": "array", "items": {"type": "string"} },
          "palavras_chave": { "type": "array", "items": {"type": "string"} },
          "bncc_sugeridos": { "type": "array", "items": {"type": "string"} }
        }
      }
    }
  }
}
```

---

## 9) /schema/exam.schema.json (ExamDoc salvo no IndexedDB – para referência)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExamDoc",
  "type": "object",
  "required": ["id", "title", "meta", "stage", "items", "seed", "targetItems"],
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "meta": {
      "type": "object",
      "properties": {
        "escola": { "type": ["string", "null"] },
        "professor": { "type": ["string", "null"] },
        "turma": { "type": ["string", "null"] },
        "etapaAno": { "type": ["string", "null"] },
        "disciplina": { "type": ["string", "null"] },
        "data": { "type": ["string", "null"] }
      }
    },
    "stage": { "type": "string" },
    "status": { "type": ["string", "null"] },
    "seed": { "type": "integer" },
    "targetItems": { "type": "integer" },
    "shuffleQuestions": { "type": "boolean" },
    "shuffleAlternatives": { "type": "boolean" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["refId"],
        "properties": {
          "refId": { "type": "string" },
          "locked": { "type": ["boolean", "null"] },
          "pickPolicy": { "type": ["string", "null"] },
          "altShuffleSeed": { "type": ["integer", "null"] },
          "notes": { "type": ["string", "null"] }
        }
      }
    },
    "answerKeyMode": { "type": ["string", "null"] },
    "teacherNotes": { "type": ["string", "null"] },
    "derived": { "type": ["object", "null"] },
    "rev": { "type": ["integer", "null"] },
    "createdAt": { "type": ["string", "null"] },
    "updatedAt": { "type": ["string", "null"] }
  }
}
```

---

## 10) /assets/print/prova.css (ABNT-like, A4)
```css
@page { size: A4; margin: 3cm 2cm 2cm 3cm; }
@media print {
  html, body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; }
  header.prova-cabecalho { margin-bottom: 12pt; }
  footer.prova-rodape { position: fixed; bottom: 0; width: 100%; font-size: 10pt; }
  .page-break { break-before: page; }
}
```

---

## 11) /docs/README_data.md (orientações rápidas)
```md
# Dados do Ripple (MiniApp Educação)

## Padrão de arquivos
- Um JSON por **disciplina × série**: `disciplina.SERIE.json` (ex.: `historia.EF8.json`).
- `manifest.json` mapeia rotas e versão de conteúdo.
- `tokens.json` lista estilos de livro/metodologias.
- Catálogo de tópicos por disciplina (ex.: `topicos.historia.json`).

## Versionamento
- Atualize `contentVersion` ao mudar qualquer JSON de dados.
- Mantenha `schemaVersion` para mudanças de estrutura.

## Qualidade (checklist)
- `status_item = validado` para ir ao ar.
- `bncc_codigo` válido; `tempo_estimado_min` preenchido.
- Acessibilidade: `acess_alt_text` obrigatório quando houver imagem; `print_safe=true`.
- Metadados de busca: `topico_slug`, `sinonimos`, `palavras_chave`, `search_text`.

## Convenções
- Codificação UTF-8; fim de linha LF.
- Chaves em `snake_case`.
- Sem HTML externo bloqueado (inline seguro nos enunciados).
```

---

## 12) Próximos arquivos a replicar
- Criar `disciplina.SERIE.json` para as demais séries/disciplinas conforme forem liberando itens.
- Criar `topicos.<disciplina>.json` por disciplina (ex.: Matemática, Português etc.).
- Expandir `tokens.json` com os tokens adotados pelas escolas atendidas.

---

## 13) Sumário – o que este pacote já permite
- Publicar banco de itens (piloto História EF8) com metadados ricos.
- Disponibilizar catálogo de tópicos e tokens para filtragem por estilo.
- Validar JSONs via schemas (prontos) antes do deploy.
- Renderizar prova com CSS A4 padronizado.
```

