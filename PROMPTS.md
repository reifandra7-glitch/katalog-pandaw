# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**
Baca AGENTS.md dan docs/user-stories.md bagian US-01.

Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.

Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.
**Hasil:**
Selesai. Berikut ringkasan perubahan:

File yang dibuat/diubah
File	Perubahan


lib/supabase.js
Baru — fungsi buatSupabaseServer() yang membuat klien Supabase dari SUPABASE_URL + SUPABASE_SECRET_KEY


app/page.jsx
Diubah — async Server Component, ambil data dari tabel produk, hapus CatatanBelumAktif dan data-contoh
Cara menguji
Pastikan .env.local sudah diisi dengan nilai SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, dan SUPABASE_SECRET_KEY dari Supabase dashboard → Project Settings → API Keys.

Jalankan dev server, lalu buka http://localhost:3000.

Skenario yang bisa diuji:

Tabel produk ada isi → kartu produk muncul seperti biasa
Tabel kosong → muncul tulisan "Belum ada produk."
SUPABASE_URL/SUPABASE_SECRET_KEY kosong → muncul pesan error merah yang jelas
**Perbaikan:**

## US-02 Detail produk

**Prompt:**
Baca docs/user-stories.md bagian US-02.

Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.
**Hasil:**
Selesai. Ringkasan perubahan:

File yang diubah
File	Perubahan


app/produk/[id]/page.jsx
Ambil produk dari Supabase dengan .eq("id", id).single(), hapus CatatanBelumAktif dan data-contoh, TombolWhatsApp tetap ada
Cara menguji
Klik salah satu produk di halaman katalog → halaman detail terbuka dengan data dari Supabase (foto, kategori, nama, harga, deskripsi).
Buka URL dengan id yang tidak ada, misal /produk/id-tidak-ada → muncul halaman 404 Not Found.
**Perbaikan:**

## US-03 Pesan via WhatsApp

**Prompt:**
Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)".

Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.
**Hasil:**
Selesai. Ringkasan perubahan:

File yang diubah
File	Perubahan


app/produk/[id]/page.jsx
components/TombolWhatsApp.jsx

Cara menguji
Buka salah satu halaman produk, klik tombol WhatsApp. Browser akan membuka tab baru ke https://wa.me/<nomor-anda>?text=Halo%2C%20saya%20tertarik%20dengan%20...
Pastikan teks pesan otomatis benar, nomor tujuan sesuai lib/toko.js, dan tab baru terbuka (jangan ganti ke halaman lain).
**Perbaikan:**

## US-04 Login admin

**Prompt:**
Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.

Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.
**Hasil:**
Selesai. Berikut ringkasan perubahan:

File yang dibuat/diubah
File	Perubahan


app/admin/actions.js
Baru — Server Action untuk login dan logout memakai @supabase/ssr


app/admin/login/page.jsx
Diubah — form login yang memanggil actions.login, hapus CatatanBelumAktif


components/NavAdmin.jsx
Diubah — tambah tombol Keluar yang memanggil actions.logout

Cara menguji
Pastikan environment variable SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY sudah diisi di .env.local.

1. Coba login:

Buka http://localhost:3000/admin/login.
Masukkan email dan password admin (misal: [EMAIL_ADDRESS] / admin123@gmail.com).
Jika sukses, akan diarahkan ke halaman /admin (sesuaikan redirect di action.js jika perlu).
Jika gagal, pastikan error muncul di halaman login.
2. Coba logout:

Masih di halaman admin, klik tombol Keluar di sidebar.
Harus diarahkan kembali ke http://localhost:3000/admin/login dan tidak bisa mengakses /admin lagi tanpa login.
**Perbaikan:**

## US-05 Ganti password

**Prompt:**
Baca docs/user-stories.md bagian US-05.

Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.
**Hasil:**
Selesai. Berikut ringkasan perubahan:

File yang dibuat/diubah
File	Perubahan


app/admin/actions.js
Tambah action gantiPassword()


app/admin/password/page.jsx
Tambah form dan handler halaman (mengambil parameter searchParams)

Cara menguji
Pastikan Anda sudah login sebagai admin (/admin/login).

Buka http://localhost:3000/admin/password.

Masukkan password baru (minimal 8 karakter) dan konfirmasi yang sama, lalu klik Ubah Password.

Kalau berhasil, akan muncul pesan "Password berhasil diubah" dan form kosong lagi.

Kalau password baru < 8 karakter atau tidak cocok dengan konfirmasi, error akan muncul di bawah form tanpa redirect.

Kalau ada error dari Supabase, akan ditampilkan juga di halaman.
**Perbaikan:**

## US-06 Proteksi halaman admin

**Prompt:**
Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.

Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.
**Hasil:**
1:10 PM
Terakhir, verifikasi actions.js — gantiPassword sudah memanggil getUser() sebagai pemeriksaan login sebelum mengubah data. ✅ (sudah ada dari US-05).

File yang dibuat/diubah
File	Perubahan


proxy.js
Baru — middleware Next.js 16 yang melindungi semua rute /admin/* kecuali /admin/login


next.config.mjs
Tambah customMiddlewareFile: "proxy" agar Next.js membaca proxy.js


app/admin/page.jsx
Hapus CatatanBelumAktif, perbarui komentar
app/admin/actions.js	Sudah ada getUser() di gantiPassword — Server Action selalu memeriksa login ✅
Cara menguji
Tanpa login → buka /admin → harus otomatis diarahkan ke /admin/login
Tanpa login → buka /admin/password → juga diarahkan ke /admin/login
Setelah login → buka /admin → halaman muncul normal
Klik Keluar → coba buka /admin lagi → kembali ke /admin/login
**Perbaikan:**
Jika kode sebelumnya seperti ini:
export function middleware(request) {
  // kode middleware kamu
}


Ubah menjadi:
export function proxy(request) {
  // kode proxy kamu
}
## Debugging dan fitur bonus

### US-13 Bisa di-install di HP (PWA)
**Prompt:**
Implementasikan Progressive Web App (PWA) agar katalog UMKM dapat di-install di perangkat mobile (Android & iPhone). Sediakan Web App Manifest dengan identitas toko dan ikon di public/icons, Service Worker aman tanpa caching rute /admin, dan tombol/panduan instalasi di header.
**Hasil:**
- `app/manifest.js` & `public/manifest.webmanifest`: konfigurasi manifest lengkap (nama toko, icons 192 & 512, warna tema, display standalone).
- `public/sw.js`: Service worker yang menangani cache aset publik dan secara eksplisit melewati rute `/admin` dan API demi keamanan.
- `components/PwaInstall.jsx`: Komponen pendaftaran service worker, penanganan `beforeinstallprompt` untuk Android/Desktop, serta panduan "Add to Home Screen" untuk iOS Safari.
- `app/layout.jsx`: Menambahkan viewport themeColor dan appleWebApp metadata.
- `components/Header.jsx`: Menampilkan tombol instalasi PWA di header aplikasi.

### US-14 Deskripsi produk dibuat AI
**Prompt:**
Implementasikan fitur pembuatan deskripsi produk secara otomatis dengan Google Gemini AI di form admin tambah dan ubah produk.
**Hasil:**
- `app/admin/actions.js`: Server Action `buatDeskripsiAI` dengan verifikasi login admin, validasi input, pembatasan panjang teks, panggilan REST Google Gemini API (tanpa paket baru), dan penanganan error komprehensif.
- `components/FormProduk.jsx`: Integrasi tombol "✨ Buat Deskripsi dengan AI", input keunggulan opsional, status loading interaktif, pratinjau sebelum menimpa teks lama, serta kemampuan menyunting sebelum disimpan.
- `.env.example`: Ditambahkan konfigurasi `GEMINI_API_KEY`.

