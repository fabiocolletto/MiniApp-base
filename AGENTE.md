# Guia do Agente

- Leia este arquivo, bem como o `README.md` e o `CHANGELOG.md`, sempre antes de iniciar qualquer atividade.
- Prefira ajustes incrementais com commits limpos e mensagens descritivas.
- Para estilos, mantenha comentários existentes e utilize unidades responsivas (`clamp`, `vh`, `vw`) sempre que for possível sem quebrar o layout.
- Ao concluir uma tarefa, atualize este guia se novas regras forem necessárias e mantenha o README/CHANGELOG sincronizados com as alterações relevantes.
- O shell em `index.html` deve permanecer como ponto único de navegação: sempre que incluir ou alterar miniapps, valide se o catálogo (`miniapp-catalogo/index.html`) mantém links com `target="miniapp-panel"` e se as mensagens `postMessage` seguem o padrão documentado no README.
- Sempre que um miniapp for carregado pelo shell, garanta que ele envie `{ action: 'miniapp-header', title: '...', subtitle: '...', icon: '<ícone Material>', iconTheme: '<tema>' }` via `window.parent.postMessage` para manter o cabeçalho e o ícone sincronizados.
- Sempre que adicionar ou modificar textos no miniapp, revise o sistema de i18n e garanta que todas as línguas suportadas (pt-BR, es-ES, en-US) tenham traduções completas e consistentes antes de finalizar o trabalho.
- Toda pasta deve conter um arquivo "README.md" descrecendo a razão, funcão, detalhes de manutenção do arquivo e pasata, limites e outras informações pertintens do conteudo da pasta.
