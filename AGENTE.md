# AGENT.md — Instruções Iniciais para o Codex

**Documento oficial de orientação para execução automática dentro do repositório MiniApp.**

Este repositório abriga o **projeto MiniApp**, uma plataforma modular que contém múltiplas aplicações internas (mini-apps), cada uma com sua estrutura, fluxos e arquivos próprios.
O objetivo do Codex é **auxiliar na organização, padronização e manutenção técnica**, sempre respeitando as regras de segurança, legalidade e integridade documental.

As instruções abaixo definem exatamente o que o Codex pode e deve fazer — e o que não pode fazer.

---

# 📌 1. Escopo do Codex

O Codex está autorizado unicamente a:

* organizar estruturas de pastas e arquivos do repositório;
* garantir consistência e limpeza dentro dos diretórios;
* auxiliar na manutenção de padrões;
* gerar logs e registrar alterações;
* abrir pull requests clara e organizadamente;
* executar internacionalização conforme solicitado.

O Codex **não pode**:

* alterar conteúdo autoral, dados originais, textos oficiais ou materiais protegidos;
* modificar significado, interpretação ou contexto de qualquer arquivo;
* executar tarefas fora deste documento.

---

# 📌 2. Estrutura de Pastas e Organização

O Codex deve manter:

### **Estrutura limpa**

* excluir arquivos duplicados, obsoletos ou não referenciados **somente quando solicitado**;
* evitar criação de estruturas paralelas que fujam do padrão;
* sempre preservar arquivos essenciais.

### **Padronização**

* nomes de diretórios coerentes, em lowercase quando possível;
* nomes de arquivos claros e previsíveis;
* evitar espaços, caracteres especiais e abreviações ambíguas.

### **Integridade**

* nunca mover ou renomear arquivos que façam parte de funcionalidades principais sem instrução explícita;
* jamais excluir conteúdos originais sem permissão.

---

# 📌 3. Manutenção do Repositório

O Codex deve:

* manter o repositório legível, organizado e livre de inconsistências;
* validar que arquivos recém-criados estão no diretório correto;
* padronizar formatação de JSON, Markdown e estruturas simples;
* registrar toda alteração em um log incluído no PR.

Cada PR deve conter:

* descrição objetiva do que foi feito;
* resumo das modificações;
* justificativa técnica;
* logs automáticos quando aplicável.

---

# 📌 4. Internacionalização — Processo Simplificado

Quando eu solicitar:
**“internacionalizar esta pasta”**
ou instrução equivalente,

o Codex deve seguir este procedimento:

### **4.1 Identificar o arquivo de origem (idioma nativo)**

* sempre o arquivo **sem sufixo de idioma**
  exemplo: `2026.json`

### **4.2 Identificar todos os arquivos de tradução**

* arquivos com sufixo do tipo:

  * `*.en-US.json`
  * `*.es-ES.json`
  * `*.it-IT.json`
  * etc.
* pode existir qualquer quantidade de idiomas; o Codex deve lidar com todos.

### **4.3 Sincronizar estrutura**

O Codex deve garantir que cada tradução:

* tenha a **mesma estrutura** do arquivo original;
* possua todas as chaves novas adicionadas;
* remova chaves que não existem mais no original;
* mantenha **todos os valores já traduzidos**, sem alteração textual;
* mantenha o arquivo original totalmente intacto.

### ⚠ O Codex NÃO traduz textos

Ele **apenas replica estrutura**.
Todo significado, enunciado, frase, conteúdo ou texto deve permanecer inalterado.

### **4.4 Criação de novos idiomas**

Se existir:

```
arquivo.xx-XX.json
```

→ o Codex deve incluí-lo automaticamente na rotina.

Se estiver vazio:
→ o Codex cria apenas a estrutura, sem inserir textos.

### **4.5 Log obrigatório**

O Codex deve registrar:

* arquivos sincronizados
* idiomas atualizados
* campos adicionados
* campos removidos
* horário da operação
* resumo da ação

E incluir o log no PR.

---

# 📌 5. Segurança, Legalidade e Responsabilidade

Para evitar problemas legais, institucionais e de integridade:

### O Codex é proibido de:

* alterar conteúdo autoral dos arquivos originais;
* alterar conteúdo textual traduzido;
* reescrever textos de qualquer idioma;
* contextualizar textos para outros países;
* ajustar ou adaptar significados;
* acessar URLs externas não autorizadas;
* gerar conteúdo novo no lugar do original;
* omitir ou suprimir dados sem permissão.

Conteúdos originais devem permanecer **invioláveis**.

---

# 📌 6. Execução Condicional

O Codex **só deve executar ações quando solicitado explicitamente**, como por exemplo:

* “organizar pastas”
* “limpar este diretório”
* “internacionalizar esta pasta”
* “sincronizar esta estrutura”
* “validar arquivos desta área”
* “gerar PR desta revisão”

Se não houver solicitação clara, o Codex não deve agir.

---

# 📌 7. Conclusão

Este documento define todas as permissões e limitações iniciais do Codex dentro do repositório MiniApp.

Ele deve:

* manter a ordem,
* manter integridade,
* manter traduções sincronizadas,
* manter logs,
* e sempre operar com segurança.

---

**Fim do AGENT.md simplificado**
