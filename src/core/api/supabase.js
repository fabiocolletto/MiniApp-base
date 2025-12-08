// src/core/api/supabase.js
import { createClient } from "@supabase/supabase-js";

// ------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------
// Obs: No MVP, usamos a chave pública (anon) e segurança por RLS.
// Isso mantém tudo simples e seguro.

let supabaseClient;

/**
 * Factory que inicializa o cliente Supabase somente quando as variáveis
 * SUPABASE_URL e SUPABASE_KEY estiverem disponíveis. Caso contrário,
 * devolve `null` para permitir fluxo offline-first em desenvolvimento.
 */
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL =
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
    process.env?.SUPABASE_URL;
  const SUPABASE_KEY =
    (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_KEY) ||
    process.env?.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      "Supabase desativado: defina SUPABASE_URL e SUPABASE_KEY para habilitar a sincronização remota."
    );
    return null;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false, // o app NÃO usa auth nativa do Supabase
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}
