Perfeito, Fabio.
Aqui está **o documento completo e finalizado do novo `AGENTE.md`** — já revisado, consolidado e incorporando:

✔ Estrutura de templates
✔ Estrutura do design system
✔ Política mobile-first
✔ Padrão de headers/footers globais
✔ Padrão de cards
✔ Playbook completo para processamento de templates
✔ Governança de documentação
✔ Regras absolutas para Codex
✔ Escalabilidade para o futuro (Mini-App Store)
✔ Sem partes pendentes, sem placeholders, pronto para copiar e colar no repositório

O documento está **inteiro** e **autocontido**, escrito para ser lido e executado pelo Codex, com zero ambiguidade.

---

# 📄 **AGENTE.md – MiniApp 5Horas (PWA de MiniApps)**

**VERSÃO COMPLETA E DEFINITIVA – Pronto para o repositório**

---

# AGENTE – MiniApp 5Horas (PWA de MiniApps)

> **Este documento é lido e executado pelo Codex. Todas as regras abaixo são instrutivas, obrigatórias e determinísticas.**
> **Se qualquer instrução for ambígua, o Codex deve interromper a ação e solicitar esclarecimento antes de continuar.**

---

# 1. Propósito

O repositório **MiniApp 5Horas** é mantido exclusivamente sob normas controladas por este documento.
O objetivo deste agente é:

* garantir **consistência visual**,
* assegurar **estabilidade da PWA**,
* manter **qualidade técnica do ecossistema**,
* e permitir **escala infinita** de MiniApps com previsibilidade.

O Codex **não deve interpretar intenções**, antecipar funcionalidades ou criar estruturas fora das regras aqui definidas.

---

# 2. Arquitetura Oficial do Projeto

O MiniApp 5Horas é uma **PWA estática**, baseada em HTML + CSS + ES Modules + IndexedDB.

## 2.1 Shell principal (`index.html`)

* Shell 3.0 (RodaPack) opera **sem header** para maximizar área útil.
* O rodapé controla o stage principal (catálogo + placeholders dos MiniApps).
* Renderiza MiniApps a partir de `miniapp-data.js` e exibe placeholders compactos até cada MiniApp ser homologado.
* Gerencia busca, tema, card modal e sincronização visual.

O Codex **não deve reintroduzir header no shell** nem alterar a navegação por rodapé sem ordem explícita.

## 2.2 Dados e componentes

* `docs/miniapp-data.js` → lista oficial de MiniApps.
* `js/miniapp-data-loader.js` → módulo que carrega `miniapp-data.js` com fallback remoto (GitHub Raw configurável) e cache local automático para ambientes sem o arquivo físico.
* `docs/miniapp-card.js` → renderização de cards e modais.
* `docs/miniapp-card.css` + `docs/miniapp-global.css` → estilos globais.
* `docs/components/app-shared-footer.js` → componente oficial do rodapé que controla o stage.
* `docs/components/app-shared-header.js` → componente de header **legado** para MiniApps que ainda precisam de barra superior; o shell não o utiliza.

## 2.3 Persistência e sincronização

* `js/indexeddb-store.js` → preferências, carrinho, fila local.
* `js/googleSync.js` → login Google, fila offline, sync remoto.

## 2.4 PWA

* `manifest.webmanifest`
* `service-worker.js`

## 2.5 Pastas auxiliares (Templates + Design System)

### Templates

* `templates/miniapps-inbox/`
  Templates HTML temporários criados pelo usuário.
  **Nunca** usados em produção.
  São instruções para geração automática de novos MiniApps.

* `templates/miniapps-archive/`
  (Opcional) Armazena templates já processados.

### Design System

* `docs/design-system/`
  Estrutura reservada para componentes visuais globais:
  botões, tabelas, listas, cards, tokens e demais padrões.

---

# 3. Regras Absolutas do Codex

## 3.1 O Codex **NÃO DEVE**

* adicionar frameworks, tooling ou bibliotecas externas;
* modificar `index.html` estruturalmente;
* alterar assinaturas de funções;
* criar lógica paralela de sync ou persistência;
* criar novos estilos ad-hoc fora do design system;
* criar headers, footers ou cards personalizados que não sigam o padrão;
* reativar header no shell 3.0 ou alterar o estado padrão compacto do rodapé;
* renomear MiniApps sem ordem explícita;
* remover arquivos essenciais;
* mexer no service worker sem autorização explícita.

## 3.2 O Codex **DEVE**

* manter o projeto estritamente estático;
* preservar experiências mobile-first;
* garantir consistência visual;
* validar caminhos e imports;
* realizar testes antes de commits;
* seguir rigorosamente os playbooks deste documento.

---

# 4. Estrutura Canônica de MiniApp

Todo MiniApp deve seguir **exatamente** este formato:

```js
{
  id: 'id-em-kebab-case',
  title: 'Nome do MiniApp',
  description: 'Descrição curta.',
  category: 'Categoria',
  price: 'Preço exibido ao usuário',
  image: './assets/nome.png',
  url: './apps/<slug>/index.html',
  active: true
}
```

## 4.1 Regras obrigatórias

* `id` deve ser único, minúsculo e em kebab-case.
* `image` deve existir.
* `url` deve apontar para um arquivo real.
* `active: false` esconde o MiniApp da grid.
* O Codex **não cria MiniApp sem imagem e sem URL real**.

---

# 5. Design System e Consistência Visual

Esta seção define os elementos visuais que **toda a plataforma deve compartilhar**.

## 5.1 Footer global e header legado

* O **rodapé** é o controle principal do stage e deve permanecer padrão (estado inicial compacto, variações apenas via atributo `state`).
* O shell 3.0 **não** possui header. MiniApps podem usar `app-shared-header` apenas quando precisarem de barra superior interna, sem alterar o rodapé global.
* Barras secundárias são permitidas **dentro** de MiniApps, mas não substituem o footer.

## 5.2 Card padrão

O card existente em `docs/miniapp-card.js` é **o modelo oficial**.
O Codex deve:

* sempre reutilizar esse padrão;
* nunca criar novos estilos de card fora do design system.

## 5.3 Botões, tabelas, indicadores

Até que o design system esteja completo:

* usar **somente** classes já existentes;
* não criar variações novas;
* não definir botões com cores fixas fora dos tokens.

---

# 6. Política de Dispositivos (Mobile-first)

A plataforma está operando oficialmente na **Fase 1: Mobile-first**.

## Regras para o Codex:

* Não criar CSS ou layouts específicos para tablet, desktop ou TV.
* Não alterar grids para múltiplas colunas.
* Não adicionar detectores de plataforma sem ordem explícita.

Fases futuras (tablet, desktop, painéis) serão ativadas quando promovidas a diretrizes oficiais.

---

# 7. Persistência e Sincronização

O Codex deve usar exclusivamente:

### IndexedDB (via `indexeddb-store.js`)

* tema, busca, fila local, preferências.
* nunca armazenar senhas ou tokens sensíveis.

### Google Sync (via `googleSync.js`)

* login Google, fila offline, sync remoto.

Nunca criar outras formas de persistência.

---

# 8. Testes Obrigatórios Antes de Commit

1. Subir servidor estático local.
2. Abrir `index.html`.
3. Verificar:

   * grid renderiza corretamente;
   * busca funciona;
   * modal abre;
   * botão “Adicionar ao Carrinho” funciona;
   * troca de tema ok;
   * console sem erros;
   * service worker registra.

Se qualquer erro ocorrer, o commit é proibido.

---

# 9. Playbooks para Tarefas Repetitivas

## 9.1 Instalar novo MiniApp

1. Criar/confirmar pasta em `apps/<slug>/`.
2. Criar arquivo `index.html` válido.
3. Adicionar entrada ao `miniapp-data.js`.
4. Garantir imagem existente.
5. Testar tudo.
6. Commit.

## 9.2 Atualizar MiniApp

Mesma estrutura do Playbook original: preservar campos, validar URL e testar.

## 9.3 Desativar MiniApp

Adicionar `active: false` e validar.

## 9.4 Playbook de QA e Homologação

1. Consulte os planos oficiais em `docs/qa/` antes de qualquer alteração. Termos de aceitação e passos validados estão descritos nos arquivos `gestao-conta-auto-save.md` (gestão de conta) e `gestao-catalogo-auto-save.md` (gestão de catálogo).
2. Prepare o ambiente apenas na primeira execução (ou após reinstalação): `npm install`, `npx playwright install-deps chromium`, `npx playwright install chromium`.
3. Execute a suíte apropriada: `npm run qa:gestao-conta`, `npm run qa:gestao-catalogo` ou `npm test` para todas as suítes. Os scripts já iniciam o servidor estático local.
4. Registre a saída completa do comando no PR/commit como evidência dos termos de aceitação. Se algum cenário falhar, corrija o fluxo, repita o teste e só finalize após todos os termos serem aprovados.

---

# 10. Playbook de Templates de MiniApps (NOVO)

Este fluxo deve ser seguido quando o usuário enviar um template para:

`templates/miniapps-inbox/`

## Procedimento:

1. Localizar HTML na pasta `templates/miniapps-inbox/`.

2. Criar **slug** baseado no nome do arquivo.

3. Criar pasta oficial do MiniApp:
   `apps/<slug>/index.html`

4. Converter o template para a estrutura da plataforma:

   * aplicar footer padrão;
   * usar `app-shared-header` **apenas** se o MiniApp exigir barra superior interna;
   * aplicar design mobile-first;
   * incluir classes do design system quando existirem.

5. Registrar MiniApp em `docs/miniapp-data.js`.

6. Testar localmente no catálogo.

7. Após sucesso:

   * remover template da inbox;
   * ou mover para `templates/miniapps-archive/`.

8. Commit com descrição clara e referência a este playbook.

O Codex **NÃO** deve:

* tentar interpretar lógica do template;
* criar funcionalidades extras;
* alterar layout da plataforma.

---

# 11. Governança de Diretrizes e Documentação

Sempre que uma diretriz alterar arquitetura ou comportamento, o Codex deve atualizar:

* este `AGENTE.md`,
* o `README.md`,
* o `CHANGELOG.md`.

O Codex nunca implementa mudança estrutural sem atualizar a documentação.

---

# 12. Segurança

O Codex nunca deve:

* armazenar senhas em IndexedDB;
* incluir tokens ou chaves no front-end;
* enviar credenciais pelo sync;
* logar informações sensíveis.

---

# 13. Encerramento

Este documento é a autoridade máxima sobre:

* comportamento do Codex
* padrões visuais
* arquitetura da plataforma
* criação e manutenção de MiniApps

Qualquer ação fora destas regras é proibida.

Quando houver dúvida, o Codex deve solicitar instrução explícita.

---

# ✔ Documento finalizado

Pronto para ser colado diretamente como `AGENTE.md` no repositório.
Se quiser, posso gerar também:

* `VISION.md` (opcional)
* `CHANGELOG.md` inicial
* Estrutura inicial do design system (tokens + botão padrão)
* Templates base para miniapps (HTML vazio porém padronizado)

Só pedir.
