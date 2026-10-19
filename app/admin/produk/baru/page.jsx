import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";

// US-08: tambah produk baru ke database via Server Action.
export default async function HalamanTambahProduk({ searchParams }) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {error && (
        <p className="max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}
      <FormProduk action={tambahProduk} labelTombol="Simpan produk" />
    </div>
  );
}
