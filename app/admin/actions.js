"use server";

import { redirect } from "next/navigation";
import { buatSupabaseAuth } from "@/lib/supabase";

// US-04: Server Action login admin memakai Supabase Auth.
export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = await buatSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Encode pesan error ke query string agar bisa ditampilkan di halaman login
    const pesan = encodeURIComponent(
      error.message === "Invalid login credentials"
        ? "Email atau password salah."
        : error.message
    );
    redirect(`/admin/login?error=${pesan}`);
  }

  redirect("/admin");
}

// US-04: Server Action logout admin.
export async function logout() {
  const supabase = await buatSupabaseAuth();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
