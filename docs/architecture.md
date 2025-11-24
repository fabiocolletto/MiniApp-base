# Estrutura do Repositório

```
/
├─ index.html                    # Entrada do Pages apontando para o novo index
├─ AGENTE.md
├─ README.md
├─ CHANGELOG.md
├─ public/
│  ├─ sw.js                     # Service worker placeholder
│  ├─ manifest.json             # Manifesto PWA
│  ├─ legacy/index-legacy.html  # Home anterior (fallback)
│  └─ miniapps/educacao/        # Build estático do MiniApp Educação
├─ src/
│  ├─ app/index/                # Fonte do novo index
│  ├─ modules/content/catalog/  # Dados como o cards-2000
│  ├─ miniapps/                 # Fontes dos MiniApps
│  └─ ui/                       # Espaço reservado para componentes compartilhados
└─ docs/
```

Guidelines adicionais:
- A raiz contém apenas a entrada do Pages e arquivos de governança.
- Dados públicos devem ficar em `src/modules/content/catalog/`.
- MiniApps sempre em `src/miniapps/<nome>/`.
- `TEMP_INBOX/` é temporário e deve ser removido após a ingestão.
