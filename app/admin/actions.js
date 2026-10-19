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

// US-05: Server Action ganti password admin yang sedang login.
export async function gantiPassword(formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  // Validasi di server
  if (!passwordBaru || passwordBaru.length < 8) {
    const pesan = encodeURIComponent("Password baru minimal 8 karakter.");
    redirect(`/admin/password?error=${pesan}`);
  }

  if (passwordBaru !== konfirmasi) {
    const pesan = encodeURIComponent("Password baru dan konfirmasi tidak sama.");
    redirect(`/admin/password?error=${pesan}`);
  }

  const supabase = await buatSupabaseAuth();

  // Pastikan admin sudah login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    const pesan = encodeURIComponent(error.message);
    redirect(`/admin/password?error=${pesan}`);
  }

  redirect("/admin/password?berhasil=1");
}
