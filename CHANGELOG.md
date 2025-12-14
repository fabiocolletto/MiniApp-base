# CHANGELOG.md – Histórico de Versões do PWAO

Este documento registra todas as mudanças estruturais, evolutivas e funcionais do **PWAO (Progressive Web App Orgânico)**.
O objetivo é garantir rastreabilidade completa do organismo ao longo do tempo.

---

# 📌 Formato Oficial
Este projeto segue o padrão semântico adaptado para organismos:

- **Added** – novos órgãos, células ou capacidades
- **Changed** – mutações do Genoma ou melhorias internas
- **Fixed** – correções
- **Removed** – remoções estruturais
- **Security** – alterações de segurança

Cada versão do Genoma possui identificação **Vx.y**, enquanto células usam **semver (1.0.0)**.

# 🧬 [V4.4.12] – Tabela editável no cadastro do usuário
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Seção em tabela na tela de cadastro exibindo campos geridos pela tela, preenchida com dados existentes e permitindo edição direta.

----

# 🧬 [V4.4.11] – Cadastro do usuário via ScreenFactory
### **Status: Atual (Genoma V4.4.0)**

#### Changed
- Tela de Perfil do Usuário migrada para o sistema de geração (`data.user.profile`), renderizando no stage com título atualizado no header.
- Ícone do usuário e atalho em Configurações agora navegam para a tela gerada, dispensando o registro da célula dedicada.

----

# 🧬 [V4.4.10] – Renderer montando AppShell visual
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Renderer dedicado (`src/core/renderer.js`) que monta o AppShell e exibe erros de forma consistente ao trocar o conteúdo do palco.

#### Changed
- AppShell remodelado para usar a moldura padrão do Genoma (header, stage e footer) com menu lateral estilizado.
- Genoma passa a montar o AppShell via Renderer antes de renderizar telas ou células, reaproveitando os estilos base e mantendo o título e o palco estáveis.

----

# 🧬 [V4.4.9] – Remoção do fluxo de instalação do OPP
### **Status: Atual (Genoma V4.4.0)**

#### Removed
- Botão "Instalar app" e mensagens associadas na tela inicial, eliminando instruções de instalação do pacote.
- Registro automático do service worker e prompts de instalação do OPP, mantendo o Genoma livre de chamadas de instalação.

----

# 🧬 [V4.4.8] – Documentação alinhada e cobertura de instalação sem SW
### **Status: Atual (Genoma V4.4.0)**

#### Changed
- README atualizado para apontar apenas para documentos existentes (AGENT, ARCHITECTURE, SECURITY e CREDITS), evitando links quebrados de contribuição e roadmap.

#### Added
- Caso de teste Playwright que simula navegadores sem suporte a `serviceWorker`, garantindo mensagem de indisponibilidade e ausência de chamadas ao prompt de instalação.

----

# 🧬 [V4.4.7] – Aviso de instalação para navegadores sem service worker
### **Status: Atual (Genoma V4.4.0)**

#### Fixed
- Re-renderização da tela inicial ao detectar falta de suporte a `serviceWorker`, exibindo o aviso correto de indisponibilidade de instalação.

----

# 🧬 [V4.4.6] – Correção do rodapé do AppShell
### **Status: Atual (Genoma V4.4.0)**

#### Fixed
- Rodapé do AppShell atualizado para exibir a sigla correta do pacote instalável, alterando "Opp" para **OPP**.

----

# 🧬 [V4.4.5] – Levantamento de pendências de revisão
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Documento `reports/revisao-base-codigo.md` listando tarefas sugeridas para corrigir typo de interface, bug de mensagem de instalação, acertos de documentação e melhoria de cobertura de testes.

----

# 🧬 [V4.4.4] – Testes do botão de instalação do OPP
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Suite Playwright que simula Android/Chromium e iOS/Safari para validar o botão “Instalar app”, cobrindo tanto o fluxo com `beforeinstallprompt` quanto as instruções manuais.
- Script `npm test` com servidor local automático para servir o Genoma, manifest e service worker durante a bateria de testes.

----

# 🧬 [V4.4.3] – Guia de UX para instalação do OPP
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Guia rápido no README para orientar quando solicitar o prompt nativo, quais instruções oferecer por plataforma e como validar que o OPP está pronto antes de pedir a instalação.

---

# 🧬 [V4.4.2] – OPP instalável e offline no Android
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Manifesto dedicado em `/opp/manifest.webmanifest` com ícones e configuração standalone para habilitar instalação direta.
- Registro automático do service worker do OPP ao carregar o Genoma, preparando o cache offline-first.

#### Fixed
- Botão "Instalar app" volta a abrir o prompt nativo no Android em vez de exibir apenas a mensagem de instruções manuais.

---

# 🧬 [V4.4.1] – Botão de instalação do OPP no Genoma
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Botão dedicado na tela inicial para disparar a instalação do pacote OPP (PWA) e instruções guiadas quando o prompt nativo não estiver disponível.

---

# 🧬 [V4.4.0] – Genoma reescrito para modelo App Família
### **Status: Atual (Genoma V4.4.0)**

#### Added
- Novo Genoma converte o HTML completo do App Família em célula `sistema.appfamily`, com autodiscovery orgânico e stage baseado em iframe para preservar CSS/JS originais.
- Memória Orgânica simplificada ativa autodiscovery e atualiza contadores em tempo real sempre que um manifesto é registrado.

#### Changed
- Interface do Genoma redesenhada com status claros do Narrador, memória e OPP, destacando a célula modelo disponível para expressão.

---

# 🧬 [V4.3.12] – Stage híbrido para células JS
### **Status: Atual (Genoma V4.3.3)**

#### Added
- Renderer agora identifica caminhos `.js`, reescreve imports para CDNs (React, ReactDOM, Dexie e Lucide) e ativa automaticamente células JavaScript sem exigir HTML auxiliar.
- Suporte nativo a componentes React exportados por padrão ou renderizadores customizados (`render(root)`) diretamente no stage orgânico.

---

# 🧬 [V4.3.11] – Stage unificado para células
### **Status: Atual (Genoma V4.3.3)**

#### Changed
- Stage do AppShell agora usa altura orgânica, fundo contínuo e alinhamento flex para que header, stage e footer formem um único elemento visual.
- Célula `governo.produtos.recibo-diarias.organico` ajustada para ocupar todo o espaço central com layout flexível e responsivo.

---

# 🧬 [V4.3.10] – Recibo orgânico de diárias
### **Status: Atual (Genoma V4.3.3)**

#### Added
- Nova célula `governo.produtos.recibo-diarias.organico` com manifesto próprio e fluxo simplificado de diárias no padrão PWAO.
- Cartão dedicado na aba Governo do App Família para abrir o recibo orgânico direto do stage do Genoma.

---

# 🧬 [V4.3.9] – Produto de Recibo na Linha Governo
### **Status: Atual (Genoma V4.3.3)**

#### Added
- Link dedicado ao produto de recibo de diárias na aba Governo da célula `sistema.page.family`, acionando o stage do Genoma para renderizar o modelo `celulas/governo/produtos/recibo-diarias.html`.

---

# 🧬 [V4.3.8] – Navegação Governo no App Família
### **Status: Atual (Genoma V4.3.3)**

#### Added
- Botão "Governo" no rodapé da célula `sistema.admin` para acessar produtos públicos direcionados a servidores e órgãos governamentais, incluindo tela dedicada com placeholder da linha Governo.

---

# 🧬 [V4.3.7] – Rolagem isolada do App Family
### **Status: Atual (Genoma V4.3.3)**

#### Fixed
- Área central da célula `sistema.admin` agora respeita automaticamente o espaço entre header e footer, ativando rolagem própria quando o conteúdo excede a altura disponível.
- Alturas e espaçamentos do App Family foram simplificados com variáveis, evitando ajustes manuais de preenchimento.

---

# 🧬 [V4.3.6] – Renderização em tela cheia do App Family
### **Status: Atual (Genoma V4.3.3)**

#### Fixed
- O Genoma agora injeta estilos declarados no `<head>` das células antes de renderizá-las, mantendo layout e tipografia originais do App Family.
- Área de expressão `#root` passa a ocupar toda a altura da viewport e sem recuo padrão, permitindo que o App Family use toda a largura e altura previstas.

---

# 🧬 [V4.3.5] – Correção do app Family
### **Status: Atual (Genoma V4.3.3)**

#### Fixed
- Botão "Abrir app family" do Genoma agora emite o identificador `sistema.page.family`, alinhado ao manifesto registrado.
- Confirmada a ausência de referências ao identificador incorreto `sistema.pages.family`.

---

# 🧬 [V4.3.4] – Manutenção da célula Admin
### **Status: Em evolução (Genoma V4.3.3)**

#### Fixed
- Manifesto da célula `sistema.admin` agora registra automaticamente e define renderização inicial para autodiscovery imediato.
- Persistência do painel Admin aguarda a abertura do IndexedDB e trata falhas, evitando erros ao carregar ou salvar dados locais.

---

# 🧬 [V4.3.3] – Execução orgânica de células carregadas
### **Status: Atual (Genoma V4.3.3)**

#### Fixed
- Renderer passa a reexecutar scripts das células carregadas, garantindo que botões da tela inicial ativem corretamente os órgãos e manifestos.

---

# 🧬 [V4.3.2] – Sementes nativas e célula Admin
### **Status: Atual (Genoma V4.3.2)**

#### Added
- Registro automático das células nativas (quiz, auth, admin) ao iniciar o Genoma.
- Manifesto celular para `sistema.admin` com interface mínima para o painel.
- Manifesto celular para `sistema.auth` garantindo autodiscovery orgânico.

#### Fixed
- Botão "Abrir Admin" agora encontra a célula `sistema.admin` imediatamente.

---

# 🧬 [V4.3.1] – Atualização do OPP e Manifesto
### **Status: Atual (Genoma V4.3.1)**

#### Added
- Novo `manifest.webmanifest` para o OPP 5Horas.
- Inclusão dos campos modernos (`id`, `categories`, `lang`, `dir`).
- Ícones atualizados: raio laranja com fundo transparente.

#### Changed
- `start_url` e `scope` ajustados para repositórios GitHub Pages.
- Nome oficial consolidado como **5Horas**.
- `theme_color` atualizado para o laranja da marca (#FF7A00).

#### Fixed
- Caminhos relativos incorretos que impediam a instalação do PWA.

#### Security
- Manifesto validado segundo diretrizes do OPP.

---

# 🧬 [V4.2] – Autodiscovery, OPP e Melhorias do Genoma

#### Added
- Registro automático do Service Worker do OPP.
- Suporte completo ao pacote OPP (manifest + SW).
- Melhorias no autodiscovery de células.
- Mensagens aprimoradas de erro e feedback.

#### Changed
- Caminho do service worker alterado para `/opp/service-worker.js`.
- Validação de ambiente seguro antes do registro do SW.
- Tratamento aprimorado para células inexistentes.

#### Security
- Bloqueio de registro de SW fora de HTTPS/localhost.
- Prevenção contra fetch de células remotas.

---

# 🧬 [V4.1] – Autodiscovery Inicial
#### Added
- Introdução do **autodiscovery**.
- Memória Orgânica salva manifestos de células.
- Loader capaz de reconstruir mapa de células instaladas.
- Renderer simplificado com fallback.

#### Changed
- Narrador otimizado para múltiplos listeners.

---

# 🧬 [V4.0] – Nascimento do PWAO
#### Added
- Estrutura inicial do organismo: Genoma + Células + Órgãos.
- Introdução da filosofia orgânica.
- Loader básico para carregar células.
- Renderer fundamental.
- Sistema mínimo de eventos (Narrador).
- Estrutura de diretórios: `/celulas`, `/opp`.

---

# 🧬 [V3.x] – Arquitetura Experimental
Antes da consolidação do conceito orgânico, existiram versões experimentais de layout, miniapps e padrões híbridos.  
Não são compatíveis com o PWAO.

---

# 🧬 [V2.x] – Protótipo de Miniapps
- Implementação inicial de microfrontends.
- Primeira tentativa de isolamento.
- Bases conceituais para células.

---

# 🧬 [V1.x] – Fundação
- Primeiros experimentos com load dinâmico.
- Estruturação manual de telas.
- Origem da ideia do organismo digital.

---

# 🌿 Versão
CHANGELOG v1.0 – Registro inicial do histórico do PWAO
