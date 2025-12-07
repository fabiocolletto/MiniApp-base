// src/core/orchestrator/ScreenOrchestrator.jsx
import React, { useState, useEffect } from "react";

// Telas do app (cada uma será um componente simples)
import Home from "../../screens/Home";
import Auth from "../../screens/Auth";
import Perfil from "../../screens/Perfil";
import Master from "../../screens/Master";
import Miniapps from "../../screens/Miniapps";
import Loader from "../../screens/Loader";
import Settings from "../../screens/Settings";
import ErrorScreen from "../../screens/Error";

// Permissões básicas
const SCREENS = {
  home: Home,
  auth: Auth,
  perfil: Perfil,
  master: Master,
  miniapps: Miniapps,
  loader: Loader,
  settings: Settings,
  error: ErrorScreen,
};

export default function ScreenOrchestrator({ familyId, userId }) {
  const [currentScreen, setCurrentScreen] = useState("auth");
  const [role, setRole] = useState("guest"); // guest, adult, minor, master

  useEffect(() => {
    async function determineRole() {
      if (!familyId || !userId) {
        setCurrentScreen("auth");
        return;
      }

      // Busca permissões localmente (IndexedDB)
      try {
        const db = await window.familyDB;
        const member = await db.members.get(userId);

        if (member && member.role) {
          setRole(member.role);
        }

        // Se tudo ok → vai pra Home
        setCurrentScreen("home");

      } catch (err) {
        console.error("Erro ao recuperar role:", err);
        setCurrentScreen("error");
      }
    }

    determineRole();
  }, [familyId, userId]);

  // 🔒 Permissões automáticas (básico do MVP)
  useEffect(() => {
    if (currentScreen === "master" && role !== "master") {
      setCurrentScreen("home");
    }
  }, [currentScreen, role]);

  // 🧠 Escolher Componente Correto
  const ActiveScreen = SCREENS[currentScreen] || ErrorScreen;

  return <ActiveScreen navigate={setCurrentScreen} role={role} />;
}
