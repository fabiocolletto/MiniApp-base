# CONTRIBUTING.md – Guia de Contribuição do PWAO

Obrigado por contribuir com o **PWAO (Progressive Web App Orgânico)**.  
Este documento estabelece as regras, práticas e padrões obrigatórios para qualquer mudança no repositório.

O PWAO não é uma aplicação comum — ele é um **organismo digital vivo**, composto por Genoma, Células, Órgãos e Memória Orgânica. Dessa forma, todo colaborador deve seguir rigorosamente este guia antes de alterar qualquer arquivo.

---

# 1. Antes de Começar

Leia estes documentos na ordem:

1. **AGENT.md** – Filosofia e diretrizes do organismo
2. **ARCHITECTURE.md** – Modelos estruturais
3. **STYLEGUIDE.md** – Padrões visuais e de código
4. **SECURITY.md** – Políticas de segurança
5. **ROADMAP.md** – Visão futura e planejamento

Nenhuma contribuição deve ser feita sem compreender o funcionamento completo do PWAO.

---

# 2. Regras Gerais de Contribuição

### ✔ Nunca modificar a estrutura do Genoma
O Genoma (`index.html`) é o núcleo do organismo. Alterações diretas são extremamente sensíveis e devem ser feitas apenas quando explicitamente aprovadas.

### ✔ Não acoplar células entre si
Cada célula deve permanecer 100% isolada. Não compartilhe scripts, dados ou lógica entre células.

### ✔ Não acessar arquivos externos à célula
Células só podem acessar:
- seus órgãos
- seus datasets
- seu próprio HTML

### ✔ Caminhos sempre relativos
Nunca usar caminhos absolutos ("/").  
Exceção: arquivos do OPP (service worker e manifest).

### ✔ Órgãos devem ser ES Modules
Use sempre:
```html
<script type="module" src="./orgao-algo.js"></script>
```

---

# 3. Criando uma Nova Célula

Toda célula deve seguir a estrutura:
```
celulas/<dominio>/<nome>/
  index.html
  orgao-*.js
  datasets/
```

### Regras da célula:
- A célula deve registrar-se via `window.PWAO_RegistrarCelula()`
- O nome deve ser único e seguir o formato `dominio.nome`
- Os órgãos devem manipular apenas o DOM da célula

Exemplo de manifesto:
```js
window.PWAO_RegistrarCelula({
  nome: "educacao.quiz",
  caminho: "celulas/educacao/quiz/index.html",
  orgao: "educacao",
  versao: "1.0.0"
});
```

---

# 4. Criando ou Editando Órgãos

Órgãos são scripts responsáveis por lógica.

### Regras obrigatórias:
- Nunca acessar o Genoma
- Nunca acessar variáveis globais
- Nunca manipular outras células
- Nunca realizar fetch de arquivos fora da própria célula
- Devem ser escritos como módulos (`export` / `import` quando necessário)

---

# 5. Atualizando o OPP

A pasta `/opp` contém:
- manifest.webmanifest
- service-worker.js
- ícones

### Regras:
- Não alterar o `theme_color` ou `background_color` sem aprovação
- O service worker deve manter compatibilidade offline
- Alterações devem respeitar padrões de segurança descritos em SECURITY.md

---

# 6. Commit e Versionamento

### Mensagens de Commit
Siga o padrão:
```
feat(celula.nome): descrição
fix(celula.nome): correção
chore(genoma): manutenção
refactor(orgao.nome): refatoração
```

### Versionamento das Células
Cada célula possui sua versão semver (`1.0.0`).
O Genoma tem versão própria (`V4.x`).

Alterações devem seguir:
- `patch` para correções
- `minor` para melhorias compatíveis
- `major` apenas quando ocorrer ruptura estrutural

---

# 7. Testes e Validações

Antes de abrir um PR:
- Verifique se a célula registra corretamente
- Teste em ambiente offline (OPP)
- Teste em HTTPS (GitHub Pages)
- Valide que o Genoma não foi afetado
- Valide caminhos relativos

### Testes obrigatórios:
- Expressão da célula
- Carregamento de datasets
- Interação do órgão
- Registro na Memória Orgânica
- Autodiscovery após recarregar a página

---

# 8. Proibido

As seguintes ações **não são permitidas**:

- Alterar a raiz do organismo (index.html) sem autoridade
- Movimentar células entre domínios
- Acessar datasets de outras células
- Usar `localStorage` para dados persistentes (usar Memória Orgânica)
- Carregar scripts externos sem aprovação
- Inserir lógica no Genoma para uma célula específica

---

# 9. Fluxo de Pull Request

1. Abra uma branch a partir de `main` (ou `pwao`)
2. Faça alterações seguindo este documento
3. Teste em modo HTTPS
4. Abra o PR descrevendo:
   - o que foi alterado
   - impacto
   - se houve mudança em células existentes
5. Aguardar análise
6. Correções, se necessárias
7. Merge final

---

# 10. Contato

Para dúvidas sobre arquitetura ou contribuições maiores, consulte o mantenedor oficial do PWAO.

---

# Versão
CONTRIBUTING v1.0
