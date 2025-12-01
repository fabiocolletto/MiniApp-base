🌐 Manutenção de Documentos de Idiomas (i18n)Este diretório contém todos os ficheiros de tradução (recursos de idioma) utilizados na aplicação principal e em todos os MiniApps. 
A manutenção correta destes ficheiros é crucial para a integridade do sistema de internacionalização.

📁 Estrutura do DiretórioCada ficheiro JSON dentro desta pasta representa um pacote de traduções para um idioma específico. O nome do ficheiro deve seguir o padrão [ISO 639-1 Language Code]-[ISO 3166-1 Alpha-2 Country Code] (ex: pt-BR.json, en-US.json).languages/
├── pt-BR.json        # Português (Brasil) - Idioma Base / Fonte da Verdade
├── en-US.json        # Inglês (Estados Unidos)
└── es-ES.json        # Espanhol (Espanha) - Exemplo

🎯 Regra 1: O Português (pt-BR) é o Ficheiro FonteO ficheiro pt-BR.json deve ser considerado a única fonte de verdade para todas as chaves de tradução.Chaves: Nunca adicione, remova ou modifique uma chave de tradução (a parte antes dos dois pontos) em qualquer outro ficheiro que não seja pt-BR.json.Conteúdo: O conteúdo de pt-BR.json deve estar sempre completo e atualizado.

🔑 Regra 2: Estrutura das Chaves (Namespaces Simplificados)As chaves de tradução devem ser agrupadas logicamente para organização. No nosso modelo atual de MiniApps (onde o carregamento é feito de uma única vez), a estrutura deve ser plana, mas semanticamente organizada:Geral / Navegação: app_title_portfolio, menu_settings, back_to.Componente Específico: Prefira prefixos como settings_title, edu_students.

✅ Regra 3: Processo para Adicionar Novas TraduçõesPara garantir a consistência, siga estes passos para adicionar uma nova chave a todos os idiomas:Edição do Ficheiro Fonte: Adicione a nova chave e o seu valor em Português no ficheiro pt-BR.json.{
  // ... outras chaves
  "new_feature_title": "Título da Nova Funcionalidade"
}
Duplicação da Chave: Copie a nova chave exatamente para todos os outros ficheiros JSON (en-US.json, es-ES.json, etc.).Tradução: Substitua o valor da chave no idioma correspondente (NUNCA a chave em si).// no ficheiro en-US.json
{
  // ... outras chaves
  "new_feature_title": "New Feature Title"
}
Validação: Verifique se o código do MiniApp está a chamar a chave corretamente: t('new_feature_title').

⚠️ Regra 4: Pluralização e FormataçãoComo o sistema atual é básico, evite chaves que exijam pluralização ou formatação de data/moeda complexa. Se estas forem necessárias, será obrigatório migrar para uma biblioteca i18n completa (como o i18next) antes da implementação.Evite: Usar uma única chave para "1 Item" e "5 Itens".Use (temporariamente): Formatação simples no código, como t('item_count_label') + count.Última Revisão: Dezembro de 2025
