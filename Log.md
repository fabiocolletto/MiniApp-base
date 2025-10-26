# Log

## v0.1.268 - 2025-10-26 16:39 BRT
- Limita a prévia do modelo impresso à versão do aluno, removendo a descrição e os controles de alternância do widget.

## v0.1.267 - 2025-10-26 16:27 BRT
- Simplifica o widget de visualização do painel de provas removendo o cabeçalho e mantendo apenas o visualizador dedicado.

## v0.1.266 - 2025-10-26 16:11 BRT
- Ajusta a inicialização do catálogo do painel MiniApps para repor automaticamente o Gestor de tarefas e o Criador de provas quando o armazenamento local não os inclui.
- Acrescenta testes garantindo que snapshots persistidos personalizados preservem seus itens enquanto recebem os miniapps padrão necessários.
- Atualiza a referência de versão do sistema para refletir a nova release.

## v0.1.265 - 2025-10-26 15:50 BRT
- Reposiciona o botão de provas e o feedback associado no cabeçalho, deixando o widget Visualização da prova apenas com título e prévia.
- Move a mensagem de status do widget para fora do cartão, mantendo somente o conteúdo da prova na área principal de visualização.

## v0.1.264 - 2025-10-26 15:40 BRT
- Substitui os traços de preenchimento do cabeçalho do modelo de impressão por linhas estilizadas que se ajustam à largura disponível.
- Ajusta o fallback do campo de professor para reaproveitar o novo traço responsivo quando o nome não estiver definido.

## v0.1.263 - 2025-10-26 15:27 BRT
- Remove as instruções textuais do widget de Visualização da prova, tanto no cabeçalho quanto no estado sem seleção.

## v0.1.262 - 2025-10-26 15:07 BRT
- Remove o texto descritivo do widget Planejamento da avaliação, deixando apenas os filtros e ações disponíveis.

## v0.1.261 - 2025-10-26 14:55 BRT
- Simplifica o painel de provas mantendo apenas as instruções solicitadas e alinha a mensagem da pré-visualização com o texto de impressão desejado.

## v0.1.260 - 2025-10-26 14:50 BRT
- Ajusta o grid principal para que as views ocupem toda a largura e altura disponíveis sem bordas vazias.
- Redefine o layout das telas de autenticação e do splash para abandonarem o cartão centralizado e aderirem ao modo tela cheia.
- Recalibra o espaçamento responsivo das telas de autenticação garantindo conforto visual em diferentes orientações.

## v0.1.259 - 2025-10-26 13:30 BRT
- Limita o widget Visualização da prova a exibir somente a prévia do modelo impresso, removendo o resumo e metadados textuais.

## v0.1.258 - 2025-10-26 12:59 BRT
- Convertido o widget de provas em andamento e agendadas em um botão que abre modal dedicada com a lista de avaliações.
- Ajustado o painel de visualização da prova para ocupar toda a largura disponível e sincronizado o fluxo de seleção com a nova janela modal.

## v0.1.257 - 2025-10-26 12:24 BRT
- Garantimos que o cabeçalho e o grid principal do painel de provas ocupem toda a largura disponível para evitar sobreposição de informações em telas intermediárias.

## v0.1.256 - 2025-10-26 11:59 BRT
- Realinhamos o Criador de Provas para utilizar o grid padrão do MiniAppBase, reutilizando classes compartilhadas e removendo ajustes locais.

## v0.1.255 - 2025-10-26 11:39 BRT
- Adicionamos alternância de visualização entre as versões para alunos e professores diretamente na prévia impressa.
- Atualizamos os botões de impressão para refletirem a versão em exibição e tornamos a descrição da pré-visualização mais clara.

## v0.1.254 - 2025-10-26 15:10 BRT
- Inclui filtro por status das provas no painel do Criador de Provas, com seleção "Todos os status" por padrão.
- Sincroniza o novo filtro com o formulário de criação/edição e aplica o recorte na lista e pré-visualização.
- Atualiza metadados do release para 0.1.254, refletindo a publicação na listagem de miniapps e no rodapé.

## v0.1.253 - 2025-10-26 11:24 BRT
- Adiciona botão "Editar" na lista de provas para iniciar edições diretamente do painel de planejamento.
- Preenche o formulário com os dados da prova selecionada ao iniciar a edição e reutiliza o foco/scroll existentes.
- Atualiza o fluxo de submissão para persistir alterações nas provas existentes e restaura o modo de criação ao encerrar a edição.

## v0.1.252 - 2025-10-26 11:09 BRT
- Limita a largura do cabeçalho e do layout do painel de provas a 72rem, centralizando o conteúdo em telas largas sem afetar dispositivos estreitos.
- Aumenta o espaçamento entre blocos principais do painel de provas em resoluções amplas para preservar o respiro visual após o novo limite.

## v0.1.251 - 2025-10-26 13:45 BRT
- Consolida o Criador de Provas com cabeçalho simplificado, pré-visualização e lista lateral, mantendo
  as ações de impressão no widget superior para agilizar o planejamento docente.
- Integra o modelo de impressão padronizado fornecido, exibindo a prévia em iframe e controlando metadados
  docentes nas versões do aluno e do professor.
- Amplia o banco de questões e disponibiliza pelo menos cinco modelos de prova por disciplina com variações
  de tipo e dificuldade para simulações diretamente no painel.
- Atualiza documentação, catálogo e metadados do miniapp unificando a release no número 0.1.251 e registra a
  validação visual do painel de provas.
- Ajusta o breakpoint do layout do painel de provas para liberar a coluna lateral a partir de 52rem enquanto
  mantém a grade do cabeçalho com quatro colunas apenas em telas de 64rem ou mais largas, preservando o empilhamento móvel.

## v0.1.250 - 2025-10-26 07:29 BRT
- Substitui o snapshot persistido com placeholders antigos pelo catálogo atual de miniapps assim que o seed legado é detectado.
- Expõe utilitário de teste para reinicializar o store e valida via teste automatizado que o catálogo remove entradas obsoletas ao carregar do armazenamento.
- Executa `npm test` para garantir que o catálogo e os fluxos existentes continuem aprovados após a migração do seed.
- Centraliza a versão do sistema em `scripts/data/system-release-source.js` e expõe utilitário compartilhado para sincronizar rodapé, shell e ferramentas administrativas.
- Atualiza `app-shell` e `syncSystemReleaseIndicators` para consumir os metadados derivados e acrescenta testes garantindo a consistência da versão exibida nos indicadores visuais.

## v0.1.249 - 2025-10-26 07:17 BRT
- Remove os miniapps fictícios do seed `DEFAULT_MINI_APPS` deixando apenas o Gestor de tarefas disponível no painel.
- Executa `npm test` para garantir que o catálogo continue renderizando sem regressões.

## v0.1.248 - 2025-10-26 07:04 BRT
- Limpeza dos estilos globais removendo seletores e propriedades sem referência em `styles/main.css`.
- Preservação dos utilitários e tokens compartilhados enquanto eliminamos regras obsoletas.
- Normaliza os espaçamentos remanescentes na folha principal para evitar blocos vazios após a remoção dos seletores.
- Tenta rodar `npm run dev` para validar regressões visuais, registrando que o script ainda não está definido no projeto.

## v0.1.247 - 2025-10-26 06:43 BRT
- Executa a suíte `npm test` para confirmar que os fluxos principais continuam renderizando sem regressões visuais perceptíveis.
- Tenta acionar rotinas `npm run build` e `npm run dev`, registrando que ainda não existem scripts configurados para esses fluxos automatizados.

## v0.1.246 - 2025-10-26 06:40 BRT
- Consolida as regras de `.footer-brand__text` em `styles/main.css`, removendo duplicidade e mantendo os ajustes de overflow do rodapé.

## v0.1.245 - 2025-10-26 06:36 BRT
- Implementa salvaguardas de acessibilidade reduzindo transições e animações de botões, cartões, notificações e indicadores do rodapé via `prefers-reduced-motion`.

## v0.1.244 - 2025-10-26 06:31 BRT
- Remove a diretiva `@import` de `styles/main.css` e passa a carregar os tokens globais diretamente pelo HTML.
- Atualiza `index.html` para referenciar `tokens.css` e `main.css` em sequência, mantendo o carregamento dos estilos globais.

## v0.1.243 - 2025-10-26 06:23 BRT
- Ajusta os tokens de tema para definir `--color-text-soft` com valores explícitos nos modos claro e escuro, restaurando a cor esperada das descrições.

-## v0.1.242 - 2025-10-26 06:03 BRT
- Reforça o guia da pasta `MiniApps/` com estrutura mínima, artefatos obrigatórios e orientações de integração para novos MiniApps.
- Documenta a auditoria da pasta `MiniApps/` destacando a prontidão para receber miniapps alinhados às boas práticas do repositório.

## v0.1.241 - 2025-10-26 05:55 BRT
- Classifica o painel de tarefas como miniapp no catálogo padrão, com metadados de acesso e categoria alinhados ao gestor.
- Atualiza a descrição da Mini App Store para comunicar que miniapps são experiências completas como o Gestor de tarefas.
- Atualiza os metadados de versão do sistema e o painel de MiniApps para registrar a release v0.1.241.

## v0.1.240 - 2025-10-25 18:58 BRT
- Adiciona ao painel do usuário um widget de resumo das tarefas com indicadores dinâmicos e atalho para o painel dedicado.
- Compartilha os dados padrão do painel de tarefas em módulo próprio para reutilização entre views e seeds automáticos.
- Ajusta os testes e estilos do painel do usuário para contemplar o novo widget e manter a grade alinhada.

## v0.1.239 - 2025-10-25 16:45 BRT
- Impede que o seed do painel de tarefas repovoe os registros padrão após excluir todos os itens, usando marcador persistente no store.
- Atualiza a versão do sistema para refletir a release v0.1.239 publicada às 16h45 em BRT.

## v0.1.238 - 2025-10-25 16:29 BRT
- Adiciona testes automatizados garantindo que o formulário do painel de tarefas só apareça ao criar ou editar itens e volte a
  ficar oculto ao cancelar.
- Atualiza a implementação do DOM falso de testes para suportar reset de formulários, permitindo simular os fluxos do painel.

## v0.1.237 - 2025-10-25 16:22 BRT
- Ajusta o painel de tarefas para manter o formulário oculto por padrão e fechá-lo ao alternar o botão "Nova tarefa" quando não houver criação ou edição ativa.
- Corrige o estado `aria-expanded` do botão de nova tarefa para indicar quando o formulário está visível em fluxos de criação e edição.

## v0.1.236 - 2025-10-25 15:57 BRT
- Ajusta o painel de tarefas para exibir o formulário de criação apenas ao acionar o botão "Nova tarefa", com estados ARIA atualizados.
- Assegura que o formulário oculto permaneça invisível aplicando regra específica de CSS.

## v0.1.235 - 2025-10-25 15:49 BRT
- Conecta o painel de tarefas a um store persistente com IndexedDB e fallback em memória, permitindo cadastrar, editar e remover itens.
- Acrescenta formulário interativo com validações, feedbacks e botões de ação nos cards do backlog para abrir edições rápidas.
- Atualiza o layout e os estilos do painel para acomodar o formulário, mensagens contextuais e o botão "Nova tarefa".

## v0.1.234 - 2025-10-25 15:03 BRT
- Cria o painel de tarefas com indicadores de andamento e backlog priorizado.
- Permite abrir os detalhes de cada tarefa em modal com o shell desfocado e checklist contextual.
- Atualiza metadados, versão do sistema e painel do projeto para comunicar a release v0.1.234.

## v0.1.233 - 2025-10-25 14:41 BRT
- Reforça as diretrizes de log no `AGENTS.md` para congelar versões anteriores e permitir apenas complementos na versão vigente.

## v0.1.232 - 2025-10-25 14:00 BRT
- Exibe a tabela de dados do usuário somente ao expandir o widget, apresentando-a em modal com fundo desfocado e restauração de foco.
- Atualiza os indicadores do painel do usuário e do projeto para comunicarem a nova versão e horário de publicação.
- Sincroniza os metadados do sistema com a release v0.1.232.

## v0.1.231 - 2025-10-25 10:41 BRT
- Automatiza a sincronização da versão do sistema no rodapé e no painel administrativo via `syncSystemReleaseIndicators` da ferramenta de log.
- Adiciona identificadores aos chips de versão e publicação da navegação administrativa para permitir atualizações dinâmicas.
- Atualiza os metadados e o pacote do projeto para anunciar a release v0.1.231.
- Documenta o fluxo de trabalhos temporários criando a pasta `temp/` com instruções dedicadas e reforçando a diretriz no `AGENTS.md` principal.
- Amplia o contraste visual entre texto digitado e placeholders nos campos de formulário para destacar campos pendentes de preenchimento.
- Acrescenta ao painel do projeto o widget com a lista dos painéis implantados exibindo versão e data da última atualização em tabela dedicada.
- Cria o projeto temporário `temp/version-panel` com painel para selecionar branches do GitHub e renderizar a prévia HTML da versão escolhida.
- Expande o painel do projeto com a listagem dos protótipos em `temp/`, incluindo links de pré-visualização lado a lado com as demais colunas da tabela.
- Disponibiliza o painel "Projetos temporários" restrito a administradores com atalho dedicado no menu principal e acesso móvel equivalente.
- Move o atalho "Projetos temporários" para a seção administrativa do menu do cabeçalho e restringe o bloco a administradores autenticados.

## v0.1.230 - 2025-10-25 07:58 BRT
- Reorganiza o formulário de dados do usuário em abas separando informações pessoais e endereço em painéis dedicados.
- Ajusta o preenchimento por CEP para zerar número, complemento e país antes da consulta e limpar campos ausentes na resposta.
- Exibe a confirmação "Endereço carregado a partir do CEP" como aviso temporário no rodapé.
- Reforça o README de `sys/tools` para remover itens da lista de Conteúdo atual quando a função correspondente sai do sistema.
- Converte o utilitário de log em ferramenta em `sys/tools/log`, atualizando importações globais e registrando histórico dedicado para o módulo.

## v0.1.229 - 2025-10-25 07:22 BRT
- Organiza os utilitários do sistema criando a pasta `sys/tools` para concentrar integrações reutilizáveis.
- Implementa a função `fetchCep` consultando a API ViaCEP e retornando os campos normalizados para reutilização nos painéis.
- Documenta `sys/` e seus subdiretórios com READMEs descrevendo conteúdos, limites e orientações de uso das ferramentas.
- Cria logs dedicados para cada ferramenta em `sys/tools`, iniciando o histórico do utilitário de CEP.
- Revisa os READMEs de `sys/` e `sys/tools/` detalhando como agentes devem usar e preservar as páginas e seus registros.
- Atualiza o log da ferramenta de CEP com orientações de manutenção para o histórico e requisitos expostos ao shell.
- Ajusta o `AGENTS.md` para referenciar as instruções de uso e preservação já documentadas nos READMEs do `sys/` sem duplicá-las.
- Alinha a borda do widget "Dados do usuário" com o estilo aplicado aos widgets de tema e sessão no painel do usuário.
- Atualiza o widget de etiqueta do painel do usuário com resumo integrado, destaques e links rápidos para as seções principais.

## v0.1.228 - 2025-10-25 06:35 BRT
- Externaliza os tokens globais para `styles/tokens.css`, abrindo espaço para reutilização centralizada das variáveis de tema.
- Recalibra os widgets introdutório e de etiqueta do painel do usuário com tokens dedicados para gap, padding e altura mínima ampliada.
- Atualiza os metadados do sistema para comunicar a release v0.1.228 no rodapé e demais indicadores do painel.
- Ajusta os widgets de tema e de sessão do painel do usuário com fundo transparente, borda discreta e conteúdo sempre visível.

## v0.1.227 - 2025-10-25 06:02 BRT
- Amplia os widgets introdutório e de etiqueta do painel do usuário para oferecer mais altura útil e dar destaque suave ao primeiro bloco da grade.
- Atualiza os metadados do sistema para comunicar a release v0.1.227 no rodapé e demais indicadores do painel.

## v0.1.226 - 2025-10-25 00:44 BRT
- Simplifica o widget de identidade visual do painel administrativo com um único botão de modo, upload centralizado e prévia compacta no tamanho aplicado.
- Atualiza os metadados do sistema para comunicar a versão v0.1.226 no rodapé e demais indicadores do painel.
- Remove a Galeria de painéis do shell, incluindo rota, view, estilos dedicados e referências na documentação.
- Inclui widgets introdutórios e de etiqueta transparentes no painel do usuário replicando o modelo homologado do painel Log.

## v0.1.225 - 2025-10-24 11:40 BRT
- Remove as restrições de altura herdadas do shell no painel Kit de Design, permitindo que os widgets se ajustem ao conteúdo.
- Ajusta o modelo UD02 no painel de design para ocupar uma linha exclusiva com largura integral e destaque individual.
- Remove o fundo dos cartões de modelos do painel de design para manter código e título em cabeçalhos totalmente transparentes.
- Atualiza os metadados do sistema para comunicar a versão v0.1.225 no rodapé e demais indicadores do painel.

## v0.1.224 - 2025-10-24 10:55 BRT
- Persiste a última view acessada no armazenamento local e restaura o painel correspondente após recarregamentos.
- Renomeia o painel para "Painel de design" em rótulos, mensagens e documentação dedicada.
- Corrige a restauração da Galeria de painéis carregando a view persistida quando ela é reaberta após o refresh.
- Atualiza os metadados do sistema para publicar a versão v0.1.224 no rodapé e na navegação administrativa.

## v0.1.223 - 2025-10-24 09:57 BRT
- Elimina a rolagem vertical dos widgets de pré-visualização no Kit de Design permitindo que cada modelo expanda na altura completa.
- Ajusta a galeria de painéis para redistribuir o pitch em uma, duas ou três colunas conforme a quantidade de miniaturas exibidas.
- Atualiza a documentação do Kit de Design e o guia de MiniApps com as novas regras de pitch e registro de logs dedicados.

## v0.1.222 - 2025-10-24 08:28 BRT
- Cria o catálogo `APP_SHELL_LAYOUT_MODELS` descrevendo a composição do cabeçalho, painel central com `--view-max-block-size` e rodapé para painéis administrativos e de usuário.
- Adiciona a vitrine "Layouts do app shell" ao Kit de Design administrativo exibindo os novos modelos ao lado das demais categorias.
- Atualiza a documentação de tokens com offsets de layout, orientações de tela cheia e o registro da versão v0.1.222.
- Ajusta a notomarca do cabeçalho para abrir a Galeria de painéis e atualiza rótulos e rotas do shell para refletir o catálogo.
- Sincroniza o favicon da aplicação com o ícone claro do rodapé e atualiza o título da aba para "5 Horas • MiniApps".

## v0.1.221 - 2025-10-24 07:40 BRT
- Torna o widget padrão de pré-visualização interativo, abrindo o painel correspondente ao ser clicado ou acionado pelo teclado.
- Reúne os widgets do painel do usuário em módulo compartilhado com catálogo homologado no Kit de Design e atualiza os testes.
- Destaca o estado interativo das miniaturas com foco visível, facilitando a navegação pela galeria e pelo kit de design.

## v0.1.220 - 2025-10-24 07:08 BRT
- Introduz o widget padrão de pré-visualização com título e janela bloqueada para embutir telas no Kit de Design.
- Adiciona o painel "Galeria de painéis" acessado pelo logotipo exibindo miniaturas de todas as telas liberadas ao usuário.
- Renderiza as prévias dos miniapps salvos pelo usuário utilizando o novo widget para mostrar a tela inicial de cada miniapp.

## v0.1.219 - 2025-10-24 07:05 BRT
- Remove o limite de altura dos widgets de modelos do painel Kit de Design para exibir cada prévia completa.

## v0.1.218 - 2025-10-24 06:34 BRT
- Atualiza metadados do sistema para comunicar a release final v0.1.218 no rodapé e nos botões de versão.
- Reforça as diretrizes do projeto registrando que conteúdos já publicados devem permanecer intactos até nova instrução.
- Acrescenta o atalho "Painel do usuário" ao menu do cabeçalho e ao menu móvel, abrindo diretamente a view de conta quando autenticado.

## v0.1.217 - 2025-10-24 06:25 BRT
- Acrescenta widgets iniciais de título e etiqueta com cartões transparentes ao painel Log do projeto.
- Remove os parágrafos anteriores ao título do Kit Design e garante cartões transparentes nos widgets de abertura.
- Expõe na etiqueta do painel a data e versão da última publicação do Kit Design utilizando store dedicado.
- Acrescenta widgets de paleta de cores e gabarito tipográfico ao painel do Kit Design com visualizações homologadas.
- Renomeia o painel Mini App Store para MiniApps nos rótulos e atalhos do cabeçalho.
- Converte os widgets iniciais do painel Log em modelos do sistema e adiciona a categoria Widgets ao Kit de Design.
- Centraliza a versão do sistema em store dedicada e sincroniza o rodapé, navegação e metadados com a mesma fonte de verdade.
- Inclui no painel administrativo o widget de monitoramento do IndexedDB com contagem de registros, tamanho estimado e status de cada banco.
- Torna os widgets do Kit de Design transparentes por padrão, mantendo o fundo apenas nos cartões de exemplos e removendo o menu anterior ao título.
- Remove o widget "Miniapps liberados" do painel Início para simplificar a visão principal do usuário autenticado.
- Redesenha o widget de identidade visual do painel administrativo com pré-visualizações temáticas e estados mais descritivos.
- Torna os cartões do painel administrativo totalmente transparentes para evidenciar apenas o conteúdo de cada widget.
- Adiciona o atalho "Painel do projeto" ao menu do cabeçalho e ao menu mobile para acesso direto ao log do produto.

## v0.1.216 - 2025-10-24 04:47 BRT
- Reorganiza o painel do Kit de Design agrupando cada categoria em um widget padrão com cabeçalho e carrossel horizontal de modelos.
- Implementa um template compartilhado para renderizar os modelos homologados e ajusta os estilos para o novo comportamento em linha.
- Ajusta o widget de miniapps salvos no painel inicial para exibir apenas ícones organizados em duas linhas com altura compacta.
- Implementa rolagem vertical e limites de altura reutilizando o estilo de ícones para acomodar listas extensas sem expandir o painel.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.216 das 04h47.
- Centraliza o título da tela ativa no cabeçalho, fixa o rótulo do menu e reorganiza os itens em três blocos mantendo o logout como última ação.
- Remove a variação de cor do botão do usuário e mantém o menu sem exibir o nome da view enquanto replica o título no cabeçalho.
- Adiciona ao painel administrativo o widget de identidade visual com upload de logos para temas claro, escuro ou compartilhado e sincroniza as imagens do cabeçalho.

## v0.1.215 - 2025-10-24 04:00 BRT
- Complementa a release v0.1.215 reestruturando o painel do Kit Design com widgets de título e etiqueta alinhados ao modelo do painel Início.
- Atualiza o resumo para destacar dados do administrador ativo e remove o cabeçalho anterior do painel.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.215 das 04h00.

## v0.1.215 - 2025-10-25 13:30 BRT
- Remove do painel inicial o widget "Miniapps liberados" para simplificar a visão principal dos usuários.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.215 das 13h30.

## v0.1.214 - 2025-10-23 20:45 BRT
- Adiciona ao painel inicial o widget de acessos recentes exibindo ícones dos quatro mini-apps abertos pelo usuário.
- Registra cada abertura de mini-app no histórico local para manter a lista sincronizada em tempo real.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.214 das 20h45.

## v0.1.213 - 2025-10-23 20:16 BRT
- Ajusta a etiqueta do painel para considerar apenas mini-apps favoritados disponíveis ao perfil ativo.
- Sincroniza os contadores de favoritos e salvos com os mini-apps acessíveis exibidos nos widgets correspondentes.

## v0.1.212 - 2025-10-23 20:10 BRT
- Deixa transparentes os cartões de itens do painel Kit de Design para destacar apenas os conteúdos homologados.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.212 das 20h10.

## v0.1.211 - 2025-10-23 19:50 BRT
- Reestrutura o widget MiniApps Favoritos do painel inicial para ocupar meia linha com grade de quatro ícones em duas colunas.
- Exibe apenas os ícones dos favoritos com rótulos acessíveis e placeholders consistentes reutilizando o estilo global dos avatares.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.211 das 19h50.

## v0.1.210 - 2025-10-23 19:42 BRT
- Limpa o painel do Kit Design removendo as descrições e os tokens exibidos nos modelos de superfícies, formulários, feedbacks, etiquetas e botões.
- Remove o widget de ficha técnica dos botões para deixar o catálogo mais enxuto.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.210 das 19h42.

## v0.1.209 - 2025-10-25 12:00 BRT
- Substitui o fundo dos widgets de miniapps favoritados, salvos e liberados por transparência, mantendo a estrutura do painel Início.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.209 das 12h00.

## v0.1.208 - 2025-10-25 11:30 BRT
- Acrescenta ao painel administrativo o widget Pacote de produtos com indicadores de vigência, cobertura do catálogo e ticket médio.
- Organiza os widgets de pacotes e mini-apps na mesma linha para facilitar a análise conjunta dos dados operacionais.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.208 das 11h30.

## v0.1.207 - 2025-10-25 11:00 BRT
- Amplia o painel do Kit Design com seções dedicadas a superfícies, formulários, feedbacks e etiquetas cobrindo todos os padrões presentes nos painéis atuais.
- Insere visualizações exemplificadas com tokens homologados para campos, grupos de checkbox e chips, garantindo referência única para novos widgets.
- Atualiza `docs/design-kit-tokens.md` com as categorias recém-homologadas e referencia a release no rodapé da aplicação.

## v0.1.206 - 2025-10-25 10:30 BRT
- Padroniza a elevação dos botões com tokens globais para sombras base e hover, reduzindo variações no kit.
- Adiciona a coluna de elevação no painel do Kit Design para limitar escolhas às opções homologadas.
- Documenta em `docs/design-kit-tokens.md` todas as categorias de variáveis do painel e atualiza a versão no rodapé para a release v0.1.206 das 10h30.

## v0.1.205 - 2025-10-25 10:00 BRT
- Estrutura uma paleta oficial de cores do kit com tokens para preenchimentos primários e cores de texto.
- Limita o painel do Kit Design às combinações homologadas de cor primária e cor de texto para os modelos de botão.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.205 das 10h00.

## v0.1.204 - 2025-10-25 09:30 BRT
- Cria tokens globais para larguras (compacta, padrão e fluida) e alturas (compacta, padrão e quadrada) do kit de controles.
- Ajusta botões e o painel do Kit Design para consumir os tamanhos homologados e limitar as opções configuráveis.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.204 das 09h30.

## v0.1.203 - 2025-10-25 09:00 BRT
- Padroniza o kit de design com três tokens de raio (`sm`, `md`, `lg`) e mantém variantes pill e circular para casos especiais.
- Substitui valores diretos de `border-radius` na folha principal para reutilizar as novas categorias em cartões, botões e painéis.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.203 das 09h00.

## v0.1.202 - 2025-10-23 18:21 BRT
- Ajusta os widgets introdutórios do painel Início para remover o fundo opaco e destacar o degradê base.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.202 das 18h21.

## v0.1.201 - 2025-10-24 23:59 BRT
- Corrige o painel Kit de Design garantindo que a limpeza dos eventos dos campos seja registrada com segurança, eliminando o erro que impedia administradores de abrir o conteúdo.
- Valida visualmente o painel atualizado confirmando a renderização completa do Kit de Design após o acesso pelo menu do cabeçalho.

## v0.1.200 - 2025-10-24 23:30 BRT
- Simplifica a Mini App Store mantendo apenas o widget de miniapps disponíveis e removendo as seções de MiniAppPages e ilustração.
- Remove estilos associados às seções retiradas para manter o layout enxuto.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.200 das 23h30.

## v0.1.199 - 2025-10-24 23:00 BRT
- Simplifica o menu de painéis mantendo um único atalho de autenticação que alterna entre Login e Logout conforme o estado da sessão.
- Limpa a sessão ativa ao acionar o Logout e redireciona para o painel de login tanto no menu principal quanto na navegação móvel.
- Atualiza os testes automatizados e a versão do rodapé para refletir a release v0.1.199 das 23h00.

## v0.1.198 - 2025-10-24 22:30 BRT
- Substitui o botão do kit de design no painel administrativo por uma etiqueta no padrão de chips usado no painel do usuário.
- Exibe na nova etiqueta a versão atual do sistema e a data da última publicação para facilitar a conferência rápida.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.198 das 22h30.

## v0.1.197 - 2025-10-24 22:00 BRT
- Libera o atalho "Kit Design" para qualquer usuário autenticado, mantendo o conteúdo restrito aos administradores quando necessário.
- Ajusta o shell para manter o separador do menu apenas quando houver itens especiais e preserva o acesso exclusivo do painel administrativo.
- Atualiza testes automatizados do menu e a versão exibida no rodapé para refletir a release v0.1.197 das 22h00.

## v0.1.196 - 2025-10-24 21:30 BRT
- Consolida as instruções do `AGENTS.md` para eliminar redundâncias e reforça o uso do horário de Brasília no registro do log.

## v0.1.195 - 2025-10-24 21:00 BRT
- Restaura o atalho do painel Kit Design no menu do cabeçalho, exibindo-o novamente aos administradores.
- Atualiza o shell para abrir o painel Kit Design a partir do menu e cobre o comportamento em testes de sessão.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.195 das 21h00.

## v0.1.194 - 2025-10-24 20:30 BRT
- Corrige a troca do logotipo do cabeçalho ao alternar o tema, garantindo que a imagem seja atualizada conforme o modo ativo.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.194 das 20h30.

## v0.1.193 - 2025-10-24 20:00 BRT
- Adiciona um indicador de atividade no rodapé para avisar quando existem alterações pendentes, salvamento em andamento, sucesso ou erros de sincronização.
- Cria o módulo central de atividade e integra o painel do usuário para emitir estados consistentes durante entradas, autosave e perda de sessão.
- Atualiza estilos, componentes do shell e testes automatizados para refletir o novo feedback consolidado e garantir cobertura do ciclo de salvamento.

## v0.1.192 - 2025-10-24 19:30 BRT
- Remove o atalho "Kit de design" do menu principal do cabeçalho mantendo o acesso restrito às entradas internas do painel administrativo.
- Atualiza o menu móvel para ocultar o acesso direto ao kit de design, preservando apenas o atalho principal do painel administrativo.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.192 das 19h30.

## v0.1.191 - 2025-10-24 19:00 BRT
- Adiciona o atalho "Kit de design" ao menu principal do cabeçalho e o agrupa com as opções exclusivas de administradores.
- Sincroniza o menu móvel do cabeçalho para incluir o novo acesso e respeitar a visibilidade condicional para administradores.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.191 das 19h00.

## v0.1.190 - 2025-10-24 18:30 BRT
- Alinha o layout do Kit de Design ao grid compartilhado dos painéis administrativos aplicando as classes utilitárias de painel.
- Simplifica os estilos do layout do Kit de Design para herdar o comportamento responsivo padrão do grid global.
- Converte a ficha técnica em uma tabela editável indexada por campo, sincronizando os valores digitados com os botões de exemplo e expondo tokens de estilo para experimentação.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.190 das 18h30.

## v0.1.189 - 2025-10-24 16:30 BRT
- Reorganiza os itens do menu de painéis do cabeçalho priorizando atalhos gerais antes das opções administrativas.
- Acrescenta um espaçador visual no menu e garante que ele só apareça quando houver links exclusivos de administradores.
- Ajusta os estilos do menu para acomodar o novo separador mantendo a hierarquia visual entre as seções.

## v0.1.188 - 2025-10-24 16:00 BRT
- Criação do painel "Kit de design" no menu administrativo com catálogo sequencial de botões padrões do aplicativo.
- Navegação dedicada no menu de administradores para alternar entre o painel principal e o kit de design.
- Restrição do acesso ao kit de design apenas para usuários administradores, exibindo aviso orientativo aos demais perfis.
- Atualização da versão exibida no rodapé para refletir a release v0.1.188 das 16h00.

## v0.1.187 - 2025-10-24 15:40 BRT
- Adiciona ao painel administrativo o widget de pacotes e planos de assinatura com edição de vigência, valor, periodicidade, mini-apps e categoria elegível.
- Cria o data store de assinaturas com periodicidades configuráveis e sincronização com a tabela do painel.
- Atualiza os testes do painel administrativo para cobrir o novo widget de assinaturas e os ajustes de contagem de widgets.

## v0.1.186 - 2025-10-24 15:10 BRT
- Substitui os botões de login e cadastro do painel Início por um único atalho que leva ao painel do usuário.
- Atualiza os testes do painel Início para validar a nova navegação voltada ao painel do usuário.

## v0.1.185 - 2025-10-23 14:20 BRT
- Simplifica os cards de mini-apps da loja mantendo apenas título, categoria e resumo compacto para cada item.
- Adiciona o botão de atalho com ícone de mais para abrir a ficha técnica em modal com desfoque do plano de fundo.
- Reposiciona o placeholder de avatar no cabeçalho do cartão, deslocando o título para a área central e a categoria para o rodapé.
- Ajusta o carrossel horizontal para espaçar melhor os cartões e acompanhar qualquer quantidade de mini-apps renderizados.
- Atualiza o rodapé para refletir a versão v0.1.185 das 14h20.

## v0.1.184 - 2025-10-23 13:19 BRT
- Amplia o widget de etiqueta do painel para mostrar nome, contatos e perfil do usuário logado junto da identificação do painel.
- Indica no mesmo widget quantos mini-apps o usuário favoritou e salvou, reutilizando o sumário padrão de dados.
- Atualiza os testes do painel Início para validar o novo sumário e a ordem dos widgets renderizados.

## v0.1.183 - 2025-10-23 13:05 BRT
- Cria na Mini App Store cards dedicados às MiniAppPages, incluindo espaço reservado para a lista e para a arte destacada.
- Conecta o widget das MiniAppPages ao catálogo de miniapps para exibir automaticamente os três modelos disponíveis.
- Mantém o placeholder preparado enquanto nenhuma MiniAppPage estiver publicada e atualiza o rodapé para a release v0.1.183 das 13h05.

## v0.1.181 - 2025-10-24 12:40 BRT
- Harmoniza o afastamento externo dos painéis aplicando o mesmo padding nas laterais, topo e base nas telas grandes.
- Ajusta a configuração padrão das views administrativas e do usuário para reaproveitar o novo espaçamento unificado.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.181 das 12h40.

## v0.1.180 - 2025-10-24 12:10 BRT
- Adiciona ao widget de gestão de mini-apps o upload de avatar com validações para PNG 128 × 128 px até 128 KB e instruções claras no painel.
- Exibe a prévia do avatar na tabela administrativa e permite limpar a imagem com atualização automática do cadastro.
- Normaliza o campo de ícone no data store dos mini-apps para persistir o avatar enviado pelo painel administrativo.

## v0.1.179 - 2025-10-24 11:40 BRT
- Adiciona uma linha inicial ao painel Início com widgets dedicados à apresentação e à etiqueta do painel, reforçando contexto e identificação rápidos.
- Reaproveita estilos globais de cartões, descrições e chips para alinhar a nova saudação sem criar utilitários inéditos.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.179 das 11h40.

## v0.1.178 - 2025-10-24 11:10 BRT
- Simplifica a Mini App Store para um único widget em largura total exibindo todos os miniapps disponíveis na mesma linha com espaçamento uniforme.
- Remove seções paralelas e controles de favoritos/salvos, mantendo apenas a lista horizontal navegável dos miniapps.
- Ajusta a renderização para atualizar automaticamente a vitrine ao assinar o catálogo e exibir estado vazio quando necessário.

## v0.1.177 - 2025-10-24 10:40 BRT
- Remove o botão "Editar dados" do widget de dados do usuário e simplifica o layout mantendo apenas o resumo e o formulário.
- Elimina o campo de senha do formulário do usuário, preservando apenas nome, telefone e e-mail para edição.
- Adiciona o token `--system-interaction-auto-focus-open` ao sistema de estilos e aplica o padrão para evitar auto foco ao expandir widgets.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.177.

## v0.1.176 - 2025-10-24 10:10 BRT
- Remove o atalho do rodapé para o painel administrativo e transforma o botão da marca em controle de visibilidade dos indicadores.
- Persiste a preferência de exibir ou ocultar indicadores do rodapé tanto no armazenamento local quanto no cadastro do usuário ativo, com sincronização automática.
- Acrescenta ao painel do usuário um atalho dedicado para alternar os indicadores do rodapé ao lado do controle de tema, mantendo feedbacks e estados alinhados.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.176.

## v0.1.175 - 2025-10-24 09:40 BRT
- Reorganiza o menu do cabeçalho para exibir somente Mini App Store, Cadastro, Login e alternância de tema a visitantes, liberando o Início e o painel administrativo conforme o tipo de usuário autenticado.
- Atualiza o toggle de tema com rótulos dinâmicos, suporte às ações móveis e remoção de itens ocultos da navegação por foco.
- Adiciona testes automatizados cobrindo as regras de sessão do menu e a alternância de tema.

## v0.1.174 - 2025-10-24 09:10 BRT
- Remove o botão "Mais opções" do widget de dados do usuário e centraliza a alternância de edição no botão "Editar dados" com estados ARIA.
- Converte o botão de edição para o padrão `.button button--primary`, ajustando estilos associados e eliminando seletores específicos do controle antigo.
- Atualiza a lógica e os testes do painel do usuário para abrir e recolher o formulário diretamente pelo botão de edição, alinhando estados ocupados e feedback.

## v0.1.173 - 2025-10-24 08:40 BRT
- Acrescenta a variação `user-dashboard__widget--full` para permitir widgets em largura total no dashboard.
- Ajusta o catálogo da Mini App Store para usar a nova variação e ocupar toda a linha disponível.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.173.

## v0.1.172 - 2025-10-24 08:10 BRT
- Remove o limitador `.card` da view da Mini App Store para que o catálogo ocupe toda a malha do dashboard.
- Estende a aplicação de `main--user` à view Mini App Store, alinhando offsets e largura com os demais painéis do usuário.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.172.

## v0.1.171 - 2025-10-24 07:40 BRT
- Substitui o widget "Dados Principais" por "Dados do Usuário" com resumo sempre visível e botões dedicados de edição e expansão.
- Implementa o salvamento automático por campo, validando telefone, e-mail e senha ao sair do foco e atualizando o snapshot ativo em memória.
- Remove o seletor de tema do formulário, reorganiza os estilos para o novo agrupamento de ações e ajusta os testes do painel do usuário ao fluxo com botão de "mais".
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.171.

## v0.1.170 - 2025-10-24 06:50 BRT
- Refatora o painel do usuário para montar seções a partir de metadados configuráveis, criando acordeões independentes com estados `data-section-state` por bloco.
- Extrai helpers reutilizáveis para construção de formulários dos dados do usuário, permitindo identificar grupos como "dados pessoais" e reutilizar os campos.
- Atualiza estilos e testes garantindo botões de cabeçalho, indicadores visuais dos acordeões e datasets sincronizados com os novos estados.

## v0.1.169 - 2025-10-24 05:44 BRT
- Inclui botões dedicados de Cancelar e Salvar no formulário de dados do usuário com estados ARIA alinhados ao feedback.
- Ajusta o botão de resumo para apenas abrir ou fechar a edição sem acionar salvamento automático.
- Atualiza mensagens informativas e fluxos de feedback para refletir o novo controle manual de persistência.

## v0.1.168 - 2025-10-23 23:40 BRT
- Recolhe o widget de dados principais ocultando descrição e feedback quando resumido e reduzindo os espaçamentos via estado `collapsed`.
- Garante que o estado expandido continue exibindo o formulário completo e restaurando mensagens ao reabrir a edição.

## v0.1.168 - 2025-10-23 07:00 BRT
- Converte o widget de gestão de usuários do painel administrativo em módulo compartilhado reutilizável entre painéis.
- Adapta o painel do usuário para consumir o novo widget padrão, exibindo os dados do usuário ativo em formato de tabela expansível.
- Reorganiza o resumo e formulário do painel do usuário dentro do detalhe expandido, mantendo ações de edição e feedback existentes.

## v0.1.167 - 2025-10-24 09:24 BRT
- Reestrutura a Mini App Store em seções temáticas com listas independentes, navegação horizontal e feedback reativo para cada carrossel.
- Amplia o data store dos miniapps com metadados de downloads, favoritos, datas de lançamento e categorias destacadas, expondo utilitários de ranking.
- Implementa controles de navegação, estados vazios e estilos de carrossel inspirados em catálogos de streaming para destacar os miniapps.
- Adiciona testes automatizados garantindo a normalização dos novos campos e a ordenação das coleções por métricas e categorias.
- Cria a pasta `MiniApps/` com guia centralizado (`readme.mb`) para orientar a estruturação, manutenção e documentação de futuros MiniApps.
- Refatora o painel para reutilizar utilitários globais de layout, feedback e botões, convertendo o carrossel em componente compartilhado e removendo seletores específicos da Mini App Store.
- Atualiza o `AGENTS.md` para exigir a leitura do `MiniApps/readme.mb` ao executar tarefas relacionadas a miniapps.

## v0.1.166 - 2025-10-25 14:18 BRT
- Expande o catálogo da Mini App Store para ocupar toda a largura da malha do painel do usuário.
- Restaura a grade responsiva dos miniapps na view da loja com altura automática por cartão.
- Mantém o breakpoint de quatro colunas para a lista de miniapps quando houver espaço disponível.
- Abre a seção de endereço no painel do usuário solicitando CEP, preenchendo logradouro, bairro, cidade e UF automaticamente e atualizando o resumo com o endereço completo.
- Adiciona o resumo textual dos dados principais antes da tabela no widget Dados do usuário, refletindo as colunas vistas com a tabela recolhida.
- Exibe a tabela de dados do usuário apenas dentro de uma janela modal ao expandir o widget, aplicando backdrop desfocado e botão de fechamento dedicado.
- Permite abrir a sobreposição de edição de dados pessoais diretamente pela aba "Dados pessoais" quando a sessão ativa estiver carregada.

## v0.1.165 - 2025-10-23 22:00 BRT
- Ajusta o painel do usuário para exibir os campos de edição somente após o clique em "Editar dados" e recolhê-los ao ocultar.
- Remove o botão de salvar manual e aplica salvamento automático ao finalizar a edição com validações e feedback preservados.
- Atualiza a versão exibida no rodapé para comunicar a release v0.1.165 das 22h00.

## v0.1.164 - 2025-10-23 21:30 BRT
- Adiciona o widget de indicadores ao painel administrativo com quatro cards acompanhando mini-apps ativos, implantações e base de usuários.
- Estiliza os cards destacados em uma grade responsiva, com barras de progresso e cores alinhadas ao padrão visual do dashboard.
- Atualiza as assinaturas de usuários e mini-apps para sincronizar os indicadores e carregar os snapshots iniciais na renderização.

## v0.1.163 - 2025-10-23 21:00 BRT
- Substitui o callout de convidado do painel Início por um painel dedicado alinhado às classes do layout de autenticação.
- Estende os estilos do painel de convidado para replicar largura, centralização e espaçamentos do formulário de login com botões responsivos.
- Atualiza o rodapé para comunicar a versão v0.1.163 das 21h00.

## v0.1.162 - 2025-10-23 20:30 BRT
- Reorganiza a grade do formulário do painel do usuário com colunas responsivas baseadas em atributos de tamanho para cada campo.
- Ajusta os elementos do painel do usuário para definir `data-field-size` compatível com a nova malha e garantir mensagens e envio em largura total.
- Atualiza o rodapé para comunicar a versão v0.1.162 das 20h30.

## v0.1.161 - 2025-10-23 20:00 BRT
- Ajusta a vitrine da Mini App Store para ocupar uma única coluna, exibindo cada miniapp em linha exclusiva no catálogo.
- Define altura automática para os cartões do catálogo, permitindo que o conteúdo adapte o tamanho do widget conforme necessário.
- Atualiza o rodapé para comunicar a versão v0.1.161 das 20h00.

## v0.1.160 - 2025-10-23 19:30 BRT
- Remove a tela de boas-vindas acionada pelo menu do painel inicial, mantendo o usuário no painel ao reabrir o item.
- Limpa o markup e os estilos associados à saudação inicial e passa a iniciar o app com o splash padrão de carregamento.
- Atualiza o rodapé para comunicar a versão v0.1.160 das 19h30.

## v0.1.159 - 2025-10-23 19:00 BRT
- Alinha o painel Log ao grid padrão dos painéis aplicando a classe compartilhada e encapsulando o conteúdo em um cartão dedicado.
- Ajusta os estilos do painel para reutilizar o espaçamento padrão sem duplicar bordas e sombras no histórico.
- Atualiza o rodapé para comunicar a versão v0.1.159 das 19h00.

## v0.1.158 - 2025-10-23 18:30 BRT
- Substitui o grid do catálogo da Mini App Store pela configuração padrão ao remover a classe personalizada da lista.
- Ajusta os estilos da view para manter espaçamentos próprios sem sobrescrever as colunas responsivas herdadas.
- Atualiza o rodapé para comunicar a versão v0.1.158 das 18h30.

## v0.1.157 - 2025-10-23 18:00 BRT
- Alinha as validações do painel do usuário para focar e marcar como inválidos os campos de telefone e senha em caso de erro.
- Limpa os estados de `aria-invalid` ao reiniciar o feedback ou após validar corretamente, evitando sinalizações persistentes.
- Associa os campos do formulário de usuário ao feedback de status via `aria-describedby` para leitura assistiva.

## v0.1.156 - 2025-10-23 17:30 BRT
- Ajusta o feedback do painel do usuário para manter aria-live ativo e alternar os papéis ARIA entre alertas e status conforme o tipo de mensagem.
- Garante que a limpeza do feedback preserve a remoção de atributos e conteúdo ao reaproveitar `showFeedback('', {})`.
- Atualiza o rodapé para comunicar a versão v0.1.156 das 17h30.

## v0.1.155 - 2025-10-23 17:00 BRT
- Remove os títulos e parágrafos introdutórios dos painéis de boas-vindas, início, administração, login, cadastro e log para que o conteúdo visível seja formado apenas pelos widgets.
- Reestrutura os estados de sucesso do cadastro, a view legal e a tela de erro para encapsular as mensagens em cartões `surface-card`, preservando alinhamentos e acessibilidade com rótulos de `aria-label`.
- Atualiza o rodapé para comunicar a versão v0.1.155 das 17h00.

## v0.1.154 - 2025-10-22 19:45 BRT
- Padroniza o painel Início com as classes compartilhadas de widgets e callout, substituindo estilos específicos por variantes globais da folha de estilos.
- Alinha o layout do painel Início ao grid padrão adicionando a classe de grade compartilhada dos painéis.
- Atualiza o rodapé para comunicar a versão v0.1.154 das 19h45.

## v0.1.153 - 2025-10-22 19:29 BRT
- Acrescenta espaçamento superior e inferior ao grid padrão dos painéis, afastando os widgets do cabeçalho e do encerramento do layout.
- Atualiza o rodapé para comunicar a versão v0.1.153 das 19h29.

## v0.1.152 - 2025-10-22 19:19 BRT
- Ajusta a grade das ações rápidas do painel do usuário para duas colunas, com botões mais largos e compactos.
- Atualiza o rodapé para comunicar a versão v0.1.152 das 19h19.

## v0.1.151 - 2025-10-22 19:09 BRT
- Cria a classe utilitária `.button` com variáveis de estado e aplica o padrão aos callouts, ações rápidas, cartões da Mini App
  Store e botões de formulários, removendo estilos duplicados nas views.
- Introduz a base `.surface-card` para widgets, callouts e itens de lista, ajustando as views para reaproveitar o mesmo esquema
  de borda, sombra e preenchimento em Início, Usuário, Administração e Mini App Store.
- Define tokens de espaçamento (`--space-2xs` a `--space-xl`) e atualiza gaps/paddings recorrentes para usar as novas
  variáveis, reduzindo `clamp` repetidos em componentes principais.
- Consolida o estilo de formulários com classes genéricas (`.form-field`, `.form-input`, `.form-message`) e refatora login,
  cadastro e painel do usuário para consumir os novos seletores enquanto preserva o comportamento existente.

## v0.1.150 - 2025-10-23 16:20 BRT
- Cria a classe base `.panel-action-tile` com variáveis compartilhadas para gradientes, bordas e transições, incluindo variantes
  compacta e de ícone para estados específicos.
- Refatora `.home-dashboard__action-button`, `.admin-dashboard__user-action`, `.miniapp-store__action-button` e botões de
  resumo para utilizarem a nova base mantendo cores e dimensões originais.
- Atualiza as views de Início, Administração e Mini App Store para aplicar a classe base aos botões de ação, garantindo hover e
  foco consistentes após a alteração.

## v0.1.149 - 2025-10-23 15:10 BRT
- Unifica os painéis de Início, Administração, Usuário e Mini App Store com a nova classe base `dashboard-view`, concentrando alinhamentos, preenchimentos e espaçamentos compartilhados.
- Substitui sobrescritas diretas de padding por variáveis CSS específicas de cada painel para manter apenas diferenças reais como grades e espaçamentos laterais.
- Atualiza as views JavaScript para incluir a classe base consolidada e revisa a responsividade nos breakpoints de 360px, 768px e 1280px confirmando que o layout permanece íntegro.

## v0.1.148 - 2025-10-23 13:50 BRT
- Unifica os estilos compartilhados de login e cadastro em seletores neutros para títulos, campos de telefone e redirecionamentos.
- Atualiza os painéis de cadastro e login para usar as novas classes unificadas, removendo seletores redundantes.
- Revalida visualmente os fluxos de acesso garantindo consistência após a refatoração e atualiza o rodapé para exibir a versão v0.1.148 das 13h50.

## v0.1.147 - 2025-10-23 12:30 BRT
- Ajusta o painel Início para abrir a ficha técnica dos mini-apps diretamente do botão "Ver detalhes", enviando os metadados formatados para o modal e preservando o foco ao fechar.

## v0.1.146 - 2025-10-23 11:40 BRT
- Cria o armazenamento de preferências de mini-apps com persistência por usuário, limite de quatro favoritos e suporte a mini-apps salvos ilimitados.
- Atualiza a Mini App Store para consumir o novo armazenamento, exibir avisos ao atingir o limite de favoritos e sincronizar automaticamente os botões de ação.
- Reestrutura o painel Início com widgets dedicados a favoritos e salvos antes do catálogo geral, alinhando os cards em grades de até quatro itens por linha e mantendo todos os salvos visíveis.
- Ajusta os estilos compartilhados e adiciona testes para o armazenamento de preferências e para a renderização dos widgets do Início.
- Atualiza os metadados do rodapé para refletir a versão v0.1.146 das 11h40.

## v0.1.145 - 2025-10-23 10:20 BRT
- Reorganiza o painel do usuário removendo título e subtítulo, iniciando diretamente pelo widget de preferências de tema.
- Alinha o grid do painel do usuário ao padrão administrativo com duas colunas para Tema/Acesso e Dados principais ocupando linha exclusiva.
- Ajusta o teste de layout para validar a nova estrutura dos widgets e a ausência do cabeçalho textual.
- Atualiza os metadados do rodapé para refletir a versão v0.1.145 das 10h20.

## v0.1.144 - 2025-10-23 09:10 BRT
- Adiciona botões de Favoritar e Assinar nos cartões da Mini App Store com feedback de estado e emissão de eventos.
- Organiza o rodapé dos cartões com um agrupamento de ações responsivo acomodando os novos controles.
- Atualiza os metadados do rodapé para refletir a versão v0.1.144 das 09h10.

## v0.1.143 - 2025-10-23 08:20 BRT
- Harmoniza o botão de expansão dos mini-apps com os estilos base da tabela administrativa para que o ícone alterne para o sinal de menos ao recolher e expandir.
- Atualiza os metadados do rodapé para refletir a versão v0.1.143 das 08h20.

## v0.1.142 - 2025-10-23 07:40 BRT
- Reduz a altura percebida dos cartões da Mini App Store ao remover a proporção quadrada e comprimir tipografia, exibindo metadados em duas colunas.
- Realinha o botão de detalhes para a borda direita com rótulo "Saiba Mais", preservando a abertura da ficha técnica modal.
- Atualiza os metadados do rodapé para refletir a versão v0.1.142 das 07h40.

## v0.1.141 - 2025-10-23 06:30 BRT
- Remove os textos externos ao widget "Miniapps disponíveis" e concentra toda a vitrine dentro do cartão dedicado na Mini App Store.
- Reestrutura o grid dos miniapps para cartões quadrados em duas colunas, com tipografia compacta e espaçamento lateral otimizado.
- Passa a exibir a ficha técnica dos miniapps em um modal com desfoque ao acionar os cartões, detalhando categoria, versão, status e atualização.
- Atualiza os metadados do rodapé para refletir a versão v0.1.141 das 06h30.

## v0.1.140 - 2025-10-23 05:20 BRT
- Ajuste do layout do painel administrativo para manter cada widget ocupando toda a largura em qualquer resolução.
- Registro da revisão assegurando que o painel administrativo continue apresentando somente os dois widgets principais.
- Redução do espaçamento lateral do painel administrativo para aproveitar melhor a largura disponível.
- Atualização dos metadados do rodapé para refletir a versão v0.1.140 das 05h20.

## v0.1.139 - 2025-10-23 04:20 BRT
- Renomeia o painel inicial para "Início" nos rótulos do cabeçalho, controles do shell e logs de bootstrap.
- Atualiza as views e ações associadas, incluindo o título do Início e a descrição de logout, para refletir o novo nome.
- Ajusta os testes de bootstrap e o rodapé para comunicarem a versão v0.1.139 das 04h20 com a nova terminologia.

## v0.1.138 - 2025-10-23 03:40 BRT
- Atalho no ícone da marca do rodapé abre diretamente o painel administrativo em telas largas sem interferir no toggle móvel.
- Replica o atalho condicional na variante TypeScript do shell para manter paridade entre os bundles.
- Atualiza o tooltip do ícone e a versão exibida no rodapé para comunicar a nova release v0.1.138 das 03h40.

## v0.1.137 - 2025-10-23 03:10 BRT
- Remove os atalhos de cabeçalho para os painéis administrativo e do usuário tanto no menu principal quanto no menu móvel.
- Garante que o bundle JavaScript e a versão TypeScript do shell não recriem os atalhos dinamicamente.
- Atualiza o rodapé para informar a versão v0.1.137 das 03h10.

## v0.1.136 - 2025-10-23 02:05 BRT
- Constrói o widget de controle de acesso no painel do usuário com botões de logoff, logout, troca de usuário e exclusão de dados locais.
- Ajusta o teste de layout do painel do usuário para cobrir o novo widget e validar a disponibilidade das ações.
- Atualiza o rodapé para informar a versão v0.1.136 das 02h05.

## v0.1.135 - 2025-10-23 01:30 BRT
- Normaliza o `userType` do snapshot da sessão para refletir os mesmos valores sanitizados utilizados no armazenamento de usuário.
- Garante que consumidores notificados pela sessão, incluindo o painel inicial, recebam o novo campo sem alterações colaterais no fluxo existente.
- Adiciona teste de regressão para validar que sessões ativas de administradores retornem `userType: 'administrador'` após autenticação.

## v0.1.134 - 2025-10-23 00:40 BRT
- Substitui a flecha do menu de painéis por um ícone neutro alinhado ao novo layout, removendo o destaque vermelho.
- Sincroniza o rótulo do botão de painéis com o título da view ativa e oculta o texto quando o painel inicial está aberto.
- Reestrutura o cabeçalho exibindo apenas o logotipo à esquerda e o botão do menu de painéis à direita, movendo os atalhos de login e cadastro para dentro do menu.
- Atualiza o rodapé para informar a versão v0.1.134 das 00h40.

## v0.1.133 - 2025-10-22 23:40 BRT
- Remove o callout de sessão do painel inicial quando há usuário autenticado e exibe a lista de mini-apps liberados para o perfil correspondente.
- Sincroniza o painel inicial com mudanças da sessão e do catálogo para manter os mini-apps habilitados atualizados em tempo real.
- Faz com que o logotipo do cabeçalho retorne ao painel inicial sempre que for clicado.
- Atualiza o rodapé para informar a versão v0.1.133 das 23h40.

## v0.1.132 - 2025-10-22 22:45 BRT
- Unifica o gatilho do menu de painéis e o botão da conta em um mesmo agrupamento no cabeçalho, mantendo o atalho do usuário dentro do menu quando autenticado.
- Ajusta os estilos do cabeçalho para o novo agrupamento garantindo feedbacks de foco, hover e espaçamento consistente entre os botões.
- Atualiza o rodapé para informar a versão v0.1.132 das 22h45.

## v0.1.131 - 2025-10-22 22:10 BRT
- Corrige a centralização do menu móvel garantindo que o modal ocupe toda a viewport inclusive em navegadores sem suporte ao atalho `inset`.
- Ajusta o espaçamento vertical do modal para considerar as áreas seguras superiores e inferiores em aparelhos com notch ou barra de navegação fixa.

## v0.1.130 - 2025-10-22 21:40 BRT
- Implementa armazenamento persistente dos mini-apps no front-end com normalização e fallback seguro quando o `localStorage` não estiver disponível.
- Reestrutura o widget de miniapps do painel administrativo para assinar o novo armazenamento e aplicar atualizações que se propagam automaticamente.
- Expõe utilitário de redefinição do catálogo para testes e adapta o teste do painel administrativo para inicializar e restaurar os mini-apps.
- Atualiza o rodapé para comunicar a versão v0.1.130 das 21h40.

## v0.1.129 - 2025-10-22 10:12 BRT
- Reconstrói o painel administrativo com dois widgets principais inspirados no layout do painel do usuário.
- Disponibiliza a listagem de usuários com expansão para resumo dos dados principais e preferências sincronizadas.
- Adiciona widget de gestão de mini-apps com controles de status e níveis de acesso por tipo de usuário.
- Atualiza os estilos para os novos detalhes do painel administrativo e para o gerenciamento de mini-apps.
- Revê o teste do painel administrativo validando os novos widgets e interações essenciais.

## v0.1.128 - 2025-10-22 19:10 BRT
- Adiciona o painel "Mini App Store" com título, introdução e vitrine listando os miniapps disponíveis com dados principais.
- Reaproveita os estilos existentes dos painéis inicial e do usuário na Mini App Store, evitando novos seletores exclusivos.
- Insere o atalho da Mini App Store no menu de painéis do cabeçalho e no menu móvel de acesso rápido para abrir a nova view.
- Cria ação de detalhes para cada miniapp disparando a navegação para o painel administrativo e emitindo evento dedicado.
- Remove os widgets de visão geral, ações rápidas, mini-apps e boas práticas do painel inicial para manter apenas o bloco principal.
- Centraliza o título, a introdução e o callout de sessão do painel inicial para destacar as ações de login e cadastro.
- Atualiza o rodapé para informar a versão v0.1.128 das 19h10.
- Sincroniza o resumo dos dados principais com o estado de edição ocultando a lista ao abrir o formulário sem esconder o botão de recolhimento.
- Revalida visualmente o painel do usuário com o resumo recolhido e expandido.

## v0.1.127 - 2025-10-22
- Realinha o atalho de alternância de tema no painel do usuário para que o botão fique alinhado à esquerda do widget.
- Reintroduz um resumo compacto de nome, telefone e e-mail no widget de dados principais com botão de edição dedicado.
- Adiciona expansão controlada do formulário completo de dados pessoais ao acionar o botão de edição do resumo.
- Refina a largura padrão dos atalhos rápidos no painel do usuário para acomodar quatro botões alinhados sem quebrar o grid em tablets.
- Realiza testes visuais em tablet (768×1024 e 1024×768) confirmando o alinhamento dos atalhos em ambas as orientações.
- Remove o widget de resumo da conta, mantendo apenas o controle de alternância de tema em destaque no painel do usuário.
- Reorganiza a view para apresentar um único widget de preferências de tema com botão dedicado sincronizado com o formulário.
- Atualiza o teste de layout para refletir a remoção dos atalhos extras e garantir que o botão de tema permaneça disponível.
- Ajusta a largura do atalho de tema para que os botões ocupem um tamanho padrão capaz de acomodar quatro itens na mesma linha.
- Adiciona atalho dedicado para alternar entre temas claro e escuro no painel do usuário, exibindo o próximo estado e bloqueando o controle quando não houver sessão.
- Sincroniza o botão de tema com o seletor existente, aplicando a escolha via gerenciador global e persistindo a preferência do usuário para acessos futuros.
- Refina os estilos do atalho de tema na lista compacta de ações, mantendo contraste em ambos os modos e feedback consistente ao foco.
- Acrescenta ao painel inicial um widget dedicado aos mini-apps com lista dinâmica pronta para receber os itens disponíveis.
- Estiliza o espaço reservado da lista de mini-apps mantendo o painel consistente com os demais widgets e comunicando o estado vazio.
- Converte os atalhos destacados do painel do usuário em uma lista compacta para leitura rápida, mantendo cada ação com descrição acessível.
- Corrige o roteador em TypeScript para recarregar o painel inicial mesmo quando a rota "dashboard" já está ativa, evitando que o botão do cabeçalho pareça inoperante após visitar o painel administrativo.
- Amplia os testes de bootstrap para cobrir o recarregamento do painel inicial quando a rota já estava ativa.
- Garante que o botão do cabeçalho para o painel inicial reabra a view mesmo quando a rota já estiver marcada como ativa.
- Reconstrói o painel do usuário com layout inspirado no administrativo, trazendo resumo da sessão, atalhos rápidos e formulário compacto para atualizar dados principais.
- Simplifica os campos e feedbacks do painel, adicionando seletor de tema integrado e mensagens de sessão ausente no estado vazio.
- Atualiza os testes de layout do painel, remove a dependência do CEP sobre a ordem anterior e ajusta estilos para os novos componentes.
- Corrige o cálculo dos offsets do cabeçalho e do rodapé usando arredondamento para cima e elimina a sobreposição do cartão de cadastro em telas baixas.
- Valida visualmente o painel de cadastro em orientação paisagem confirmando que o rodapé não cobre o botão "Criar conta".
- Alinha o título principal do painel administrativo aplicando o mesmo padding lateral dos widgets para que o texto acompanhe o restante do conteúdo.
- Mantém os widgets de indicadores e da tabela empilhados em uma única coluna em qualquer largura para abrir mais espaço aos dados detalhados.
- Acrescenta ao painel administrativo um widget de listagem com filtros, tabela expansível e edição automática dos dados principais, de perfil e preferências diretamente no painel.
- Gera feedbacks visuais para o auto-save administrativo, mantendo a seleção ao filtrar e cobrindo o fluxo com testes usando DOM simulada.
- Destaca sincronizações automáticas da memória com o novo estado visual “updated”, ajustando acessibilidade, estilos e testes do armazenamento.
- Mantém o feedback de auto-save visível após novas renderizações e garante que o resumo do toolbar destaque filtros ativos mesmo quando todos os usuários permanecem na listagem.
- Amplia o teste do painel administrativo com DOM falso, aguardando a conclusão do auto-save, validando feedbacks, filtros e o seletor de tipo com o ambiente sem suporte a seletores por id.
- Ajusta o painel de login para seguir o layout do cadastro, removendo a introdução e adicionando redirecionamento para criar conta.
- Compartilha os estilos de redirecionamento entre login e cadastro para manter tipografia e ênfase alinhadas.
- Realinha o título e a introdução do painel inicial para acompanhar a largura dos widgets e manter as bordas alinhadas.
- Reestrutura o painel administrativo, removendo callouts e listas anteriores para seguir o modelo do painel inicial com título e introdução focados em gestão.
- Adiciona um widget dedicado à gestão de usuários com indicadores resumidos e ações rápidas conectadas ao roteador central.
- Converte os preenchimentos dinâmicos do `<main>` para unidades absolutas, garantindo o afastamento do cabeçalho e do rodapé fixos em todos os painéis.
- Valida visualmente os painéis inicial, administrativo e do usuário confirmando que nenhum conteúdo fica encoberto após as correções.
- Reorganiza os botões do cabeçalho em um menu de painéis com abertura controlada e suporte a teclado e leitores de tela.
- Sincroniza o comportamento do novo menu entre os módulos JS e TS, garantindo fechamento automático ao navegar pelos painéis.
- Atualiza os estilos do cabeçalho para acompanhar o novo menu de painéis.
- Adiciona ao cabeçalho botões dedicados para abrir rapidamente os painéis administrativo e do usuário.
- Expande o menu móvel de acesso rápido com atalhos equivalentes aos novos botões do cabeçalho.
- Padroniza os estilos dos botões no CSS principal utilizando variáveis para que herdem as mesmas propriedades base.
- Substitui o painel administrativo por um layout inspirado no painel inicial com cards informativos, callouts e atalhos alinhados ao painel do usuário.
- Compartilha os estilos do painel inicial com o novo painel administrativo e remove a tabela legada para manter tokens visuais unificados.
- Consolida as alterações do dia 22 em uma única entrada do Log sem registro de horários.
- Atualiza o rodapé para refletir a versão consolidada do dia 22.

## v0.1.111 - 2025-10-21 23:30 BRT
- Atualiza o painel inicial para reutilizar o layout, os tokens visuais e os feedbacks do painel do usuário com cards informativos e atalhos rápidos.
- Amplia a folha de estilos com o grid compartilhado, botões de ação e destaques dedicados ao novo painel inicial.
- Atualiza o rodapé para exibir a versão v0.1.111 das 23h30.

## v0.1.110 - 2025-10-21 22:55 BRT
- Passa a medir dinamicamente as alturas do cabeçalho e do rodapé fixos, atualizando o espaçamento das views para impedir que o painel inicial volte a ficar sob o header.
- Reage às mudanças do rodapé móvel e do estado de sessão, agendando novas medições para manter o conteúdo visível em qualquer modo do MiniApp Base.
- Atualiza o rodapé para exibir a versão v0.1.110 das 22h55.

## v0.1.109 - 2025-10-21 21:05 BRT
- Adiciona controle no cabeçalho para abrir ou recolher o painel inicial com feedback visual e rótulos acessíveis.
- Inclui a nova ação no menu móvel reaproveitando o mesmo comportamento de alternância do painel inicial.
- Atualiza o rodapé para exibir a versão v0.1.109 das 21h05.

## v0.1.108 - 2025-10-21 20:15 BRT
- Impede que os widgets do painel do usuário se sobreponham ao exibir duas colunas, reajustando os limites responsivos da grade.
- Atualiza o rodapé para exibir a versão v0.1.108 das 20h15.

## v0.1.107 - 2025-10-21 19:30 BRT
- Ajusta o container central do painel de log aplicando espaçamento equivalente ao cabeçalho e ao rodapé para impedir que o conteúdo fique oculto nas extremidades fixas.
- Atualiza o rodapé para exibir a versão v0.1.107 das 19h30.

## v0.1.106 - 2025-10-21 18:55 BRT
- Centraliza o cartão do painel de cadastro ajustando o alinhamento vertical das views de autenticação, garantindo preenchimento uniforme sem interferência de outros elementos.
- Revalida visualmente o painel de cadastro em tamanhos de tela móvel, tablet e desktop para confirmar a centralização consistente do cartão.
- Atualiza o rodapé para exibir a versão v0.1.106 das 18h55.

## v0.1.105 - 2025-10-21 17:40 BRT
- Recentra o cartão de boas-vindas ajustando o comportamento do `<main>` para centralizar a view de saudação sem sobreposição do cabeçalho fixo.
- Refina a classe `main--greeting` para posicionar o cartão considerando os espaços reservados do cabeçalho e do rodapé fixos.
- Ajusta o preenchimento interno do painel do usuário para impedir que o rodapé fixo cubra os widgets e eliminar o excesso de largura exibido na tela.
- Revalida visualmente apenas o painel do usuário confirmando que o conteúdo deixa espaço de segurança para o cabeçalho e o rodapé fixos.
- Atualiza o rodapé para exibir a versão v0.1.105 das 17h40.

## v0.1.104 - 2025-10-21 16:20 BRT
- Implementa um gerenciador central de tema que respeita o modo do sistema, persiste a escolha localmente e sincroniza com a sessão ativa.
- Adiciona ao painel do usuário um seletor acessível de tema com opções Claro, Escuro e Automático, incluindo feedback dedicado e salvamento imediato nas preferências.
- Refatora a paleta visual com variáveis de cor para suportar Light/Dark Mode, troca dinamicamente logotipos e ícones conforme o tema e ajusta elementos decorativos.
- Ajusta o seletor de tema e o painel do usuário para rodarem nos testes Node sem depender de elementos DOM nativos.
- Atualiza o rodapé para exibir a versão v0.1.104 das 16h20.

## v0.1.103 - 2025-10-21 12:50 BRT
- Corrige o estouro horizontal do painel de usuário garantindo que os resumos de acesso respeitem a largura disponível.
- Ajusta a quebra e o comportamento flexível dos textos longos para manter o cartão central dentro da grade.
- Atualiza o rodapé para exibir a versão v0.1.103 das 12h50.

## v0.1.102 - 2025-10-21 11:45 BRT
- Substitui o padding percentual das views por espaçamentos fixos em clamp para alinhar o painel do usuário às laterais sem encolher em telas amplas.
- Remove os limites de largura e a centralização automática dos formulários do painel do usuário para que os widgets ocupem toda a grade disponível.
- Atualiza o rodapé para exibir a versão v0.1.102 das 11h45.

## v0.1.101 - 2025-10-21 11:00 BRT
- Replica o modelo de gavetas do cartão "Perfil completo" no widget "Dados de acesso" com seções de Logs do sistema, Sessão e Preferências.
- Move o resumo de acesso, o estado da sessão e os campos de telefone e senha para os novos agrupadores mantendo ações e feedbacks ativos.
- Ajusta a folha de estilos para acomodar os novos contêineres internos das gavetas.
- Atualiza o rodapé para exibir a versão v0.1.101 das 11h00.

## v0.1.100 - 2025-10-21 10:05 BRT
- Acrescenta ao cartão "Dados de acesso" um resumo compacto com telefone formatado, tipo de usuário, dispositivo reconhecido e registro da última atualização.
- Disponibiliza atalho para copiar o telefone cadastrado com feedback imediato, reforçando o texto introdutório para orientar o uso do widget.
- Ajusta os estilos do painel para acomodar o novo bloco de resumo e atualiza o rodapé para a versão v0.1.100 das 10h05.
- Suaviza a tipografia do painel, aplicando antisserrilhamento global e reduzindo o contraste do resumo de acesso com fundo branco e cores mais leves.
- Valida visualmente o painel do usuário em tablet (768x1024 e 1024x768), confirmando o cartão central limpo e responsivo em retrato e paisagem.
- Recolhe o texto auxiliar da seção "Sessão e segurança" e reduz os botões de ação para deixá-los mais discretos na interface.

## v0.1.99 - 2025-10-21 05:15 BRT
- Padroniza o layout chapado do MiniApp Base aplicando o contêiner compartilhado aos painéis centrais e removendo bordas, sombras e larguras redundantes, incluindo o cartão de boas-vindas.
- Harmoniza o painel administrativo com a mesma malha do painel do usuário, reaproveitando tokens globais e classes compartilhadas sem depender de estilos paralelos.
- Reorganiza o painel do usuário em widgets compactos com o bloco “Sessão e segurança” integrado, campos redistribuídos e espaçamentos unificados.
- Implanta autosave para telefone, senha e perfis completos via helper reutilizável que controla feedbacks, estados ocupados e bloqueia submissões implícitas.
- Integra consulta ViaCEP para preencher endereço automaticamente, tratando cancelamentos, mensagens específicas e testes dedicados ao fluxo de persistência.

## v0.1.98 - 2025-10-21 02:45 BRT
- Reorganiza o grupo "Endereço e documentação" colocando o campo de CEP na primeira posição do grid.
- Implementa busca automática de endereço via ViaCEP com normalização, feedback discreto e preenchimento condicional dos campos.
- Garante cancelamento seguro da busca ao alterar ou limpar o CEP e adiciona testes para o serviço e a nova ordem dos campos.

## v0.1.97 - 2025-10-21 01:15 BRT
- Recompõe o painel do usuário com três widgets de primeiro nível (dados de acesso, perfil completo e sessão) usando contêiner único para cada bloco.
- Centraliza o título principal na área do painel e atualiza a grade interna para acomodar os widgets em diferentes larguras sem rolagens extras.
- Ajusta o CSS para o novo padrão de widgets, garantindo espaçamentos, responsividade e aparência consistente entre os formulários.
- Atualiza o rodapé para refletir a versão v0.1.97 com horário correspondente.

## v0.1.96 - 2025-10-20 23:50 BRT
- Reestrutura o painel do usuário com título único e formulários alinhados ao padrão dos fluxos de login e cadastro.
- Converte o feedback do painel em helper compartilhado reutilizando o estilo dos formulários de autenticação.
- Agrupa os campos complementares em seções colapsáveis e inclui um atalho de login quando não há sessão ativa.
- Atualiza o rodapé para refletir a versão v0.1.96 com horário correspondente.
- Recentraliza o painel do usuário no mesmo cartão das telas de autenticação e suaviza os blocos internos para manter a consistência visual.

## v0.1.95 - 2025-10-20 21:20 BRT
- Ajusta o rodapé móvel para exibir apenas a linha principal e expandir as demais informações ao toque.
- Converte o selo da marca em botão acessível com setas indicativas e recolhe as ações adicionais por padrão no mobile.
- Atualiza a caixa de validação das condições legais para fundo branco com borda preta.
- Atualiza o rodapé para refletir a versão v0.1.95 com horário correspondente.

## v0.1.94 - 2025-10-20 20:45 BRT
- Remove o título textual "MiniApp Base" do cabeçalho, mantendo somente o logotipo no topo.
- Atualiza o rodapé para refletir a versão v0.1.94 com horário correspondente.

## v0.1.93 - 2025-10-20 20:25 BRT
- Simplifica o painel de cadastro mantendo apenas orientações essenciais e indica no campo "Crie uma senha" que são necessários 8 dígitos.
- Atualiza o rodapé para refletir a versão v0.1.93 com horário correspondente.
- Adiciona link para usuários já cadastrados abrirem rapidamente o painel de login a partir do cadastro.
- Reposiciona o lembrete de login dentro do formulário, realçando a mensagem auxiliar sem expandir o cartão do cadastro.
- Padroniza o layout dos painéis de autenticação com classes compartilhadas para título, introdução, formulário e feedback, mantendo espaçamentos idênticos no login e cadastro.
- Mantém os campos de DDI e telefone alinhados na mesma linha nos painéis de login e cadastro, reutilizando a máscara responsiva para ambos os fluxos.

## v0.1.92 - 2025-10-20 23:10 BRT
- Permite alternar a visualização da senha no formulário "Editar dados principais" do painel administrativo.
- Redistribui os campos do formulário em múltiplas colunas com larguras ajustadas para cada informação.
- Atualiza o rodapé para refletir a versão v0.1.92 com horário correspondente.
- Substitui o texto dos botões de senha por ícones que indicam visualizar ou ocultar nos painéis administrativo e do usuário.

## v0.1.91 - 2025-10-20 17:45 BRT
- Sincroniza o IndexedDB global com a lista de cadastros locais ao adicionar, atualizar, remover ou carregar usuários.
- Persiste o identificador da sessão ativa no armazenamento global ao autenticar ou encerrar usuários, permitindo abrir o painel inicial automaticamente.
- Mantém o painel do usuário ativo após salvar edições nos dados pessoais e exibe no rodapé a mensagem positiva de que a memória foi atualizada.
- Atualiza o rodapé para refletir a versão v0.1.91 com horário correspondente.

## v0.1.90 - 2025-10-20 18:00 BRT
- Reestrutura o painel administrativo para que o contêiner do widget mantenha apenas o título e a tabela, replicando o ajuste de largura aplicado ao painel de login.
- Ajusta a linha de corte entre mobile e desktop do painel administrativo para manter o layout de tabela em tablets na vertical e horizontal.
- Conserva o espaçamento compacto da visão administrativa sem converter a tabela em cartões em dispositivos intermediários.
- Atualiza o rodapé para refletir a versão v0.1.90 com horário correspondente.
- Exibe o primeiro nome do usuário autenticado diretamente no indicador de sessão do rodapé.

## v0.1.89 - 2025-10-20 21:40 BRT
- Registra no README as boas práticas de testes visuais móveis, listando Galaxy S24, iPhone 14 Pro e Pixel 7 como aparelhos padrão.
- Estabelece a captura obrigatória em modos vertical e horizontal para cada dispositivo móvel e resume o procedimento para tablet e desktop.
- Atualiza o rodapé para refletir a versão v0.1.89 com horário correspondente.

## v0.1.88 - 2025-10-20 21:00 BRT
- Mantém a tabela de clientes no formato tabular original em telas verticais utilizando contêiner com rolagem horizontal suave.
- Ajusta os estilos responsivos para evitar a conversão dos registros em cartões e preservar o cabeçalho completo.
- Atualiza a versão exibida no rodapé para refletir a release v0.1.88.

## v0.1.87 - 2025-10-20 20:30 BRT
- Exibe o tipo de usuário (administrador, colaborador ou usuário) diretamente na lista principal do painel administrativo com edição disponível nos detalhes expandidos.
- Persiste o tipo padronizado no armazenamento local, incluindo novas opções no cadastro, atualização e filtros de pesquisa.
- Ajusta os estilos da tabela e do seletor para acomodar o novo campo, atualizando a versão do rodapé e a cobertura automatizada.

## v0.1.86 - 2025-10-20 19:45 BRT
- Inclui campo de senha no formulário "Editar dados principais" do painel administrativo com validação antes de atualizar as credenciais.
- Sincroniza o estado de edição com a nova credencial e mantém os controles desabilitados durante salvamentos ou exclusões.
- Atualiza o rodapé para a versão v0.1.86 com horário correspondente.

## v0.1.85 - 2025-10-20 19:10 BRT
- Adiciona ação de exclusão de clientes no painel administrativo com confirmação de segurança e alerta de sucesso.
- Desabilita os campos e botões de edição durante salvamentos ou exclusões para evitar conflitos simultâneos.
- Atualiza o rodapé para a versão v0.1.85 com horário correspondente.

## v0.1.84 - 2025-10-20 18:00 BRT
- Remove os rótulos visíveis dos campos de código do país e número, mantendo os exemplos diretamente nos placeholders dinâmicos.
- Restaura a orientação de senha com placeholder e dica mínima destacando os oito caracteres entre letras e números.
- Reintroduz o início da frase de consentimento legal ao lado da caixa de seleção preservando o estilo minimalista.
- Atualiza o rodapé para a versão v0.1.84 com horário correspondente.
- Refina o botão móvel de acesso rápido removendo o texto “Acesso”, preservando apenas o ícone sem contornos visíveis e mantendo a identificação acessível.

## v0.1.83 - 2025-10-20 15:30 BRT
- Adiciona sobreposição desfocada ao abrir a legenda de estados da sessão, destacando o painel em telas móveis.
- Inclui botão dedicado de fechar e suporte a clique no fundo para encerrar o popover de forma intuitiva e acessível.
- Ajusta o cabeçalho e estilos do popover para acomodar as novas ações e atualiza o rodapé para a versão v0.1.83.
- Move o popover e a sobreposição para o corpo da página e aplica desfoque/atenuação global aos elementos de fundo quando a legenda estiver aberta.
- Refatora o shell para um sistema de modais centralizados reutilizável, com menu móvel no cabeçalho, legenda de sessão padronizada e foco gerenciado automaticamente.
- Simplifica o blur do plano de fundo sem reduzir opacidade, atualiza o CSS dos modais e reorganiza os indicadores do rodapé para manter duas linhas no mobile.
- Ajusta a formatação dos telefones nacionais e internacionais após a divisão em DDI e número, garantindo exibição consistente nas diferentes rotas.

## v0.1.82 - 2025-10-20 11:40 BRT
- Implementa e fortalece o bootstrap assíncrono baseado exclusivamente no IndexedDB, com logs resilientes e tratamento para contas órfãs.
- Integra o roteador nomeado ao shell exibindo splash mínimo até a decisão final e garantindo navegação consistente entre dashboard, login e cadastro.
- Mantém os testes automatizados de seleção de rota e integração DOM cobrindo os cenários de sessão ativa, cadastros sem sessão, banco vazio e sessão órfã.
- Estabelece o processo de arquivamento de documentação, movendo a nota preliminar da v0.1.83 para `Arquivados/` e reforçando a atualização contínua desta edição.
- Acrescenta indicadores dedicados à memória e à sessão no rodapé, exibindo estados distintos para armazenamento vazio, usuário desconectado e sessão ativa, com cobertura automatizada dos novos cenários.
- Converte o indicador de sessão em um botão com popover explicativo dos estados possíveis, mantendo anúncios acessíveis e interação ajustada para telas móveis.

## v0.1.81 - 2025-10-20 09:55 BRT
- Remove o preenchimento automático de foco ao abrir a edição de clientes no painel administrativo.
- Limita o cartão expansível aos campos editáveis, ocultando dados apenas informativos.

## v0.1.80 - 2025-10-20 09:45 BRT
- Recompõe o widget da tabela de clientes com espaçamento compacto entre colunas e linhas, aproximando o visual de uma tabela do Google.
- Simplifica botões, campos e bloco de detalhes para um estilo neutro, mantendo o foco na leitura dos dados no painel administrativo.
- Ajusta o comportamento responsivo para manter a aparência funcional em telas menores sem sombras excessivas.

## v0.1.79 - 2025-10-20 09:20 BRT
- Simplifica o painel administrativo com o widget de tabela de clientes cadastrados, destacando colunas fixas e único botão de edição para expandir detalhes.
- Centraliza a edição dos dados principais dentro do painel expandido e organiza os demais campos informativos em blocos legíveis.
- Atualiza os estilos do painel para acomodar o novo fluxo mantendo pesquisa, filtros e ordenação ativos.

## v0.1.78 - 2025-10-20 09:00 BRT
- Aprimora o painel administrativo com barra de busca, resumo dinâmico e ordenação configurável para localizar usuários rapidamente.
- Acrescenta coluna de e-mail com edição direta durante a gestão de contatos e mantém os detalhes sincronizados após atualizações.
- Cria utilidades compartilhadas para filtragem/ordenação com cobertura automatizada garantindo a consistência das novas regras.

## v0.1.77 - 2025-10-20 08:50 BRT
- Formata a exibição dos telefones no painel administrativo após novos cadastros, garantindo leitura clara e fallback quando o dado estiver ausente.
- Reaproveita a formatação amigável ao destacar o telefone confirmado na tela de sucesso do cadastro.
- Amplia as utilidades de validação com suporte à formatação e inclui testes automatizados para cobrir os novos cenários.

## v0.1.76 - 2025-10-20 08:40 BRT
- Implementa validações de telefone aceitando formato internacional com `+` e restringindo celulares nacionais a 11 dígitos iniciando em 9, com sanitização antes de salvar.
- Impõe requisitos mínimos de senha com 8 caracteres e combinação de letras com números ou símbolos, exibindo orientações diretas no formulário.
- Acrescenta mensagens de apoio visuais para telefone e senha, além de testes automatizados para cobrir as novas regras de validação.

## v0.1.75 - 2025-10-20 08:10 BRT
- Ajusta o indicador de memória para exibir apenas o rótulo “Memória” seguido do status correspondente.
- Atualiza o texto padrão do status de armazenamento em todo o aplicativo para refletir o novo formato sem o separador pontuado.
- Incrementa o rodapé para a versão v0.1.75 com horário atualizado no botão de histórico.

## v0.1.74 - 2025-10-20 07:50 BRT
- Remove o link de termos legais do rodapé para simplificar as ações e focar nos status principais.
- Atualiza o indicador de memória para exibir somente o rótulo “Memória” acompanhado do estado atual.

## v0.1.73 - 2025-10-20 07:40 BRT
- Simplifica o indicador de versão no rodapé para exibir apenas o código curto alinhado ao estilo do estado da memória.
- Atualiza os textos auxiliares para refletirem a release v0.1.73.

## v0.1.72 - 2025-10-20 07:29 BRT
- Corrige a restauração da sessão persistida ao aguardar a sincronização dos usuários antes de limpar o login.
- Mantém a versão exibida no rodapé alinhada à release publicada.

## v0.1.71 - 2025-10-20 04:30 BRT
- Recriação do painel do usuário com cartões segmentados para credenciais, dados pessoais, contatos e endereço, aplicando um layout em grade responsivo.
- Inclusão de novos campos de perfil (pronome, data de nascimento, profissão, empresa, biografia, redes sociais e endereço detalhado) com persistência no store e atualização automática do formulário.
- Ajustes visuais para destacar o usuário autenticado, harmonizar cores, aprimorar tipografia dos grupos e garantir responsividade em diferentes larguras móveis.
- Validação visual do painel atualizado em dispositivos móveis pequenos e médios, confirmando a responsividade antes da liberação.

## v0.1.70 - 2025-10-20 03:45 BRT
- Implementa modo de armazenamento em memória para execuções de teste garantindo compatibilidade com ambientes sem IndexedDB.
- Expõe rotina de reinicialização do store de usuários para facilitar ciclos de teste e limpar assinantes remanescentes.
- Configura suíte `npm test` com Node Test para validar cadastro, autenticação, atualização e remoção de usuários.
- Introduz um EventBus central para propagar navegação, sessão ativa e estado da memória entre os módulos da aplicação.
- Atualiza os painéis de login, cadastro e usuário para emitirem eventos através do barramento compartilhado.
- Conecta o indicador de memória e o cabeçalho ao novo EventBus e registra a versão no rodapé.
- Trata o bloqueio do IndexedDB por outras abas sinalizando o erro imediatamente ao indicador de memória.

## v0.1.67 - 2025-10-20 03:05 BRT
- Reduz o respiro vertical do conteúdo principal e alinha os cartões ao topo para eliminar grandes áreas vazias.
- Permite que o cartão de login diminua conforme o conteúdo mantendo apenas o limite máximo de altura.
- Corrige o painel de login para autenticar usuários existentes sem gerar novos cadastros e manter o dispositivo sincronizado.
- Adiciona um indicador no rodapé que sinaliza o estado da memória IndexedDB com feedback visual e acessível, atualizado em tempo real.
- Atualiza o rodapé para refletir a versão publicada após os ajustes consolidados.

## v0.1.66 - 2025-10-19 22:30 BRT
- Remove o card de cadastros enviados do painel do usuário e foca os formulários no usuário autenticado.
- Simplifica a lógica do painel para depender apenas da sessão ativa, com mensagens e feedbacks ajustados ao novo fluxo.
- Atualiza o layout e os estilos para acomodar a estrutura reduzida do painel e registra a nova versão no rodapé.

## v0.1.65 - 2025-10-19 22:10 BRT
- Adiciona botões de logoff, logout e remoção completa dos dados diretamente no painel do usuário.
- Sincroniza o painel com a sessão ativa para habilitar ações apenas quando houver usuário autenticado e destacar o cadastro correspondente.
- Ajusta os estilos do painel para acomodar o bloco de segurança com feedbacks visuais consistentes.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.64 - 2025-10-19 21:40 BRT
- Garante que os botões de cadastro e login fiquem ocultos quando houver um usuário autenticado, exibindo apenas o avatar com iniciais no cabeçalho.
- Mantém o botão de avatar funcional para abrir o painel do usuário e remove qualquer resquício visual dos botões ocultos.
- Atualiza a versão mostrada no rodapé para refletir a nova release.

## v0.1.63 - 2025-10-19 21:10 BRT
- Implementa um store de sessão persistente para manter o usuário autenticado entre cadastros e acessos.
- Exibe a confirmação dedicada de cadastro concluído com acesso rápido ao painel do usuário.
- Substitui os links de cadastro/login por um botão com as iniciais do usuário ativo no cabeçalho.
- Atualiza o painel de login para ativar a sessão e navegar diretamente para o painel do usuário.
- Atualiza a versão apresentada no rodapé para refletir a nova release.

## v0.1.62 - 2025-10-19 20:20 BRT
- Compacta o cartão de cadastro em modo retrato reduzindo o padding, gaps da view e espaçamentos do formulário.
- Faz o botão "Criar conta" dimensionar pela largura do texto mantendo o alinhamento centralizado.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.61 - 2025-10-19 19:50 BRT
- Substitui o botão de concordância legal por uma caixa de seleção direta no formulário de cadastro.
- Integra o link "Saiba mais" ao texto de consentimento para facilitar o acesso aos documentos legais.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.60 - 2025-10-19 19:30 BRT
- Adiciona controle de concordância com os termos legais antes de concluir o cadastro.
- Disponibiliza link direto para a documentação legal a partir do painel de cadastro compacto.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.59 - 2025-10-19 19:05 BRT
- Simplifica o painel de cadastro para solicitar apenas telefone e senha antes de criar a conta.
- Ajusta o layout do formulário de cadastro para acomodar o fluxo compacto em diferentes larguras de tela.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.58 - 2025-10-19 18:40 BRT
- Reduz os espaçamentos verticais do cartão de cadastro ajustando padding interno e distância entre seções.
- Compacta o formulário de cadastro para aproximar os campos e diminuir deslocamentos na rolagem.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.57 - 2025-10-19 18:20 BRT
- Reestrutura o rodapé em telas móveis para distribuir marca e ações em múltiplas linhas com mais espaçamento.
- Permite que o texto institucional quebre em múltiplas linhas e aumenta a legibilidade dos controles na base.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.56 - 2025-10-19 17:54 BRT
- Simplifica o painel de login para solicitar apenas telefone e senha com o botão "Entrar".
- Ajusta o armazenamento local para aceitar logins sem nome cadastrado.
- Reduz o padding interno do painel de login para aproximar o formulário das bordas do cartão.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.55 - 2025-10-19 17:40 BRT
- Remove o contêiner de ações e os botões extras do painel de cadastro para manter o foco no formulário principal.
- Reposiciona o cartão do painel de cadastro, reduzindo padding e centralizando o widget com largura limitada e espaçamento compacto.
- Faz o cartão respeitar a altura da viewport e ativa rolagem interna, além de organizar o formulário em duas colunas em telas largas.
- Atualiza a versão exibida no rodapé para refletir a release consolidada.

## v0.1.54 - 2025-10-19 17:01 BRT
- Adiciona link textual de login no cabeçalho apontando para o painel de login existente.
- Atualiza os estilos do cabeçalho para destacar o novo link no canto superior direito.
- Atualiza a versão exibida no rodapé para refletir a nova release.
- Adiciona botão de "Cadastro" no cabeçalho que abre o novo painel dedicado para criação de contas.
- Implementa painel de cadastro com formulário completo, validação de senha e registro opcional de e-mail.
- Ajusta estilos responsivos do cabeçalho e dos painéis de acesso para acomodar os novos atalhos.
- Reduz o tamanho das fontes dos dados exibidos na tabela administrativa para facilitar a leitura de grandes volumes.
- Mantém o destaque das informações principais do usuário com hierarquia tipográfica ajustada.
- Atualiza a versão apresentada no rodapé para refletir a nova release.
- Reorganiza o painel administrativo em cartões responsivos para tablets em orientação retrato e paisagem.
- Exibe rótulos de contexto em cada célula para manter a leitura da tabela sem cabeçalhos fixos em telas estreitas.
- Atualiza a versão apresentada no rodapé para refletir a nova release.
- Remove o bloco reservado às ferramentas internas do painel administrativo para liberar o espaço de conteúdo.
- Ajusta os estilos do painel administrativo para manter os parágrafos alinhados sem a área extra.
- Atualiza a versão apresentada no rodapé para refletir a nova release.
- Converte todos os fundos da interface (exceto cabeçalho e rodapé) para branco ou transparente, mantendo os demais destaques com bordas e sombras.
- Ajusta botões e cartões para preservar contraste sem recorrer a fundos coloridos.
- Atualiza a versão exibida no rodapé para refletir a nova release.
- Reduz os espaçamentos verticais do painel administrativo em tablets na orientação vertical.
- Alinha os cartões e conteúdos do painel administrativo ao topo e à lateral esquerda para evitar áreas vazias.
- Atualiza a versão exibida no rodapé para refletir a nova release.
- Ajusta o histórico e o rodapé para publicar a release consolidada.

## v0.1.53 - 2025-10-19 16:06 BRT
- Alinha o processo de revisão para que cada nova release incremente apenas uma unidade em relação à versão exibida.
- Atualiza o rodapé para mostrar a versão v0.1.53 conforme a regra revisada.
- Recalibra o horário da release v0.1.52 para refletir corretamente o registro em BRT.

## v0.1.52 - 2025-10-19 16:00 BRT
- Ajusta a formatação dos campos dos formulários para impedir sobreposição entre rótulos e entradas.
- Garante que os contêineres de formulário usem toda a largura disponível com alinhamento consistente nos painéis de login e usuário.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.51 - 2025-10-19 15:49 BRT
- Adiciona dica de ferramenta ao texto institucional do rodapé para preservar a leitura completa mesmo com elipse.
- Atualiza o botão de versão com rótulos acessíveis descrevendo a navegação e a versão exibida.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.50 - 2025-10-19 18:15 BRT
- Reorganiza a marca, termos legais e versão do rodapé em uma única linha sem quebras extras.
- Atualiza o layout e estilos para evitar múltiplas colunas e garantir alinhamento contínuo em qualquer largura.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.49 - 2025-10-19 17:45 BRT
- Harmoniza a largura e a altura dos painéis de login e usuário com o padrão estabelecido no painel administrativo.
- Reduz os tamanhos de fonte dos títulos, textos e controles dos painéis para se aproximar da tipografia do cabeçalho e do rodapé.
- Atualiza estilos relacionados aos botões e textos para manter a leitura consistente após o ajuste tipográfico.

## v0.1.48 - 2025-10-19 17:15 BRT
- Cria um painel de login dedicado com formulário de acesso e atalho para abrir o painel do usuário.
- Transfere o formulário de cadastro do painel do usuário para o novo fluxo de login, ajustando o layout de gerenciamento.
- Atualiza estilos, roteamento e rodapé para refletir o novo painel e a versão mais recente do aplicativo.

## v0.1.47 - 2025-10-19 16:45 BRT
- Ajusta o grid do painel do usuário para que seus blocos ocupem toda a altura disponível, mantendo a proporção do painel administrativo.
- Valida visualmente o painel do usuário e o menu dedicado em múltiplas larguras, garantindo que a experiência permaneça consistente.
- Atualiza o rodapé para exibir a nova versão do aplicativo.

## v0.1.46 - 2025-10-19 16:15 BRT
- Estende o contêiner principal do painel do usuário para ocupar toda a altura útil assim como o painel administrativo.
- Ajusta o grid interno do painel do usuário para distribuir melhor o espaço vertical entre formulário, cadastros e detalhes.
- Atualiza o rodapé para exibir a nova versão do aplicativo.

## v0.1.45 - 2025-10-19 15:45 BRT
- Amplia o painel do usuário para ocupar toda a área disponível com o mesmo tamanho do painel administrativo.
- Reorganiza o formulário, lista de cadastros e detalhes em seções estruturadas com layout em colunas responsivas.
- Ajusta estilos do painel do usuário para alinhar textos, melhorar feedbacks e reforçar a leitura dos conteúdos.
- Atualiza o rodapé para exibir a nova versão do aplicativo.

## v0.1.44 - 2025-10-19 15:15 BRT
- Transforma a ação de edição do painel administrativo em atualização inline com botões dedicados de salvar e cancelar na própria linha.
- Bloqueia interações concorrentes enquanto uma linha está em edição e mantém o foco dos campos ao alternar estados.
- Ajusta os estilos da tabela para destacar o modo de edição e aplica aparência específica aos novos controles.
- Atualiza o rodapé para exibir a nova versão do aplicativo.

## v0.1.43 - 2025-10-19 14:45 BRT
- Permite que o usuário selecione um cadastro para revisar telefone e senha, além de complementar o perfil com e-mail, endereço e observações.
- Sincroniza os novos dados extras com o armazenamento e exibe os campos atualizados no painel administrativo.
- Acrescenta ao painel administrativo um botão de detalhes que expande cada linha para mostrar o cadastro completo.

## v0.1.42 - 2025-10-19 14:05 BRT
- Amplia o cadastro do usuário para exigir nome completo e registrar data da última atualização.
- Exibe os usuários no painel administrativo em tabela com colunas de nome, telefone, registro, última alteração e ações.
- Disponibiliza botões de edição e exclusão com atualização imediata das informações armazenadas.
- Atualiza a versão mostrada no rodapé para refletir a nova release.

## v0.1.41 - 2025-10-19 13:47 BRT
- Exibe no painel do usuário a lista dos cadastros realizados com destaque para o envio mais recente.
- Ajusta os estilos do painel para apresentar os dados cadastrados de forma clara e responsiva.
- Valida visualmente o fluxo de cadastro confirmando atualização automática dos painéis do usuário e administrativo.

## v0.1.40 - 2025-10-19 13:25 BRT
- Exibe mensagem de confirmação acessível após concluir o cadastro no painel do usuário.
- Refatora o formulário para reutilizar a rotina de limpeza do feedback antes de cada envio.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.39 - 2025-10-19 13:15 BRT
- Implementa persistência dos cadastros de usuários no IndexedDB com sincronização automática dos painéis.
- Registra e preserva o identificador do dispositivo ao cadastrar usuários, exibindo o dado na lista administrativa.
- Adiciona tratamento de erros e feedback específico no painel do usuário quando o armazenamento local falha.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.38 - 2025-10-19 13:03 BRT
- Ajusta o contêiner principal para deixar o painel administrativo fixo, sem folgas verticais extras entre cabeçalho e rodapé.
- Recalcula a altura disponível quando o painel administrativo está ativo para que o cartão use 100% do espaço e mantenha sua própria rolagem.
- Atualiza a versão exibida no rodapé e valida visualmente o painel administrativo com o novo layout.

## v0.1.37 - 2025-10-19 12:56 BRT
- Ajusta o painel administrativo para ocupar toda a altura disponível do espaço central com dimensões fixas.
- Garante que o painel administrativo gerencie sua própria rolagem quando o conteúdo ultrapassar o espaço visível.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.36 - 2025-10-19 12:55 BRT
- Reconfigura o painel administrativo para ocupar toda a área central com largura total e preenchimento expandido.
- Ajusta alinhamentos e espaçamentos do painel para aproveitar melhor o espaço disponível, mantendo responsividade.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.35 - 2025-10-19 12:41 BRT
- Implementa armazenamento centralizado para cadastros de usuários com notificação de assinantes das views.
- Exibe no painel administrativo a lista atualizada de usuários com máscara de senha e ordenação por data de criação.
- Permite registrar novos usuários pelo painel do usuário com feedback imediato ao concluir ou falhar no cadastro.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.34 - 2025-10-19 11:05 BRT
- Adiciona botão dedicado aos termos legais no rodapé conectando o painel interativo existente.
- Ajusta a tipografia e o foco do novo atalho para manter acessibilidade e alinhamento com os demais itens do rodapé.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.33 - 2025-10-19 10:59 BRT
- Ajusta espaçamentos, tipografia e colunas do rodapé para evitar cortes em telas móveis estreitas mantendo tudo em linha única.
- Aplica regras específicas para dispositivos até 370px garantindo alinhamento uniforme sem quebrar os termos legais nem o rótulo de versão.
- Validação visual dedicada em múltiplas larguras mobile para confirmar espaçamentos horizontais e verticais consistentes.

## v0.1.32 - 2025-10-19 10:38 BRT
- Adiciona tom plano compartilhado no cabeçalho e rodapé, removendo o efeito translúcido anterior.
- Remove a cor de fundo do painel central para destacar o degradê base.
- Padroniza os painéis centrais com 5% de padding e conteúdo centralizado.

## v0.1.31 - 2025-10-19 10:34 BRT
- Mantém o rodapé em linha única com ícone, termos legais centralizados e rótulo de versão alinhado à direita.
- Ajusta o espaçamento e as restrições de quebra para minimizar a altura ocupada pelo rodapé em diferentes telas.
- Revisão completa dos horários do histórico para refletir a linha do tempo real até o momento da release.

## v0.1.30 - 2025-10-19 10:32 BRT
- Centraliza o bloco de termos legais no rodapé mantendo o ícone da marca com o mesmo tamanho.
- Harmoniza a tipografia entre o texto institucional e o rótulo da versão, preservando a versão alinhada à direita.
- Validação visual do rodapé em larguras mobile e desktop para confirmar alinhamentos e responsividade.

## v0.1.29 - 2025-10-19 10:28 BRT
- Reestrutura o rodapé para centralizar o bloco com logotipo e texto institucional mantendo o ícone no mesmo tamanho.
- Ajusta os estilos para aplicar texto translúcido alinhado ao cabeçalho e posicionar o rótulo de versão à direita.
- Valida visualmente a apresentação do rodapé em diferentes larguras para garantir responsividade.

## v0.1.28 - 2025-10-19 10:24 BRT
- Remove o título textual da view de documentos legais para manter o painel apenas com o conteúdo solicitado.
- Ajusta o contêiner da view legal para anunciar o contexto aos leitores de tela sem exibir o texto visível.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.27 - 2025-10-19 10:20 BRT
- Adiciona no rodapé o ícone corporativo com a mensagem de Copyright e atalho para abrir os documentos legais no painel central.
- Cria a nova view de documentos legais carregando a página oficial em um iframe com alternativa acessível.
- Ajusta os estilos do rodapé e do novo painel para manter a experiência responsiva e alinhada ao visual atual.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.26 - 2025-10-19 10:15 BRT
- Ajusta o espaçamento e a quebra automática dos títulos para impedir cortes do texto em celulares.
- Valida visualmente as telas de Log, Painel Administrativo, Painel Inicial e Painel do Usuário em smartphones e tablet comuns.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.25 - 2025-10-19 10:10 BRT
- Ajusta o painel central para exibir barras de rolagem finas e consistentes em tablets e celulares.
- Prevê navegadores sem suporte a `preventScroll` ao focar as views, garantindo troca de telas estável no tablet.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.24 - 2025-10-19 10:00 BRT
- Criação do painel do usuário com formulário inicial solicitando telefone e senha.
- Inclusão do botão de acesso à conta no cabeçalho para abrir rapidamente o novo painel.
- Atualização da versão exibida no rodapé para refletir a nova release.

## v0.1.23 - 2025-10-19 09:50 BRT
- Cria o painel inicial acessível ao clicar no título do cabeçalho, exibindo temporariamente apenas o título.
- Registra a nova view no roteador central para suportar o painel inicial.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.22 - 2025-10-19 09:40 BRT
- Aprimora a renderização do Log com novos estilos que aumentam o contraste do texto, ajustam a largura do painel e refinam o cartão para leitura confortável.
- Adiciona feedback visual e acessível ao carregamento do `Log.md`, com estados de carregamento, foco e erro mais claros.
- Atualiza a versão exibida no rodapé para refletir a nova release.

## v0.1.21 - 2025-10-19 09:30 BRT
- Corrige o posicionamento do rodapé para permanecer rente à borda inferior em dispositivos com área segura.
- Ajusta o cálculo das alturas do layout para refletir a nova base do rodapé.

## v0.1.20 - 2025-10-19 09:20 BRT
- Garante que o conteúdo do Log seja exibido com legibilidade reforçada no painel.
- Amplia a largura do painel de histórico para facilitar a leitura das entradas.

## v0.1.19 - 2025-10-19 09:10 BRT
- Permite rolagem vertical no painel central respeitando o espaço entre cabeçalho e rodapé.
- Oculta a barra de rolagem para manter a experiência visual limpa em qualquer navegador.

## v0.1.18 - 2025-10-19 09:00 BRT
- Recalibração das variáveis de altura do cabeçalho e rodapé para manter ambos rente às bordas em retrato e paisagem.
- Redução do preenchimento, sombra e contraste do rodapé para deixá-lo mais discreto nas telas largas.
- Verificação visual das views de saudação, administração e log garantindo que o conteúdo não fique encoberto.

## v0.1.17 - 2025-10-19 08:50 BRT
- Ajuste da altura mínima e do preenchimento do rodapé para mantê-lo rente à borda inferior em orientação paisagem.
- Redução do espaçamento interno e da sombra do rodapé para deixá-lo visualmente mais discreto nas telas largas.

## v0.1.16 - 2025-10-19 08:40 BRT
- Refinamento dos cálculos de altura do cabeçalho e rodapé para manter o contato direto com as bordas e respeitar as áreas seguras dos tablets.
- Ajuste dos espaçamentos internos dos elementos fixos para evitar folgas visuais sem encobrir o conteúdo principal.
- Inclusão de orientação no `AGENTS.md` exigindo a leitura do README e do Log antes de qualquer tarefa.

## v0.1.15 - 2025-10-19 08:30 BRT
- Fixação do cabeçalho e rodapé nas bordas da viewport utilizando posicionamento `fixed` com suporte a áreas seguras.
- Ajuste do preenchimento do conteúdo principal para evitar sobreposição pelos elementos fixos em qualquer orientação.
- Atualização da versão exibida no rodapé para refletir a nova release.

## v0.1.14 - 2025-10-19 08:20 BRT
- Implementação de view de contingência para telas desconhecidas garantindo feedback ao usuário.
- Registro do identificador da view ativa no `#view-root` para facilitar depuração e testes.
- Ajuste visual para mensagens de erro no painel central modularizado.

## v0.1.13 - 2025-10-19 08:10 BRT
- Externalização dos estilos para `styles/main.css`, mantendo o layout responsivo do painel central.
- Inclusão do link para a folha de estilos no `index.html` e atualização da versão exibida no rodapé.
- Preparação dos módulos de view para reutilizarem as classes de estilo compartilhadas.

## v0.1.14 - 2025-10-26 11:50 BRT
- Exposição do controle da prévia impressa para sincronizar versão selecionada com as ações de impressão.
- Atualização dos botões de impressão para refletirem automaticamente a alternância entre as versões de aluno e professor.
- Revisão da pré-visualização para manter o estado de versão armazenado no painel ao trocar de prova.

## v0.1.12 - 2025-10-19 08:00 BRT
- Modularização das telas em módulos ES6 com a função central `renderView`.
- Criação das views de saudação, administrativo e log renderizando o contêiner dinâmico.
- Carregamento assíncrono do `Log.md` ao acessar a view de histórico.

## v0.1.11 - 2025-10-19 07:50 BRT
- Substituição dos painéis estáticos por um único contêiner dinâmico `#view-root` no painel central.
- Preparação dos estilos para as futuras views moduladas mantendo as classes `.view--*`.
- Ajuste temporário do script para direcionar o foco ao novo contêiner enquanto a modularização é concluída.

## v0.1.10 - 2025-10-19 07:40 BRT
- Ajuste das datas e horários do histórico para refletir o horário atual de Brasília.
- Manutenção do padrão de registro em BRT garantindo consistência cronológica.

## v0.1.9 - 2025-10-19 07:30 BRT
- Reorganização estrutural para garantir que o cabeçalho permaneça alinhado ao topo da tela.
- Validação visual do cabeçalho fixo mantendo header e footer consistentes.

## v0.1.8 - 2025-10-25 06:25 BRT
- Tornamos a versão exibida no rodapé clicável para abrir o Log.md no painel central.
- Carregamento dinâmico do Log.md com preservação da área principal visível para header e footer.
- Padronização do log com horários em BRT e atualização das diretrizes no `AGENTS.md`.
- Inclusão da data do último acesso no widget de dados do usuário, atualizando tabela, resumo e visualização de exemplo.
- Registro automático do último acesso ao ativar uma sessão, mantendo o campo de atualização separado das alterações de perfil.

## v0.1.7 - 2025-10-19 07:10 BRT
- Adição do painel administrativo exibido ao clicar no logotipo do cabeçalho.
- Manutenção do cabeçalho e rodapé visíveis enquanto o painel substitui o conteúdo central.
- Atualização da versão mostrada no rodapé para refletir a nova release.

## v0.1.6 - 2025-10-19 07:00 BRT
- Inclusão do logotipo fornecido no canto esquerdo do cabeçalho, mantendo a altura original do componente.
- Atualização da versão exibida no rodapé para refletir a nova release.

## v0.1.5 - 2025-10-19 06:50 BRT
- Ajuste do layout para utilizar grid, garantindo que o rodapé permaneça alinhado ao final da página em qualquer altura de conteúdo.
- Centralização do conteúdo principal com grid, preservando a responsividade anterior.
- Atualização da versão exibida no rodapé para refletir a nova release.

## v0.1.4 - 2025-10-19 06:40 BRT
- Reestruturação do layout para manter o rodapé na posição correta em qualquer altura de conteúdo.
- Atualização do rodapé para exibir a nova versão do aplicativo.
- Registro no `AGENTS.md` da obrigatoriedade de atualizar a versão mostrada no rodapé.

## v0.1.3 - 2025-10-19 06:30 BRT
- Implementação de estilos responsivos para o layout principal e elementos fixos.
- Registro no `AGENTS.md` de que o aplicativo deve manter experiência responsiva.

## v0.1.2 - 2025-10-19 06:20 BRT
- Criação de cabeçalho fixo no topo com visual alinhado ao rodapé e ajuste do espaçamento da página.

## v0.1.1 - 2025-10-19 06:10 BRT
- Adição de rodapé fixo exibindo a versão do aplicativo e ajuste de espaçamento para não sobrepor o conteúdo.

## v0.1.0 - 2025-10-19 06:00 BRT
- Atualização do README para anunciar o início do novo projeto colaborativo.
- Criação do `AGENTS.md` com as diretrizes que devem ser seguidas antes de cada tarefa.
- Criação do `Log.md` para registrar versões e alterações futuras.
