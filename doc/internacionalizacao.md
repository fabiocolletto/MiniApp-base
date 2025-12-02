# 🔧 Ordem Genérica de Internacionalização

Esta é a rotina que o Codex deve seguir **toda vez que eu solicitar: “internacionalizar esta pasta”** ou qualquer comando equivalente.

A instrução vale para qualquer diretório do repositório e para qualquer tipo de arquivo JSON, não apenas banco de dados de questões.

---

# 📌 1. Identificação da pasta e do arquivo de origem

Quando eu solicitar internacionalização, informarei uma **pasta**.
O Codex deve:

1. Ler todos os arquivos dentro dessa pasta.
2. Identificar qual arquivo é o **arquivo de origem** (idioma nativo).

   * O arquivo de origem **nunca** possui sufixo de idioma.
   * Exemplo de origem:

     * `2026.json`
   * Exemplo de traduções:

     * `2026.en-US.json`
     * `2026.es-ES.json`
     * `2026.fr-FR.json`

O arquivo de origem é a **fonte absoluta da verdade**.

---

# 📌 2. Regras sobre o arquivo de origem

O Codex **não pode modificar**:

* o texto do arquivo de origem
* a estrutura lógica do arquivo de origem
* os valores originais contidos no arquivo de origem

O arquivo de origem é inviolável.
Qualquer alteração nele deve ser feita manualmente por mim.

---

# 📌 3. Identificação dos arquivos de idioma

Na mesma pasta podem existir **zero, um ou vários** arquivos de tradução.

Cada arquivo traduzido possui o formato:

```
{nome}.{código-do-idioma}.json
```

Exemplos:

* `2026.en-US.json`
* `2026.es-ES.json`
* `2026.it-IT.json`

O Codex deve identificar todos automaticamente, **sem lista prévia de idiomas**.

Se houver idiomas novos, ele deve incluí-los automaticamente na rotina.

---

# 📌 4. Objetivo da internacionalização

O Codex deve **sincronizar a estrutura** de todos os arquivos traduzidos com o arquivo de origem.

Ele deve:

* garantir que **todas as chaves, campos e estruturas** sejam idênticas ao arquivo de origem;
* adicionar no arquivo de idioma qualquer campo novo que exista na origem;
* remover do arquivo de idioma qualquer campo removido na origem;
* manter os valores existentes na tradução sem modificá-los;
* criar arquivos ausentes para novos idiomas, usando o idioma original como base estrutural;
* nunca modificar o conteúdo textual de nenhum idioma (original ou traduzido).

O Codex **não traduz texto**, apenas estrutura os arquivos.

---

# 📌 5. Criação de novos idiomas

Se eu inserir um arquivo como:

```
2026.it-IT.json
```

E pedir “internacionalize esta pasta”, o Codex deve:

* ler o arquivo novo,
* sincronizar sua estrutura com o arquivo de origem,
* preencher todas as chaves ausentes,
* remover chaves excedentes,
* nunca alterar o valor textual dele.

Se o novo arquivo estiver vazio, o Codex deve apenas **replicar a estrutura** do original com valores vazios.

---

# 📌 6. Registro de Log

O Codex deve registrar **todas as alterações realizadas**, incluindo:

* arquivos afetados
* idiomas atualizados
* campos adicionados
* campos removidos
* campos alterados estruturalmente
* data e hora da operação

O log deve ser inserido no PR criado automaticamente.

---

# 📌 7. Responsabilidades legais

Para evitar violações de copyright, licenças e normas de órgãos públicos:

O Codex está proibido de:

* traduzir textos oficiais
* adaptar conteúdo
* contextualizar culturalmente
* ajustar significado
* reescrever enunciados
* criar variações ou interpretações
* modificar qualquer parte do original
* inventar campos, valores ou texto traduzido

Toda tradução deve ser **literal e objetiva**, sem perda de sentido e sem adaptação contextual.

O Codex só replica estrutura — **nunca o significado**.

---

# 📌 8. Ação proibida

O Codex **não pode**:

* alterar o arquivo original
* alterar qualquer texto traduzido
* usar URLs externas não declaradas
* reescrever conteúdo
* remover dados sem instrução
* executar interpretação sem comando explícito

---

# 📌 9. Ação final

Depois de completar a internacionalização:

1. Criar PR com todas as mudanças.
2. Anexar log completo.
3. Não executar nenhuma ação adicional além do que foi solicitado.

---

# ✔ Ordem concluída
