import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatSupabaseAuth } from "@/lib/supabase";
import { ubahProduk } from "@/app/admin/actions";

// US-09: ubah produk yang sudah ada, data diambil dari Supabase.
export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await buatSupabaseAuth();
  const { data: produk } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", id)
    .single();

  if (!produk) notFound();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {error && (
        <p className="max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}
      <FormProduk action={ubahProduk} produk={produk} labelTombol="Simpan perubahan" />
    </div>
  );
}
