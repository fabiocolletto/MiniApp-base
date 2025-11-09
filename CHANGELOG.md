# Changelog

## [Unreleased]
### Adicionado
- Documento `AGENTE.md` com diretrizes para manutenção do projeto.
- `README.md` descrevendo a estrutura do repositório e o fluxo de trabalho recomendado.
- Motor do painel Prefeito agora lê agregados do IndexedDB (persona, KPIs e indicadores) com atualização assíncrona.
- Miniapp Prefeito inclui conjunto de dados de demonstração carregado no IndexedDB para exibir indicadores imediatamente.
- Indicadores exibem resumos dinâmicos e estados de carregamento/erro integrados à sincronização multi-dispositivo.
- Cartões do catálogo para o Importador de Pesquisas, incluindo novo ícone dedicado e link para o protótipo.
- Importador de Pesquisas reposicionado para o miniapp dedicado `miniapp-importador/`, preservando o CSS central e movendo estilos complementares para `style/importador-pesquisas.css`.

### Corrigido
- Backdrop do modal agora cobre toda a viewport e mantém o conteúdo centralizado, mesmo com padding responsivo.
- Comportamento de rolagem das folhas (`.sheet`) aprimorado para preservar cabeçalhos fixos enquanto o corpo desliza.
- Modal de tema respeita a seleção do usuário e o modo do sistema, salvando a preferência e fechando automaticamente após a troca.
- Controles laterais dos carrosseis de KPI e persona passam a sobrepor os cartões, eliminando grandes lacunas e ocultando barras de rolagem.
- Toolbar do painel em telas pequenas vira menu sanduíche sobreposto com botão de fechar e traduções para todos os idiomas suportados.
- Token `--container` do layout base agora utiliza `clamp` responsivo para liberar 100% da largura disponível em telas estreitas.
- Miniapp Prefeito em telas pequenas reposiciona o botão de menu no cabeçalho, move o selo de versão para o subtítulo e garante carrosséis em largura total com controles ocultos quando não há rolagem.
