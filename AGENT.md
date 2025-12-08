# AGENT.md – Diretrizes Oficiais do Organismo PWAO

Este documento define **todas as regras**, **estruturas**, **padrões** e **comportamentos** do novo ecossistema PWAO (Progressive Web App Orgânico). Ele é o ponto de partida obrigatório para qualquer desenvolvedor que contribuir com o repositório.

O PWAO não segue as práticas tradicionais de PWAs ou MFEs. Ele representa um organismo digital composto por **Genoma**, **Células**, **Órgãos** e **OPP** (Organic Progressive Package). Sua evolução é orgânica, incremental e distribuída.

---

## 1. Princípios Fundamentais do PWAO

O PWAO funciona como um organismo vivo, guiado por três camadas essenciais:

### **Genoma**
É o arquivo raiz (`index.html`) e contém:
- Loader
- Renderer
- Memória Orgânica
- Narrador
- Ciclo de Vida do Organismo
- Inicialização do Autodiscovery
- Registro do OPP (manifest + service worker)

### **Células**
São unidades isoladas que representam telas, módulos ou features.
Cada célula possui:
- Um `index.html` próprio
- Um manifesto interno (via `window.PWAO_RegistrarCelula()`)
- Seus próprios órgãos (arquivos JS)
- Seus dados locais (datasets)

### **Órgãos**
São motores funcionais escritos em JavaScript, sempre carregados via ES Modules.
Um órgão **nunca** interfere no Genoma ou em outras células.

### **OPP – Organic Progressive Package**
Pacote instalável do organismo (PWA instalável).
Inclui:
- manifest.webmanifest
- service-worker.js
- ícones

O OPP habilita o PWAO a rodar offline e ser instalado em celulares e desktops.

---

## 2. Estrutura Obrigatória do Repositório

A raiz deve conter:
```
/index.html                 ← Genoma V4.2
/opp/                       ← Pacote OPP
/celulas/                   ← Todas as células do organismo
README.md
AGENT.md
ARCHITECTURE.md
STYLEGUIDE.md
SECURITY.md
ROADMAP.md
```

### Estrutura de uma célula:
```
celulas/<dominio>/<nome>/
  index.html               ← célula
  orgao-*.js               ← órgãos dessa célula
  datasets/                ← dados isolados
```

### Regras:
- Nenhuma célula acessa arquivos fora da própria pasta.
- Uma célula só se torna viva quando registra seu manifesto.
- O Genoma jamais deve conhecer células diretamente.
- Todas as conexões são feitas via **autodiscovery**.

---

## 3. Genoma PWAO (index.html)

O Genoma é sempre salvo na raiz do repositório.
Ele controla:
- inicialização do organismo
- registro do service worker
- autodiscovery das células
- expressão de células via Narrador

O Genoma **nunca** deve importar órgãos, nem manipular células diretamente.
Toda expressão deve ser ativada por:
```
Narrador.emitir({ tipo: "celula.expressar", nome: "educacao.quiz" })
```

---

## 4. Manifiestos Celulares

Cada célula deve registrar-se assim que carregada:
```js\window.PWAO_RegistrarCelula({
  nome: "educacao.quiz",
  caminho: "celulas/educacao/quiz/index.html",
  orgao: "educacao",
  versao: "1.0.0",
  descricao: "Célula de Quiz Educacional"
});
```

### Regras:
- O nome deve ser único.
- O caminho deve ser relativo ao repositório.
- A versão deve ser semantic version (semver).
- O Genoma não registra células manualmente.

---

## 5. Órgãos

Os órgãos são scripts isolados.
Regras obrigatórias:
- Sempre usar ES Modules (`type="module"`).
- Nunca acessar global do Genoma.
- Nunca manipular outras células.
- Sempre montar sua interface dentro da célula.
- Podem carregar datasets via `fetch()`.

---

## 6. Pacote OPP

A pasta `/opp` contém tudo que torna o PWA installável.

### `manifest.webmanifest`
- name
- short_name
- theme_color
- background_color
- ícones
- start_url

### `service-worker.js`
- cache do Genoma
- cache dinâmico de células e datasets
- fallback offline

### Regras do OPP:
- O service worker só registra em HTTPS ou localhost.
- O caminho deve ser `/opp/service-worker.js`.

---

## 7. Datasets

Dados são sempre armazenados dentro da própria célula:
```
celulas/<dominio>/<nome>/datasets/
```

Exemplo:
```
celulas/educacao/quiz/datasets/enem/2021/questions.json
```

Regras:
- Nunca acessar datasets de outra célula.
- Nunca usar caminhos absolutos.
- Tudo é relativo à célula.

---

## 8. Segurança

- Nenhuma célula pode executar código do Genoma.
- Organismos externos devem ser carregados somente via HTTPS.
- Nunca expor chaves de API.
- Service worker deve validar origem.

Mais detalhes em `SECURITY.md`.

---

## 9. Processo de Evolução do Organismo

O organismo pode evoluir sem quebrar estrutura.

### Mudanças permitidas:
- adicionar novas células
- atualizar órgãos
- incluir datasets

### Mudanças proibidas:
- alterar o nome do Genoma
- mover o Genoma para subpastas
- fazer o Genoma referenciar células diretamente
- acoplar órgãos entre si

---

## 10. Contribuição

Antes de qualquer mudança:
1. Leia este arquivo (AGENT.md)
2. Leia ARCHITECTURE.md
3. Leia STYLEGUIDE.md
4. Atualize o CHANGELOG.md
5. Não quebre o Genoma

---

## 11. Glossário

**Genoma** – núcleo do organismo (index.html)

**Célula** – unidade isolada, representada por index.html + órgãos + datasets

**Órgão** – lógica funcional da célula

**OPP** – pacote instalável (manifest + service worker)

**Narrador** – sistema de eventos do organismo

**Autodiscovery** – mecanismo que encontra células registradas

---

## 12. Versão

AGENT v1.0 – modelo inicial do ecossistema PWAO
