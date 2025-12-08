// src/core/orchestrator/ScreenOrchestrator.jsx
import React, { useState, useEffect } from "react";

// Telas do app (cada uma será um componente simples)
import Home from "../../screens/Home.jsx";
import Auth from "../../screens/Auth.jsx";
import Perfil from "../../screens/Perfil.jsx";
import Master from "../../screens/Master.jsx";
import Miniapps from "../../screens/Miniapps.jsx";
import Loader from "../../screens/Loader.jsx";
import Settings from "../../screens/Settings.jsx";
import ErrorScreen from "../../screens/Error.jsx";

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
  const [currentScreen, setCurrentScreen] = useState("loader");
  const [role, setRole] = useState("guest"); // guest, adult, minor, master

  useEffect(() => {
    let timeoutId;
    let intervalId;
    let canceled = false;

    function waitForFamilyDB() {
      setCurrentScreen("loader");

      return new Promise((resolve, reject) => {
        if (window.familyDB) {
          resolve(window.familyDB);
          return;
        }

        timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error("familyDB bootstrap timeout"));
        }, 2000);

        intervalId = setInterval(() => {
          if (window.familyDB) {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            resolve(window.familyDB);
          }
        }, 100);
      });
    }

    async function determineRole() {
      if (!familyId || !userId) {
        setCurrentScreen("auth");
        return;
      }

      try {
        const dbPromise = await waitForFamilyDB();
        if (canceled) return;

        const db = await dbPromise;
        const member = await db.get("members", userId);

        if (member && member.role) {
          setRole(member.role);
        }

        // Se tudo ok → vai pra Home
        setCurrentScreen("home");

      } catch (err) {
        console.error("Erro ao recuperar role via IndexedDB:", err);
        if (!canceled) {
          setCurrentScreen("error");
        }
      }
    }

    determineRole();

    return () => {
      canceled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
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
