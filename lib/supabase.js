import { createClient } from "@supabase/supabase-js";

/**
 * Klien Supabase untuk dipakai di sisi server saja
 * (Server Component, Server Action, Route Handler).
 * Jangan import file ini dari komponen "use client".
 */
export function buatSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Environment variable SUPABASE_URL atau SUPABASE_SECRET_KEY belum diisi di .env.local."
    );
  }

  return createClient(url, key);
}
