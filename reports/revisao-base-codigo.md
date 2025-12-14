# Revisão da base de código – Pendências sugeridas

Durante a leitura da base de código foram identificados pontos que merecem ajustes. Cada item abaixo já está formatado como tarefa sugerida, com contexto e localização para facilitar a execução.

## 1) Corrigir erro de digitação
- **Problema**: o rodapé do `AppShell` mostra “Opp 5Horas – PWAO”, mas a sigla correta do pacote é **OPP**.
- **Tarefa sugerida**: atualizar o texto do rodapé para “OPP 5Horas – PWAO” (ou outro texto aprovado) para eliminar o typo na sigla.
- **Onde olhar**: `src/core/layout/AppShell.js`, rodapé renderizado dentro do template HTML do shell.【F:src/core/layout/AppShell.js†L24-L26】

## 2) Corrigir bug funcional
- **Problema**: quando o navegador não suporta `serviceWorker`, a função `registrarServiceWorkerOPP()` apenas define `installMessage`, mas não re-renderiza a tela de boas-vindas. Usuários em navegadores sem suporte continuam vendo a dica padrão “Se o aviso não aparecer…”, em vez do aviso correto de que a instalação não é suportada.
- **Tarefa sugerida**: após definir `installMessage` no ramo sem `serviceWorker`, acionar `renderWelcomeIfActive()` (ou lógica equivalente) para atualizar a mensagem exibida na tela inicial.
- **Onde olhar**: `index.html`, bloco `registrarServiceWorkerOPP`, ramificação `if (!('serviceWorker' in navigator))`.【F:index.html†L361-L365】

## 3) Ajustar comentário/documentação
- **Problema**: o README referencia arquivos `CONTRIBUTING.md`, `STYLEGUIDE.md` e `ROADMAP.md`, mas eles não existem na raiz do repositório atual. Isso gera dead links para quem tenta seguir as instruções de contribuição.
- **Tarefa sugerida**: alinhar a documentação criando os arquivos mencionados ou atualizando o README para apontar para os documentos corretos disponíveis (por exemplo, CREDITS ou SECURITY).
- **Onde olhar**: seção “Como Contribuir” e “Roadmap” do README.【F:README.md†L190-L205】

## 4) Melhorar cobertura de testes
- **Problema**: a suíte Playwright valida o botão “Instalar app” quando o prompt existe (Android) e quando não existe (iOS), mas não cobre o cenário em que o navegador não suporta `serviceWorker`. Nesse caso, a mensagem deveria informar a falta de suporte, e o teste atual não garante que a UI reaja corretamente.
- **Tarefa sugerida**: adicionar um teste simulando um user agent sem `serviceWorker` (ou desabilitando-o via `context.addInitScript`) para verificar se a mensagem de indisponibilidade aparece e o botão não tenta abrir o prompt.
- **Onde olhar**: `tests/install-button.spec.js`, adicionar um terceiro caso dentro do `describe` para o fluxo sem suporte a service worker.【F:tests/install-button.spec.js†L12-L60】
