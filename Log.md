# Log

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

## v0.1.8 - 2025-10-19 07:20 BRT
- Tornamos a versão exibida no rodapé clicável para abrir o Log.md no painel central.
- Carregamento dinâmico do Log.md com preservação da área principal visível para header e footer.
- Padronização do log com horários em BRT e atualização das diretrizes no `AGENTS.md`.

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
