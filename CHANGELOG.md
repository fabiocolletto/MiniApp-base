# Changelog

## [Unreleased]
### Adicionado
- Documento `AGENTE.md` com diretrizes para manutenção do projeto.
- `README.md` descrevendo a estrutura do repositório e o fluxo de trabalho recomendado.
- Motor do painel Prefeito agora lê agregados do IndexedDB (persona, KPIs e indicadores) com atualização assíncrona.
- Indicadores exibem resumos dinâmicos e estados de carregamento/erro integrados à sincronização multi-dispositivo.

### Corrigido
- Backdrop do modal agora cobre toda a viewport e mantém o conteúdo centralizado, mesmo com padding responsivo.
- Comportamento de rolagem das folhas (`.sheet`) aprimorado para preservar cabeçalhos fixos enquanto o corpo desliza.
- Modal de tema respeita a seleção do usuário e o modo do sistema, salvando a preferência e fechando automaticamente após a troca.
