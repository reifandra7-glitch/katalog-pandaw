"use server";

import { redirect } from "next/navigation";
import { buatSupabaseAuth } from "@/lib/supabase";

// ─── Helper: cek login, lempar redirect jika belum ───────────────────────────
async function pastikanLogin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

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
  await pastikanLogin(supabase);

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    const pesan = encodeURIComponent(error.message);
    redirect(`/admin/password?error=${pesan}`);
  }

  redirect("/admin/password?berhasil=1");
}

// US-08: Server Action tambah produk baru.
export async function tambahProduk(formData) {
  const supabase = await buatSupabaseAuth();
  await pastikanLogin(supabase);

  const nama = formData.get("nama")?.trim();
  const harga = Number(formData.get("harga"));

  if (!nama) {
    const pesan = encodeURIComponent("Nama produk wajib diisi.");
    redirect(`/admin/produk/baru?error=${pesan}`);
  }
  if (isNaN(harga) || harga < 0) {
    const pesan = encodeURIComponent("Harga tidak valid.");
    redirect(`/admin/produk/baru?error=${pesan}`);
  }

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori: formData.get("kategori")?.trim() || null,
    foto_url: formData.get("foto_url")?.trim() || null,
    deskripsi: formData.get("deskripsi")?.trim() || null,
  });

  if (error) {
    const pesan = encodeURIComponent(error.message);
    redirect(`/admin/produk/baru?error=${pesan}`);
  }

  redirect("/admin");
}

// US-09: Server Action ubah produk yang sudah ada.
export async function ubahProduk(formData) {
  const supabase = await buatSupabaseAuth();
  await pastikanLogin(supabase);

  const id = Number(formData.get("id"));
  const nama = formData.get("nama")?.trim();
  const harga = Number(formData.get("harga"));

  if (!id || isNaN(id)) {
    redirect("/admin");
  }
  if (!nama) {
    const pesan = encodeURIComponent("Nama produk wajib diisi.");
    redirect(`/admin/produk/${id}/ubah?error=${pesan}`);
  }
  if (isNaN(harga) || harga < 0) {
    const pesan = encodeURIComponent("Harga tidak valid.");
    redirect(`/admin/produk/${id}/ubah?error=${pesan}`);
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori: formData.get("kategori")?.trim() || null,
      foto_url: formData.get("foto_url")?.trim() || null,
      deskripsi: formData.get("deskripsi")?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    const pesan = encodeURIComponent(error.message);
    redirect(`/admin/produk/${id}/ubah?error=${pesan}`);
  }

  redirect("/admin");
}

// US-10: Server Action hapus produk.
export async function hapusProduk(formData) {
  const supabase = await buatSupabaseAuth();
  await pastikanLogin(supabase);

  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) redirect("/admin");

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    const pesan = encodeURIComponent(error.message);
    redirect(`/admin?error=${pesan}`);
  }

  redirect("/admin");
}

// US-14: Server Action membuat deskripsi produk otomatis dengan Google Gemini AI.
export async function buatDeskripsiAI({ nama, kategori, catatan }) {
  const supabase = await buatSupabaseAuth();
  await pastikanLogin(supabase);

  const namaBersih = (nama || "").trim();
  const kategoriBersih = (kategori || "").trim();
  const catatanBersih = (catatan || "").trim();

  // 1. Validasi input di server
  if (!namaBersih) {
    return {
      sukses: false,
      error: "Nama produk wajib diisi sebelum membuat deskripsi dengan AI.",
    };
  }

  if (namaBersih.length > 200) {
    return {
      sukses: false,
      error: "Nama produk terlalu panjang (maksimal 200 karakter).",
    };
  }

  if (kategoriBersih.length > 100) {
    return {
      sukses: false,
      error: "Kategori produk terlalu panjang (maksimal 100 karakter).",
    };
  }

  if (catatanBersih.length > 300) {
    return {
      sukses: false,
      error: "Catatan keunggulan terlalu panjang (maksimal 300 karakter).",
    };
  }

  // 2. Periksa environment variable di server
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      sukses: false,
      error:
        "Kunci API Gemini (GEMINI_API_KEY) belum dikonfigurasi di environment variable server (.env.local).",
    };
  }

  // 3. Susun instruksi prompt yang aman dan terarah untuk produk UMKM
  const instruksi = `Tugas Anda adalah menulis deskripsi produk untuk katalog toko UMKM Indonesia.
Tulis deskripsi yang menarik, mengalir alami, informatif, dan ramah pembeli dalam bahasa Indonesia yang baik dan benar.
Panjang deskripsi cukup 2 sampai 3 kalimat (1 paragraf ringkas).

Data produk:
- Nama produk: ${namaBersih}
${kategoriBersih ? `- Kategori: ${kategoriBersih}` : ""}
${catatanBersih ? `- Keunggulan/Bahan: ${catatanBersih}` : ""}

Aturan ketat:
1. Jangan mengarang klaim kesehatan palsu, obat mujarab, atau sertifikasi halal/BPOM yang tidak disebutkan.
2. Jangan membuat-buat bahan baku yang tidak ada pada data di atas.
3. Gunakan nada bahasa yang hangat, sopan, dan meyakinkan untuk calon pembeli.
4. Berikan teks deskripsinya saja tanpa kata pengantar, tanpa tanda kutip pembuka/penutup, dan tanpa bullet points.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    // Coba model gemini-2.5-flash terlebih dahulu, jika belum tersedia di key gunakan gemini-1.5-flash
    let urlApi = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let res = await fetch(urlApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruksi }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (res.status === 404) {
      urlApi = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      res = await fetch(urlApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: instruksi }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      });
    }

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      const pesanError = data?.error?.message || `Status HTTP ${res.status}`;
      if (res.status === 429) {
        return {
          sukses: false,
          error: "Batas pemanggilan Gemini API tercapai (Rate Limit). Silakan tunggu sebentar.",
        };
      }
      if (res.status === 400 && pesanError.toLowerCase().includes("api_key")) {
        return {
          sukses: false,
          error: "Kunci API Gemini tidak valid. Silakan periksa GEMINI_API_KEY.",
        };
      }
      return {
        sukses: false,
        error: `Gagal memproses AI: ${pesanError}`,
      };
    }

    const deskripsiHasil = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!deskripsiHasil) {
      return {
        sukses: false,
        error: "AI tidak mengembalikan teks deskripsi. Silakan coba lagi.",
      };
    }

    return {
      sukses: true,
      deskripsi: deskripsiHasil,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        sukses: false,
        error: "Permintaan AI melebihi batas waktu (timeout). Periksa koneksi internet.",
      };
    }
    return {
      sukses: false,
      error: `Kendala saat menghubungi AI: ${err.message}`,
    };
  }
}

