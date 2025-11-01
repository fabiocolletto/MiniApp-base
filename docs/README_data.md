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
