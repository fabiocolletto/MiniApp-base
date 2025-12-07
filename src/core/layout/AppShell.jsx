// src/core/layout/AppShell.jsx
import React, { useEffect, useState } from "react";
import { IonApp, IonContent } from "@ionic/react";

// Infraestrutura central
import { initDB } from "../db/indexdb.js";
import { initWebAuthn } from "../auth/webauthn.js";
import { supabase } from "../api/supabase.js";

// Orquestrador que monta telas (a ser criado depois)
import ScreenOrchestrator from "../orchestrator/ScreenOrchestrator.jsx";

export default function AppShell() {
  // Estado global mínimo
  const [familyId, setFamilyId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1. IndexedDB — dados locais
        await initDB();

        // 2. WebAuthn — autenticação do dispositivo
        await initWebAuthn();

        // 3. Carregar sessão (FamilyID + UserID)
        const localFamilyId = localStorage.getItem("familyId");
        const localUserId = localStorage.getItem("userId");

        if (localFamilyId) setFamilyId(localFamilyId);
        if (localUserId) setUserId(localUserId);

        // 4. Testar conexão leve com Supabase (opcional)
        supabase.channel("health-check");

        // 5. App pronto
        setReady(true);

      } catch (err) {
        console.error("Erro ao iniciar AppShell:", err);
        setReady(true); // mesmo com erro, app carrega (offline-first)
      }
    }

    bootstrap();
  }, []);

  if (!ready) {
    return (
      <IonApp>
        <IonContent className="ion-padding">
          Carregando estrutura do aplicativo…
        </IonContent>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonContent fullscreen>

        {/* O Orquestrador monta a tela correta */}
        <ScreenOrchestrator
          familyId={familyId}
          userId={userId}
        />

      </IonContent>
    </IonApp>
  );
}
