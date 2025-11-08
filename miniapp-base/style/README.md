#  Guia Visual: MiniApp-base Design System

Este repositório (`MiniApp-base`) é a **Fonte Única da Verdade** para a identidade visual de todos os Mini Apps (como `miniapp-prefeito`).

O objetivo é padronizar a aparência e **reduzir as escolhas** dos desenvolvedores de Mini Apps, fornecendo um conjunto de componentes prontos e "burros" que consomem uma lógica de design centralizada.

A lógica segue a metodologia **Atomic Design**:
1.  **Átomos:** A paleta de valores brutos (ex: `#ff7a00`, `16px`).
2.  **Moléculas:** Os nomes de propósito (ex: `--card-background`).
3.  **Organismos:** Os componentes visuais (ex: `.card`).

---

## 1. Átomos (Tokens Primitivos)

Os Átomos são a paleta de valores brutos definidos no `:root` do `styles.css`. Eles nunca devem ser usados diretamente por um componente.

### Paleta de Cores (Exemplos)

| Propósito | Token (Átomo) | Valor |
| :--- | :--- | :--- |
| Marca Primária | `var(--color-brand-primary)` | `#ff7a00` |
| Marca Secundária| `var(--color-brand-secondary)` | `#0b57d0` |
| Feedback Sucesso| `var(--color-accent-green)` | `#16a34a` |
| Feedback Erro | `var(--color-danger-red)` | `#dc2626` |
| Fundo (Claro) | `var(--color-light-bg)` | `#f7f9fb` |
| Superfície (Claro)| `var(--color-light-surface)` | `#ffffff` |
| Texto (Claro) | `var(--color-light-text-primary)` | `#0f172a` |
| Fundo (Escuro) | `var(--color-dark-bg)` | `#0b1220` |
| Texto (Escuro) | `var(--color-dark-text-primary)` | `#e5efff` |

### Escala de Espaçamento (Ritmo)

Usamos uma escala de ritmo base (4px/8px) para todos os `padding`, `margin` e `gap`.

| Token | Valor |
| :--- | :--- |
| `var(--space-1)` | 4px |
| `var(--space-2)` | 8px |
| `var(--space-3)` | 12px |
| `var(--space-4)` | 16px |
| `var(--space-5)` | 20px |
| `var(--space-6)` | 24px |
| `var(--space-7)` | 32px |
| `var(--space-8)` | 48px |

### Escala de Raio (T-Shirt Sizing)

| Token | Valor | Propósito |
| :--- | :--- | :--- |
| `var(--radius-s)` | 6px | Pequeno (Tags) |
| `var(--radius-m)` | 10px | Médio (Inputs) |
| `var(--radius-l)` | 14px | Grande (Cards, Modais) |
| `var(--radius-xl)`| 24px | Extra Grande (Header) |
| `var(--radius-pill)`| 9999px | Pílula (Botões) |

---

## 2. Moléculas (Tokens Semânticos)

As Moléculas dão **propósito** aos Átomos. Elas são a camada de decisão do sistema.

> **Exemplo:** Um componente `.card` não "sabe" qual é a cor de fundo. Ele apenas pede pela Molécula `--card-background`.
>
> ```css
> /* A Molécula decide (no :root): */
> --card-background: var(--color-light-surface); /* Aponta para o Átomo "branco" */
>
> /* O Organismo (componente) consome: */
> .card {
>   background: var(--card-background);
> }
> ```
>
> O **Modo Escuro** (`[data-theme="dark"]`) simplesmente troca a Molécula para apontar para um Átomo diferente:
>
> ```css
> [data-theme="dark"] {
>   --card-background: var(--color-dark-surface); /* Aponta para o Átomo "preto" */
> }
> ```

---

## 3. Organismos (A Biblioteca de Componentes)

Estes são os componentes visuais prontos para uso. O desenvolvedor do Mini App deve apenas copiar o HTML. O CSS é 100% "burro" e controlado pelas Moléculas.

### Botões (`.btn`, `.chipbtn`)

```html
<button class="btn">
  <span class="material-symbols-rounded">menu</span>
  Botão Padrão
</button>

<button class="btn primary">
  <span class="material-symbols-rounded">filter_list</span>
  Botão Primário
</button>

<button class="btn ghost">
  Limpar Filtros
</button>

<button class="chipbtn">
  <span class="material-symbols-rounded">light_mode</span>
  Tema Claro
</button>
