# AGENT.md — Diretrizes Oficiais para Desenvolvimento no PWAO

Este documento é **o primeiro arquivo que qualquer desenvolvedor, IA, agente automatizado ou colaborador humano deve ler** ao trabalhar dentro deste repositório. Ele define as regras fundamentais, a arquitetura-base e os princípios que regem o desenvolvimento do **PWAO — Progressive Web App Orgânico**.

Nada neste repositório é convencional. Nada segue o modelo clássico de PWA, MFE ou SPA.
O PWAO é um organismo digital, e todo desenvolvimento deve respeitar sua biologia interna.

---

# 1. Conceito Geral do PWAO

O PWAO não é um aplicativo modular. Não é um conjunto de páginas.
Ele é um **organismo** composto por:

* **Genoma** — núcleo imutável, responsável por consciência, expressão e comportamento
* **Células** — unidades funcionais externas, carregadas sob demanda
* **Órgãos** — agrupamentos naturais de células
* **Memória Orgânica (IndexedDB)** — registro persistente do estado do organismo
* **Narrador** — inteligência interpretativa central

O objetivo é sempre preservar:

* simplicidade estrutural
* isolamento funcional
* evolução contínua
* segurança extrema

---

# 2. Estrutura Obrigatória do Repositório

```
/
├── index.html               → Genoma (AppShell do organismo)
├── README.md                → Documentação geral
├── AGENT.md                 → Este documento (primeiro a ser lido)
└── celulas/                 → Tecido do organismo
     └── sistema/
          ├── auth/
          │    └── index.html
          └── admin/
               └── painel.html
```

### Regras fundamentais:

* Nada altera o Genoma diretamente sem passar por revisão.
* Toda nova função deve nascer como **célula**.
* Órgãos são apenas agrupamentos, não pastas especiais.
* Células nunca contêm segredos, chaves ou dependências críticas.

---

# 3. O Genoma

O arquivo `index.html` é o **DNA do organismo**.
Ele nunca deve conter:

* lógicas externas
* chamadas a APIs
* tokens, segredos ou credenciais
* elementos acoplados a células específicas

O Genoma contém apenas:

* Loader
* Narrador
* Renderer
* Genes essenciais
* Inicialização da Memória

Se algo é mutável, escalável ou dependente de clientes, não deve entrar no Genoma.

---

# 4. Células

Uma célula é um arquivo HTML/JS independente que contém:

* sua interface
* sua lógica local
* suas traduções
* seu comportamento

Células devem ser criadas em:

```
celulas/<orgao>/<nome>/index.html
```

Células **nunca modificam o Genoma**.
Células **podem ser atualizadas sem quebrar o organismo**.

---

# 5. Órgãos

Órgãos são categorias funcionais:

* sistema
* familia
* educacao
* financeiro
* pesquisa

Cada órgão é formado por suas células internas.
Órgãos não possuem arquivo próprio — são apenas agrupamentos conceituais.

---

# 6. Memória Orgânica (IndexedDB)

O PWAO usa IndexedDB como memória local oficial.
Stores mínimos obrigatórios:

* `users`
* `admins`
* `perfis`
* `settings`

A evolução da memória deve sempre preservar compatibilidade.

---

# 7. Integrações Externas

Integrações **nunca entram no Genoma**.
Devem ser tratadas como **ambiente externo metabólico**, por exemplo via Make.com.

O repositório possui secrets configurados no ambiente GitHub Pages:

* `API_5HORAS` — endpoint para Make.com
* `USER_MASTER_ID`
* `USER_MASTER_SECRET`

Esses valores só podem ser acessados por células reguladoras ou serviços externos.

O Genoma apenas recebe eventos resultantes dessas integrações.

---

# 8. Branch Principal

A branch oficial agora é:

```
pwao
```

Todos os PRs devem partir desta branch.
Nenhuma outra branch deve ser usada para deploy.

---

# 9. Padrões de Commit

Commits devem ser escritos de forma clara, objetiva e orientada ao organismo:

```
feat(celula): nova célula de assinatura
fix(genoma): correção no gene de renderização
perf(renderer): otimização de expressão
refactor(narrador): melhoria na decisão de cena
```

---

# 10. Padrões de Desenvolvimento

### Sempre que for criar algo novo:

1. Pergunte: isso pertence ao Genoma ou a uma Célula?
2. Se tiver dúvida, pertence a uma **célula**.
3. Evite acoplamento.
4. Preserve o minimalismo do Genoma.
5. Nunca misture conceito de página com conceito de cena.
6. Evite bibliotecas externas pesadas.
7. Foco máximo em modularidade orgânica.

---

# 11. Segurança

* O Genoma nunca conhece segredos.
* Células nunca chamam a API externa diretamente sem passar pelo ambiente externo.
* Nada sensível é armazenado em localStorage — somente IndexedDB.
* O administrador é uma célula reguladora, não um perfil comum.

---

# 12. Processo de Evolução do Organismo

O organismo evolui em camadas:

* **Genoma** evolui raramente (mudanças profundas)
* **Órgãos** evoluem quando novas funcionalidades surgem
* **Células** evoluem naturalmente com frequência

Toda evolução deve manter:

* retrocompatibilidade
* isolamento
* estabilidade

---

# 13. Objetivo do Repositório

Este repositório não contém um aplicativo tradicional.
Ele contém **um organismo digital**, pronto para ser expandido indefinidamente.

Cada célula nova é uma nova capacidade do organismo.
Cada atualização do Genoma redefine sua biologia interna.

---

# 14. Contato e Governança

O repositório é mantido e supervisionado por:

* 5 Horas — Pesquisa e Análise
* Projeto Marco
* Nivero PWAO

Qualquer alteração deve seguir este documento.

---

# 15. Frase Guia

> "O Genoma é a vida. As Células são a expressão. O PWAO é o organismo."
