# ARCHITECTURE.md – Arquitetura Oficial do PWAO

Este documento descreve a **arquitetura completa** do PWAO (Progressive Web App Orgânico), seus blocos fundamentais, regras estruturais e comportamentos internos. Ele serve como referência técnica obrigatória para desenvolvimento, auditoria e evolução do organismo digital.

---

# 1. Visão Geral da Arquitetura

O PWAO é inspirado em sistemas biológicos. Ele não é um app tradicional, nem um PWA clássico — ele é um **organismo digital vivo**, composto por:

- **Genoma** (index.html)
- **Células** (unidades de interface + lógica)
- **Órgãos** (motores funcionais JS)
- **Memória Orgânica** (IndexedDB)
- **Narrador** (sistema de eventos)
- **OPP** (pacote instalável contendo manifest + service worker)

Cada elemento do sistema é isolado, autocontido e capaz de evoluir sem interferir nos outros.

---

# 2. Genoma (index.html)

O Genoma é o núcleo do PWAO.
Ele contém:

- Loader
- Renderer
- Memória Orgânica
- Narrador
- Autodiscovery
- Registro do Service Worker (OPP)
- Ciclo de vida do organismo

### Responsabilidades:
- Inicializar o organismo
- Descobrir células vivas
- Expressar células sob demanda
- Manter estado mínimo

### Restrições:
- O Genoma **não pode conhecer** células ou órgãos diretamente.
- O Genoma nunca deve ser movido para uma subpasta.
- O Genoma nunca deve ser importado por outra parte do sistema.

Estrutura:
```
pwao/
  index.html ← genoma
```

---

# 3. Células

As células são o equivalente a páginas, módulos ou microaplicativos — porém com isolamento total.

### Cada célula possui:
- Um arquivo `index.html`
- Seu próprio manifesto (via `PWAO_RegistrarCelula()`)
- Seus órgãos
- Seus datasets

### Regras:
- Caminhos devem ser **sempre relativos**.
- A célula nunca acessa arquivos de outra célula.
- A célula nunca referencia o Genoma.
- Toda célula é autônoma e autocontida.

### Estrutura exemplo:
```
celulas/educacao/quiz/
  index.html
  orgao-quiz.js
  datasets/
    cursos.json
    enem/2021/questions.json
```

---

# 4. Manifesto Celular

Toda célula deve se registrar assim que carregada:

```js
window.PWAO_RegistrarCelula({
  nome: "educacao.quiz",
  caminho: "celulas/educacao/quiz/index.html",
  orgao: "educacao",
  versao: "1.0.0"
});
```

Através desse manifesto o organismo consegue:
- descobrir células automaticamente
- reter memória sobre células instaladas
- expressar células dinamicamente

---

# 5. Órgãos (Motores Funcionais)

Os órgãos são scripts ES Modules que executam toda a lógica de uma célula.

### Regras essenciais:
- Devem ser sempre carregados via `type="module"`.
- Devem atuar **apenas dentro da célula**.
- Não podem manipular outras células.
- Não podem acessar o Genoma.
- Podem carregar datasets locais via `fetch()`.

Um órgão pode ser composto por vários arquivos.

---

# 6. Narrador (Sistema de Eventos)

O Narrador é o mecanismo de comunicação interna do organismo.

Ele permite expressar células sem acoplamento:

```js
Narrador.emitir({ tipo: "celula.expressar", nome: "educacao.quiz" })
```

### Características:
- Pub/sub interno
- Não usa listeners do DOM
- Não tem hierarquia
- É 100% desacoplado

---

# 7. Loader

O Loader é responsável por:
- registrar células
- armazenar manifestos na Memória Orgânica
- expressar células
- carregar o HTML de cada célula via fetch

O Loader nunca conhece a lógica interna da célula.

---

# 8. Renderer

O Renderer é o expressor visual do organismo.

Regras:
- Substitui o conteúdo do `<div id="root">`
- Nunca mantém estado interno
- Deve exibir mensagens de erro claras

---

# 9. Memória Orgânica (IndexedDB)

A Memória Orgânica é o equivalente ao tecido de longo prazo.

É usada para:
- armazenar células registradas
- reter estado básico
- permitir autodiscovery

### Estruturas de Store:
- `cells` – manifestos das células
- `settings` – configurações gerais

---

# 10. OPP – Organic Progressive Package

O OPP torna o organismo instalável em dispositivos.

Inclui:
```
/opp/
  manifest.webmanifest
  service-worker.js
  icon-192.png
  icon-512.png
```

### Funções:
- permitir instalação no celular
- habilitar funcionamento offline
- gerenciar cache dinâmico de células

### Regras:
- Service worker só registra em ambiente seguro (HTTPS/localhost)
- Caminho deve ser `/opp/service-worker.js`

---

# 11. Datasets

Dados só podem existir dentro da célula proprietária.

Exemplo:
```
celulas/educacao/quiz/datasets/enem/2021/questions.json
```

Regras:
- proibido acessar datasets externos
- proibido acessar datasets de outra célula
- proibido caminhos absolutos

---

# 12. Fluxo de Vida do Organismo

1. Carrega o Genoma
2. Inicializa Memória Orgânica
3. Executa Autodiscovery
4. Células previamente instaladas são reconhecidas
5. Narrador é ativado
6. Organismo está pronto para expressar células

---

# 13. Regras de Evolução

### Permitido:
- adicionar novas células
- atualizar órgãos
- adicionar datasets

### Proibido:
- mover o Genoma
- acoplar células entre si
- referenciar o Genoma dentro de células
- usar caminhos absolutos

---

# 14. Convenções de Nomes

- Células: `dominio.nome`
- Órgãos: `orgao-<função>.js`
- Datasets: nomes claros em minúsculas
- Versões: semver (`1.0.0`)

---

# 15. Versão do Documento

ARCHITECTURE v1.0 – Modelo inicial da arquitetura PWAO
