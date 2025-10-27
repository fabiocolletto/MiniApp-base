# MiniApp-base

Estamos iniciando um novo projeto colaborativo. Vamos construir um aplicativo passo a passo, com solicitações simples e diretas. Leia cada instrução com atenção, execute exatamente o que for pedido e mantenha o histórico organizado nos arquivos auxiliares deste repositório.

Para acompanhar o progresso, consulte sempre:

- `AGENTS.md`: reúne as diretrizes vigentes para o projeto.
- `CHANGELOG.md`: registra cada alteração realizada, incluindo a versão correspondente.
- `temp/AGENTS.md`: descreve como organizar trabalhos temporários sempre que uma solicitação indicar que o desenvolvimento deve
  iniciar na pasta `temp/`.

Fique atento às próximas tarefas!

## Boas práticas para testes visuais

Quando for solicitado validar o aplicativo em dispositivos móveis, utilize sempre os três modelos abaixo para garantir uma
cobertura representativa entre tamanhos e densidades de tela:

- **Samsung Galaxy S24** – referência Android topo de linha e tela ampla.
- **Apple iPhone 14 Pro** – referência iOS com notch dinâmico e alta densidade.
- **Google Pixel 7** – referência Android "puro" com largura intermediária.

Execute dois testes visuais em cada modelo, um em modo **vertical (retrato)** e outro em **horizontal (paisagem)**, totalizando
seis capturas por rodada. Replique o mesmo procedimento apenas quando a solicitação mencionar explicitamente a versão mobile.

Para tablets e computadores, realize somente duas capturas: uma em modo vertical e outra em modo horizontal. Anote sempre o
modo, o modelo utilizado e compartilhe as imagens junto da resposta.
