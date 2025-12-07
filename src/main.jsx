// Salvar em: ./src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

// AppShell: núcleo do PWA
import AppShell from "./core/layout/AppShell.jsx";

// Renderização principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
