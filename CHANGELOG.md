# Changelog

## [Unreleased]
### Adicionado
- Barra de favoritos no catálogo permitindo marcar miniapps com estrela, persistir a seleção e apresentá-los em carrossel dedicado.
- Rodapé do shell fixo com indicação de versão e controle de tela cheia disponível em telas amplas.
- Shell PWA em `index.html` incorporando o catálogo padrão e concentrando a navegação dos miniapps pelo iframe `#miniapp-panel`.
- Fluxo de navegação via `window.loadMiniApp` e `postMessage` permitindo que os miniapps abram o catálogo ou troquem entre si sem recarregar o shell.
- Botão único no rodapé do shell que abre uma janela com os atalhos de catálogo e tela cheia, localizado para `pt-BR`, `en-US` e `es-ES`.
- Controle de idioma persistente no menu do shell com rádios acessíveis, sincronização automática do iframe via `postMessage({ action: 'set-locale' })` e suporte a `postMessage({ action: 'request-locale' })`.
- Documento `AGENTE.md` com diretrizes para manutenção do projeto.
- `README.md` descrevendo a estrutura do repositório e o fluxo de trabalho recomendado.
- Motor do painel Prefeito agora lê agregados do IndexedDB (persona, KPIs e indicadores) com atualização assíncrona.
- Miniapp Prefeito inclui conjunto de dados de demonstração carregado no IndexedDB para exibir indicadores imediatamente.
- Indicadores exibem resumos dinâmicos e estados de carregamento/erro integrados à sincronização multi-dispositivo.
- Cartões do catálogo para o Importador de Pesquisas, incluindo novo ícone dedicado e link para o protótipo.
- Cartão do catálogo para o Gerador de Roteiros TTS com ícone dedicado e metadados para o shell.
- Miniapp de Cadastro de Usuários com validações, seções de dados pessoais e profissionais e suporte completo a `pt-BR`, `en-US` e `es-ES`.
- Miniapp de Cadastro passa a persistir os dados localmente após envios válidos e exibe retorno visual indicando sucesso ou falha na atualização.
- Atalho dedicado no menu do shell para abrir o cadastro diretamente do rodapé.
- Importador de Pesquisas reposicionado para o miniapp dedicado `miniapp-importador/`, preservando o CSS central e movendo estilos complementares para `style/importador-pesquisas.css`.
- Miniapp TTS com formulário guiado, geração automática de roteiro e traduções completas para `pt-BR`, `en-US` e `es-ES`.
- Miniapp TTS inclui prévia de áudio com controles de velocidade, volume e pausa, aplicando as configurações ao download.
- Shell passa a registrar metadados de título e subtítulo enviados pelos miniapps via `postMessage` (`action: "miniapp-header"`) para atualizar o cabeçalho principal.
- Guia `docs/README.md` documentando os requisitos de implantação de novos miniapps e os metadados obrigatórios de ícone.
- `miniapp-catalogo/README.md` descrevendo as regras para manter cartões e atributos sincronizados com o shell.

### Alterado
- Miniapp de Importação passa a solicitar o idioma ao shell quando necessário, aplicar a seleção recebida via `postMessage({ action: 'set-locale' })` e reenviar o cabeçalho localizado sempre que o idioma mudar.
- Miniapp de Cadastro passa a receber o idioma exclusivamente do shell, removendo o seletor interno e sincronizando via mensagens `postMessage`.
- Miniapp TTS passa a receber o idioma exclusivamente do shell, removendo o seletor interno, regenerando roteiros automáticos quando aplicável e reenviando o cabeçalho após `postMessage({ action: 'set-locale' })`.
- Layout em tela cheia mantém cabeçalho e rodapé visíveis, expandindo apenas o painel ativo do miniapp.
- Miniapp de Cadastro simplificado para um único formulário em card branco alinhado ao shell base, com feedback direto e sem resumo pós-envio.
- Botão de tela cheia e identidade do Shell passam a utilizar os ícones circulares do catálogo baseados na biblioteca Material.
- Cartões do catálogo ocupam toda a largura útil do painel com espaçamento interno próprio, deixam de exibir botão secundário e tornam-se completamente clicáveis.
- Shell concentra os controles de catálogo e tela cheia no menu do rodapé, removendo botões espalhados pelo painel principal e delegando a navegação aos cartões e integrações via `postMessage`.
- Controle de tela cheia passa a utilizar a API nativa do navegador (`requestFullscreen`), sincronizando o estado do layout com entradas de teclado como `Esc`.
- Controle de tela cheia agora aplica fallback em CSS quando a API nativa não está disponível, garantindo o mesmo layout e rotulagem do botão em qualquer dispositivo.
- Rodapé passa a exibir o ícone oficial da 5 Horas ao lado do selo “5 horas de pesquisa e análise limitada”, mantendo a versão do shell.
- Rodapé do shell passa a alinhar o conteúdo à esquerda para harmonizar com o cabeçalho dinâmico.
- Menu do rodapé passa a abrir uma janela sobreposta única que reúne catálogo, tela cheia e a seção “Sobre o app”, mantendo o botão de acesso idêntico em todas as larguras.
- Cabeçalho do shell passa a exibir o ícone do miniapp ativo com suporte aos campos `icon` e `iconTheme`, enquanto o catálogo fornece os novos metadados e classes de tema compartilhadas.
- Botões de retorno ao catálogo nos miniapps passam a mostrar apenas o ícone `apps` e o rótulo localizado “Catálogo”, garantindo consistência visual e acessibilidade entre experiências.
- Guia de implantação em `docs/README.md` deixa de exigir um botão próprio nos miniapps, pois o retorno ao catálogo é fornecido pelo shell fixo no rodapé.

### Corrigido
- Backdrop do modal agora cobre toda a viewport e mantém o conteúdo centralizado, mesmo com padding responsivo.
- Comportamento de rolagem das folhas (`.sheet`) aprimorado para preservar cabeçalhos fixos enquanto o corpo desliza.
- Modal de tema respeita a seleção do usuário e o modo do sistema, salvando a preferência e fechando automaticamente após a troca.
- Controles laterais dos carrosseis de KPI e persona passam a sobrepor os cartões, eliminando grandes lacunas e ocultando barras de rolagem.
- Toolbar do painel em telas pequenas vira menu sanduíche sobreposto com botão de fechar e traduções para todos os idiomas suportados.
- Token `--container` do layout base agora utiliza `clamp` responsivo para liberar 100% da largura disponível em telas estreitas.
- Miniapp Prefeito em telas pequenas reposiciona o botão de menu no cabeçalho, move o selo de versão para o subtítulo e garante carrosséis em largura total com controles ocultos quando não há rolagem.
- Botão de menu do rodapé em telas estreitas volta a abrir os atalhos móveis, removendo o bloqueio causado pelo atributo `hidden` persistente.
