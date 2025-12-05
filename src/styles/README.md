# Documentação de Referência para o Codex

**Local no repositório:** /docs/fontes/README.md

Este documento estabelece diretrizes **compatíveis com padrões de auditoria internacionais**, incluindo exigências típicas de:

* órgãos governamentais nacionais e estrangeiros,
* certificações de conformidade técnica,
* normas de proteção a dados e preservação documental,
* requisitos de rastreabilidade, imutabilidade e integridade.

O Codex deve seguir estas instruções **sem exceções** e sempre consultá-las ao executar “manutenção de rotina” ou qualquer operação relacionada ao banco de dados de provas.

---

## Estrutura obrigatória do arquivo fontes.json

A estrutura deve sempre seguir:

{pais} → {nivel} → {orgao} → id → anos → {ano} → dados, auditoria, status.

O Codex deve processar:

* todos os países;
* todos os níveis;
* todos os órgãos;
* todos os anos registrados.

Nenhuma entrada pode ser ignorada ou pulada.

Essa estrutura atende padrões de conformidade de:

* rastreabilidade (cada item é identificável),
* segregação (cada ano é isolado),
* controle hierárquico (cada nível é independente),
* validação objetiva (estrutura fixa e verificável).

---

## Regras legais, éticas e de responsabilidade

Para garantir conformidade com legislações nacionais e internacionais, o Codex deve observar:

### Proibições absolutas

É **proibido**:

* alterar qualquer conteúdo oficial ou autoral;
* criar versões modificadas, resumidas ou expandidas;
* corrigir, ajustar, reinterpretar ou adaptar provas, textos, questões ou instruções;
* modificar informações provenientes de órgãos públicos ou entidades certificadoras;
* reescrever material proprietário, protegido ou licenciado;
* gerar qualquer forma de conteúdo derivado não autorizado;
* reconstruir ou simular materiais com restrições jurídicas.

### Princípio da integridade documental

O Codex só pode:

* armazenar,
* organizar,
* estruturar,
* auditar,
* versionar tecnicamente,
* registrar estados e auditorias.

Jamais pode alterar o conteúdo original.

### Conformidade com auditorias rigorosas

Todo o sistema deve ser capaz de ser auditado por:

* órgãos governamentais federais e estaduais,
* instituições internacionais de ensino e exame,
* comissões de controle,
* equipes de compliance,
* certificadoras técnicas.

Para isso, o Codex deve garantir:

* registros completos e íntegros,
* rastreabilidade de cada alteração,
* imutabilidade do conteúdo original,
* histórico permanente,
* transparência total de ações.

---

## Regras de idioma e internacionalização

O Codex deve manter o idioma nativo de cada país:

* Espanha → es-ES (fallback es-ES)
* Estados Unidos → en-US (fallback en-US)
* Brasil → pt-BR

O Codex **não deve traduzir** ou adaptar conteúdos.

---

## Estrutura do bloco de dados

O bloco deve conter:

* nome
* tipo
* idioma
* link
* categoria
* formato_original
* fonte
* observacao

Esses campos são obrigatórios para auditorias internacionais.

---

## Estrutura do bloco auditoria

Deve conter:

* criado_em
* atualizado_em
* ultima_sincronizacao
* origem_download
* metodo_extracao
* hash_verificacao

O Codex deve garantir:

* imutabilidade dos registros históricos;
* atualização precisa de ultima_sincronizacao;
* registro fiel do método de extração;
* hash para integridade (conformidade com padrões internacionais).

Nunca pode apagar dados de auditoria.

---

## Campo status

Valores permitidos:

* ativo
* revisado
* cancelado
* removido

O Codex deve aplicar a ação correspondente sem alterar o conteúdo original.

---

## Tarefas obrigatórias do Codex (manutenção de rotina)

Ao executar manutenção de rotina, o Codex deve:

1. Ler completamente fontes.json.
2. Validar estrutura hierárquica.
3. Verificar idioma e integridade.
4. Atualizar ultima_sincronizacao.
5. Validar URLs declaradas.
6. Criar anos novos quando detectados.
7. Atualizar anos existentes conforme permitido.
8. Aplicar revisões, cancelamentos e remoções.
9. Criar pastas reproduzindo a hierarquia.
10. Registrar toda ação em auditoria.
11. Nunca modificar conteúdo autoral.
12. Abrir PR documentando todas as ações.

Esta ordem é fixa e obrigatória.

---

## Limitação obrigatória de consulta

O Codex **somente pode consultar URLs declaradas no fontes.json**, especificamente nos campos:

* link
* origem_download

É proibido acessar:

* URLs externas não declaradas;
* APIs não autorizadas;
* bancos de dados de terceiros;
* qualquer dado externo não previsto.

Essa limitação atende normas internacionais de:

* privacy by design,
* segurança de cadeia de dados,
* restrição de escopo de consulta.

---

## Inclusão automática

O Codex deve detectar novas entradas de:

* países,
* níveis,
* órgãos,
* anos.

E deve:

* gerar toda a estrutura,
* registrar auditoria,
* manter integridade total.

---

## Sincronização

Se houver URLs válidas, o Codex deve:

* acessar somente as URLs declaradas;
* baixar ou consultar;
* registrar auditoria;
* registrar hash;
* nunca modificar conteúdo.

Nenhuma outra fonte externa pode ser acessada.

---

Fim do documento. Versão exclusiva para o Codex, desenhada para atender padrões máximos de auditoria governamental e internacional.
