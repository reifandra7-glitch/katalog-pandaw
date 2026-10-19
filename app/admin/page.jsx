import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatSupabaseAuth } from "@/lib/supabase";

// US-07: daftar produk dari Supabase. US-06: terlindungi oleh proxy.js.
export default async function HalamanAdmin({ searchParams }) {
  const { error } = await searchParams;

  const supabase = await buatSupabaseAuth();
  const { data: daftarProduk, error: dbError } = await supabase
    .from("produk")
    .select("id, nama, harga, foto_url, kategori")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {(error || dbError) && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error ? decodeURIComponent(error) : dbError.message}
        </p>
      )}

      {!dbError && daftarProduk?.length === 0 ? (
        <p className="text-teks-lembut">Belum ada produk. Klik &quot;Tambah produk&quot; untuk memulai.</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk ?? []} />
      )}
    </div>
  );
}
