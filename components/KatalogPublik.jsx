"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";

// US-11: Filter kategori dan pencarian produk pada halaman katalog publik.
export default function KatalogPublik({
  daftarProduk = [],
  initialCari = "",
  initialKategori = "",
}) {
  const [cari, setCari] = useState(initialCari);
  const [kategoriDipilih, setKategoriDipilih] = useState(initialKategori);

  // Ambil daftar kategori unik dari produk yang benar-benar ada di database
  const daftarKategori = useMemo(() => {
    const setKategori = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori && p.kategori.trim()) {
        setKategori.add(p.kategori.trim());
      }
    });
    return Array.from(setKategori).sort((a, b) => a.localeCompare(b, "id"));
  }, [daftarProduk]);

  // Filter gabungan: pencarian (nama & deskripsi, case-insensitive) dan kategori
  const produkTersaring = useMemo(() => {
    const kataKunci = cari.trim().toLowerCase();

    return daftarProduk.filter((produk) => {
      // Filter kategori
      const cocokKategori =
        !kategoriDipilih || produk.kategori === kategoriDipilih;

      // Filter pencarian berdasarkan nama dan deskripsi
      const nama = (produk.nama || "").toLowerCase();
      const deskripsi = (produk.deskripsi || "").toLowerCase();
      const cocokCari =
        !kataKunci || nama.includes(kataKunci) || deskripsi.includes(kataKunci);

      return cocokKategori && cocokCari;
    });
  }, [daftarProduk, cari, kategoriDipilih]);

  const handleReset = () => {
    setCari("");
    setKategoriDipilih("");
  };

  const adaFilterAktif = Boolean(cari.trim() || kategoriDipilih);

  return (
    <div className="flex flex-col gap-6">
      {/* Kontrol Pencarian & Filter Kategori */}
      <div className="flex flex-col gap-4">
        {/* Kolom Pencarian */}
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-teks-lembut">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="input-cari-produk"
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau deskripsi produk..."
            className="w-full rounded-lg border border-garis bg-latar py-2.5 pl-10 pr-10 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            aria-label="Cari nama atau deskripsi produk"
          />
          {cari && (
            <button
              id="tombol-hapus-cari"
              type="button"
              onClick={() => setCari("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-teks-lembut transition-colors hover:text-teks"
              aria-label="Hapus kata kunci pencarian"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Pilihan Kategori */}
        {daftarKategori.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Pilihan kategori produk"
          >
            <button
              id="filter-kategori-semua"
              type="button"
              onClick={() => setKategoriDipilih("")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${kategoriDipilih === ""
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
            >
              Semua kategori
            </button>
            {daftarKategori.map((kategori) => {
              const idKategori = `filter-kategori-${kategori
                .toLowerCase()
                .replace(/\s+/g, "-")}`;
              const aktif = kategoriDipilih === kategori;
              return (
                <button
                  key={kategori}
                  id={idKategori}
                  type="button"
                  onClick={() => setKategoriDipilih(kategori)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${aktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                    }`}
                >
                  {kategori}
                </button>
              );
            })}
          </div>
        )}

        {/* Ringkasan Filter & Tombol Reset Cepat */}
        {adaFilterAktif && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-teks-lembut">
            <span>
              Menampilkan {produkTersaring.length} dari {daftarProduk.length} produk
              {cari.trim() && (
                <>
                  {" "}
                  untuk &ldquo;
                  <span className="font-medium text-teks">{cari.trim()}</span>
                  &rdquo;
                </>
              )}
              {kategoriDipilih && (
                <>
                  {" "}
                  dalam kategori &ldquo;
                  <span className="font-medium text-teks">
                    {kategoriDipilih}
                  </span>
                  &rdquo;
                </>
              )}
            </span>
            <button
              id="tombol-reset-filter"
              type="button"
              onClick={handleReset}
              className="font-medium text-utama underline underline-offset-4 hover:text-utama-gelap"
            >
              Hapus semua filter
            </button>
          </div>
        )}
      </div>

      {/* Grid Produk atau Pesan Tidak Ditemukan */}
      {produkTersaring.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan/50 px-6 py-12 text-center">
          <p className="text-lg font-bold text-teks">Produk tidak ditemukan</p>
          <p className="mt-1 max-w-md text-sm text-teks-lembut">
            Tidak ada produk yang cocok dengan pencarian
            {cari.trim() ? ` "${cari.trim()}"` : ""}
            {kategoriDipilih ? ` dalam kategori "${kategoriDipilih}"` : ""}. Coba
            kata kunci lain atau bersihkan filter.
          </p>
          {adaFilterAktif && (
            <div className="mt-5">
              <Tombol varian="garis" onClick={handleReset}>
                Tampilkan semua produk
              </Tombol>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTersaring.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}
