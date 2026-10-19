import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Klien Supabase untuk membaca data publik di sisi server
 * (Server Component, Server Action, Route Handler).
 * Memakai SUPABASE_SECRET_KEY agar bisa melewati RLS untuk membaca katalog.
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

/**
 * Klien Supabase berbasis sesi (cookie) untuk auth admin.
 * Memakai SUPABASE_PUBLISHABLE_KEY + @supabase/ssr.
 * Dipakai di Server Action dan Server Component untuk login, logout, dan cek sesi.
 */
export async function buatSupabaseAuth() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Environment variable SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diisi di .env.local."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
