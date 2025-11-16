# Pasta `templates/miniapps-inbox/`

Esta pasta recebe arquivos HTML temporários criados pelo usuário como modelo de novo MiniApp.

Fluxo esperado (resumido):

1. O usuário cria um arquivo HTML de exemplo e salva aqui, por exemplo:
   - `miniapp-minha-ideia-template.html`
2. O Codex lê o template, interpreta a intenção (layout, elementos principais) e cria:
   - uma pasta definitiva para o MiniApp em `apps/<slug>/`;
   - a entrada correspondente em `docs/miniapp-data.js`.
3. Após conversão bem-sucedida e commit, o template pode ser:
   - removido desta pasta; ou
   - movido para `templates/miniapps-archive/` se quisermos manter histórico.

Os templates **não devem ser usados em produção**. São apenas instruções temporárias para o Codex.
