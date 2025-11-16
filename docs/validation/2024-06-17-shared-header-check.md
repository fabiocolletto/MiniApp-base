# Shared Header Visual Validation – 2024-06-17

## Context
Following the rollout of the `<app-shared-header>` web component, we validated that the catalog shell and key MiniApps now share the exact same header markup and styling.

## Panels validated
1. **Catálogo principal (`index.html`)** – accessed via `http://localhost:4173/index.html`.
2. **MiniApp Gestão de Catálogo** – accessed via `http://localhost:4173/miniapps/gestao-de-catalogo/index.html`.

These two panels historically diverged because the MiniApp had its own static header implementation. Both now render `<app-shared-header>` and inherit `docs/miniapp-global.css` tokens.

## Result
- Visually confirmed that logo, search button, install button, and theme toggle are identical in both panels.
- Verified no layout shifts or missing icons between the two contexts.
- Screenshots have been archived with the task evidence for reference.

## Next steps
- Repeat this validation whenever a new MiniApp is onboarded or when the shared header component receives a functional change.
