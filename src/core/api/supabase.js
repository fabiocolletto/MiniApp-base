// src/core/api/supabase.js
import { createClient } from "@supabase/supabase-js";

// ------------------------------
// CONFIGURAÇÃO DO SUPABASE
// ------------------------------
// Obs: No MVP, usamos a chave pública (anon) e segurança por RLS.
// Isso mantém tudo simples e seguro.

const SUPABASE_URL = "https://<SEU-PROJETO>.supabase.co";
const SUPABASE_KEY = "<SUA-CHAVE-ANON>";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false, // o app NÃO usa auth nativa do Supabase
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
