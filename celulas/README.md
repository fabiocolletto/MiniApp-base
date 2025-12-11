Este diretório contém todos os domínios celulares do Organismo PWAO. Cada domínio representa um universo autônomo de funcionalidades, composto por suas próprias células, órgãos e datasets. Esta camada é o segundo nível do organismo, imediatamente abaixo do Genoma, e deve seguir rigorosamente os princípios de isolamento, modularidade e evolução orgânica definidos pelo PWAO.

---

## Função do Nível Celular

A pasta **celulas/** não é apenas um agrupamento técnico. Ela é a base da anatomia distribuída do organismo. Aqui vivem os domínios, e dentro deles as células, cada uma responsável por uma parte da experiência do usuário. Este nível herda automaticamente do CORE toda a infraestrutura necessária para:

* Expressão visual controlada (Header, Stage, Footer)
* Navegação interna via destinos declarados pela célula
* Comunicação orgânica por meio dos protocolos do PWAO
* Persistência de dados através da Memória Orgânica
* Manipulação de variáveis (criar, editar, excluir) oferecida pelo CORE

Essas capacidades **não precisam ser reimplementadas**. Toda célula nasce com acesso indireto e seguro às funções expostas pelo CORE, que atua como intermediário entre o Genoma, o Stage e a Memória.

---

## Domínios Atuais

Os domínios existentes são:

* **educacao**
* **empresa**
* **familia**
* **governo**
* **individuo**
* **saude**
* **sistema**

Cada domínio possui seu próprio README, descrevendo suas células internas, regras específicas e os protocolos de comunicação com o CORE.

---

## Estrutura Oficial

A estrutura mínima esperada dentro desta pasta é:

```
celulas/
  <dominio>/
    <celula>/
      index.html
      orgao-*.js
      datasets/
    README.md
  README.md
```

Regras fundamentais:

* Cada domínio opera de forma isolada.
* Nenhuma célula pode acessar arquivos de outro domínio.
* Nenhuma célula pode acessar o Genoma ou o CORE diretamente.
* Todos os arquivos devem usar caminhos relativos.
* O CORE fornece automaticamente funções essenciais para as células.

---

## Capabilidades Herdadas do CORE

Todas as células, independentemente do domínio, herdam as seguintes funcionalidades, já fornecidas pelo CORE:

* **Manipulação de estado** através da Memória Orgânica (IndexedDB)
* **Salvar variáveis**, criar novos registros, atualizar valores e excluir entradas
* **Renderização automática** no Stage
* **Troca dinâmica de footer**, conforme botões declarados pela célula
* **Atualização do header** respeitando o título informado pela célula
* **Gerenciamento de navegação interna** via destinos declarados

Essas funções permitem que a célula mantenha sua lógica focada exclusivamente no seu propósito, sem reinventar camadas estruturais.

---

## Criação de Novos Domínios

A criação de um novo domínio celular só deve ocorrer quando houver propósito claro e função definida dentro do organismo. O processo consiste em:

1. Criar a pasta:

   ```
   celulas/<dominio>/
   ```
2. Criar o arquivo de documentação:

   ```
   celulas/<dominio>/README.md
   ```
3. Definir as regras, células internas e protocolos específicos daquele domínio.

Domínios são entidades independentes e nunca devem compartilhar lógica entre si.

---

## Criação de Células

Para criar uma nova célula dentro de um domínio:

1. Criar a pasta:

   ```
   celulas/<dominio>/<nome-da-celula>/
   ```
2. Criar o arquivo principal da célula:

   ```
   index.html
   ```
3. Registrar o manifesto da célula:

   ```js
   window.PWAO_RegistrarCelula({
     nome: "<dominio>.<nome-da-celula>",
     caminho: "celulas/<dominio>/<celula>/index.html",
     orgao: "<dominio>",
     versao: "1.0.0",
     descricao: "Descrição da célula"
   });
   ```
4. Criar órgãos internos usando ES Modules (`orgao-*.js`).
5. Adicionar datasets locais quando necessário (`datasets/`).

Regras absolutas:

* Células não podem acessar outras células.
* Células não podem manipular o Genoma ou o CORE diretamente.
* Células devem operar sempre em isolamento total.

---

## Comunicação com o CORE

A célula deve anunciar ao CORE três elementos fundamentais:

**Header**:

```js
header: { title: "Título da Célula" }
```

**Footer**:

```js
footer: {
  buttons: [
    { icon: "home", label: "Início", destino: "inicio" },
    { icon: "list", label: "Listagem", destino: "lista" }
  ]
}
```

**Stage**:

```js
stage: {
  destino: "inicio",
  views: {
    inicio: "<div>…</div>",
    lista: "<div>…</div>"
  }
}
```

O CORE renderiza apenas o que a célula anuncia, sem interpretar sua lógica.

---

## Segurança e Isolamento

Todos os domínios e células devem seguir rigorosamente:

* **AGENT.md**
* **ARCHITECTURE.md**
* **SECURITY.md**

Princípios obrigatórios:

* isolamento absoluto por pasta
* caminhos sempre relativos
* uso obrigatório de ES Modules
* datasets sempre locais
* sem variáveis globais
* sem requisições externas não autorizadas

---

## Evolução e Versionamento

Cada célula deve manter versionamento semântico (`semver`). Mudanças devem preservar a integridade do domínio e do organismo.

Alterações maiores devem ser registradas no README do domínio correspondente.

---

## Propósito Final

A pasta **celulas/** é o mapa vivo do organismo. É aqui que novos domínios nascem, evoluem e se conectam ao CORE para formar a experiência completa do PWAO.

Este documento deve ser mantido sempre atualizado como referência oficial do nível celular.
