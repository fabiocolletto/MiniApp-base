# STYLEGUIDE.md – Guia de Estilo do PWAO

Este documento estabelece os padrões visuais, estruturais e de código que devem ser usados em todas as partes do **PWAO (Progressive Web App Orgânico)**. Ele garante consistência, evolução estável e identidade do organismo.

---

# 🎨 1. Filosofia de Estilo do PWAO

O PWAO segue quatro princípios de estilo:

### **1. Clareza**  
Códigos, células e órgãos precisam ser legíveis.

### **2. Isolamento**  
Cada célula define seu próprio estilo.

### **3. Neutralidade**  
O Genoma nunca impõe aparência às células.

### **4. Minimalismo Funcional**  
Estilos reduzidos ao necessário, priorizando velocidade e simplicidade.

---

# ✨ 2. Estilos no Genoma

O Genoma deve ser **visualmente neutro**.

### Regras:
- Usar apenas estilos básicos.
- Nunca aplicar estilos globais invasivos.
- Nunca definir componentes visuais dentro do Genoma.

Exemplo permitido:
```css
body { margin: 0; background: #fafafa; font-family: sans-serif; }
#root { padding: 20px; }
```

Exemplo proibido:
```css
button { border-radius: 20px; background: blue; }
```

Esse tipo de estilo pertence à célula.

---

# 🧩 3. Estilos em Células

Cada célula controla sua própria aparência.

### Boas práticas:
- Estilos apenas dentro da pasta da célula.
- Pode usar Tailwind, inline CSS ou arquivo `.css` local.
- Nunca usar caminhos absolutos.

Exemplos de estrutura:
```
celulas/educacao/quiz/index.html
celulas/educacao/quiz/style.css
```

### Uso de Tailwind
Tailwind é permitido apenas dentro da célula.

Exemplo:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

O Genoma **não** deve carregar Tailwind.

---

# 🎭 4. Identidade Visual

A identidade visual não é imposta pelo Genoma.
Cada célula pode definir:
- paleta de cores
- tipografia
- layout
- ícones locais

### Regras:
- Não usar `<link>` para bibliotecas externas de fontes no Genoma.
- Células podem usar Google Fonts.
- Ícones preferencialmente em **SVG**.

---

# 📦 5. Componentes

Não existe biblioteca central de componentes no PWAO.
Cada célula é completamente independente.

Se quiser reaproveitar algo:
- copie o componente para dentro da célula
- não compartilhe arquivos entre células

---

# 🧬 6. Estrutura de Código (JS)

### **6.1 Regras Gerais**
- Código sempre em ES Modules
- Nunca usar `var`
- Evitar estado global
- Sempre isolar lógica dentro dos órgãos

### **6.2 Nomeação**
- Funções: `camelCase`
- Variáveis: `camelCase`
- Classes: `PascalCase`
- Arquivos de órgão: `orgao-nome.js`

### **6.3 Importação / Exportação**
Órgãos podem exportar funções internas para organização.

Exemplo:
```js
export function iniciarQuiz() { ... }
```

---

# 📁 7. Estrutura de Pastas

Conforme definido na arquitetura:
```
celulas/<dominio>/<nome>/
  index.html
  orgao-*.js
  datasets/
  style.css (opcional)
```

Regras:
- Nunca criar pastas compartilhadas.
- Nunca usar pastas externas.

---

# 🔤 8. Texto e Linguagem

### Regras:
- Linguagem simples
- Nenhum texto técnico exposto ao usuário
- As células devem definir seus próprios textos

### Acessibilidade mínima:
- Botões com textos claros
- Labels para inputs
- Sem contraste pobre

---

# 📚 9. Datasets

Datasets devem ser:
- JSON puro
- organizados por pasta
- com nomes claros e versão evidente

Exemplo:
```
datasets/enem/2021/questions.json
```

---

# 🧱 10. Estrutura HTML Interna das Células

### Regras:
- Usar um único elemento root para renderização
- Carregar órgãos como último script do corpo

Exemplo:
```html
<div id="quiz-root"></div>
<script type="module" src="./orgao-quiz.js"></script>
```

---

# 🖍️ 11. Estilo de Comentários

### HTML:
```html
<!-- Comentário curto e objetivo -->
```

### CSS:
```css
/* Comentário explicando agrupamento */
```

### JS:
```js
// Comentários de uma linha
/* Comentários de bloco */
```

Evitar comentários redundantes.

---

# 🔐 12. Segurança Visual e de Código

- Não carregar scripts externos automaticamente
- Não usar bibliotecas suspeitas
- Não incorporar HTML vindo de datasets sem sanitização
- Garantir que órgãos tratem falhas com mensagens simples

Mais regras no documento `SECURITY.md`.

---

# 🧭 13. Versão
STYLEGUIDE v1.0 – Guia inicial de estilo visual e estrutural do PWAO
