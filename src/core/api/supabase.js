// src/core/api/supabase.js
import { createClient } from "@supabase/supabase-js";

// ------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------
// Obs: No MVP, usamos a chave pública (anon) e segurança por RLS.
// Isso mantém tudo simples e seguro.

const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
  process.env?.SUPABASE_URL;
const SUPABASE_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_KEY) ||
  process.env?.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  const message =
    "As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias para inicializar o cliente Supabase.";
  console.error(message);
  throw new Error(message);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false, // o app NÃO usa auth nativa do Supabase
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
