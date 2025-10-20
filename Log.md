# Log

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
