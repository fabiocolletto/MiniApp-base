Aqui vai um README bem “padrão de casa”, direto e escalável, pra você colocar em `docs/pages/README.md`. Já deixei no tom certo pra quem cair ali entender o propósito, como nomear, como linkar no footer e como isso conversa com o banco do sistema.

---

```md
# docs/pages

Esta pasta contém as **telas navegáveis do MiniApp** (Stage principal), ou seja, páginas que são carregadas pelos botões do footer e representam a navegação normal do usuário.

A ideia é separar claramente:

- **Shell do sistema** (raiz de `docs/`)
- **Componentes compartilhados** (`docs/components/`)
- **Painéis administrativos / CRUD** (`docs/admin/`)
- **Telas do app (navegação)** (`docs/pages/`) ✅

Isso evita bagunça na raiz e facilita a evolução do sistema.

---

## O que entra aqui

Entram apenas páginas “de uso do app”, por exemplo:

- Home / visão geral
- Catálogo
- Favoritos
- Recentes
- Configurações (do usuário)
- Qualquer outra tela que venha a ser aberta pelo footer

**Não** entram telas administrativas, cadastros, backoffice etc.  
Essas vão para `docs/admin/`.

---

## Convenção de nomes

Use **kebab-case** (padrão web clássico):

✅ `catalog.html`  
✅ `favorites.html`  
✅ `recents.html`  
✅ `settings.html`

Evite espaços, acentos ou nomes longos.

Se a página precisar de JS específico, use o mesmo nome:

- `catalog.html`
- `catalog.js`

CSS específico só quando realmente necessário, porque o padrão é usar os globais:

- `docs/miniapp-global.css`
- `docs/miniapp-card.css`

---

## Como essas páginas são carregadas

O Stage (no `docs/index.html`) carrega páginas por **URL direta**, disparadas pelos botões do footer.

Exemplo de URL no banco do sistema:

```

docs/pages/catalog.html
docs/pages/favorites.html

```

Ou seja, **toda página desta pasta deve ter caminho público e estável**.

---

## Padrão mínimo de página

Toda página deve:

1. Importar CSS globais do sistema
2. Importar JS globais e helpers, se necessário
3. Renderizar conteúdo dentro do container padrão do Stage
4. Ser responsiva (mobile-first)

Use como referência visual e estrutural os MiniApps já existentes.

---

## Checklist rápido antes de subir

- [ ] Nome em kebab-case
- [ ] Caminho correto no banco: `docs/pages/<slug>.html`
- [ ] Imports globais funcionando
- [ ] Responsividade ok
- [ ] Sem dependências locais quebradas

---

## Observação

Esta pasta é parte do **Sistema MiniApp-Base**, publicado via GitHub Pages.  
Mudanças aqui ficam públicas automaticamente após merge na `main`.
