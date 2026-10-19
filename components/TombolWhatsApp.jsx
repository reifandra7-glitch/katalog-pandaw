"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

// US-03: Buka WhatsApp toko dengan pesan otomatis berisi nama dan harga produk.
// US-12: Pilih jumlah atau varian sebelum memesan, dan pilihan itu ikut tertulis di pesan WhatsApp.
export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varianDipilih, setVarianDipilih] = useState("");

  const maxStok =
    typeof produk?.stok === "number" && produk.stok > 0 ? produk.stok : null;

  // Cek apakah produk memiliki data varian (tanpa mengarang varian dummy jika tidak ada)
  const daftarVarian = Array.isArray(produk?.varian)
    ? produk.varian
    : typeof produk?.varian === "string" && produk.varian.trim()
      ? produk.varian
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

  const jumlahAktif =
    typeof jumlah === "number" && jumlah >= 1 ? Math.floor(jumlah) : 1;

  const handleKurang = () => {
    setJumlah((prev) => Math.max(1, (parseInt(prev, 10) || 1) - 1));
  };

  const handleTambah = () => {
    setJumlah((prev) => {
      const saatIni = parseInt(prev, 10) || 1;
      if (maxStok && saatIni >= maxStok) return maxStok;
      return saatIni + 1;
    });
  };

  const handleInputJumlah = (e) => {
    const nilai = e.target.value;
    if (nilai === "") {
      setJumlah("");
      return;
    }
    const angka = parseInt(nilai, 10);
    if (isNaN(angka)) return;
    if (angka < 1) {
      setJumlah(1);
    } else if (maxStok && angka > maxStok) {
      setJumlah(maxStok);
    } else {
      setJumlah(angka);
    }
  };

  const handleBlurJumlah = () => {
    if (jumlah === "" || jumlah < 1) {
      setJumlah(1);
    }
  };

  const totalHarga = (produk?.harga || 0) * jumlahAktif;
  const teksVarian = varianDipilih ? ` [varian: ${varianDipilih}]` : "";
  const teksJumlah = `(jumlah: ${jumlahAktif})`;
  const teksHarga =
    jumlahAktif > 1
      ? `dengan total harga ${formatRupiah(totalHarga)}`
      : `seharga ${formatRupiah(totalHarga)}`;

  const pesan = `Halo, saya ingin memesan *${
    produk?.nama || "Produk"
  }*${teksVarian} ${teksJumlah} ${teksHarga}. Apakah masih tersedia?`;

  const url = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(
    pesan
  )}`;

  const perluPilihVarian = daftarVarian.length > 0 && !varianDipilih;

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Varian produk jika data varian tersedia di database */}
      {daftarVarian.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-teks">
            Pilih Varian
          </label>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((v) => {
              const aktif = varianDipilih === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVarianDipilih(v)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                    aktif
                      ? "border-utama bg-utama text-white"
                      : "border-garis bg-latar text-teks hover:border-utama"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
          {perluPilihVarian && (
            <p className="text-xs text-bahaya">
              Silakan pilih salah satu varian terlebih dahulu.
            </p>
          )}
        </div>
      )}

      {/* Kontrol Jumlah Produk (US-12) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="input-jumlah-produk" className="text-sm font-semibold text-teks">
          Jumlah
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
            <button
              id="tombol-kurang-jumlah"
              type="button"
              onClick={handleKurang}
              disabled={jumlahAktif <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-lg text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Kurangi jumlah"
            >
              −
            </button>
            <input
              id="input-jumlah-produk"
              type="number"
              min="1"
              max={maxStok || undefined}
              value={jumlah}
              onChange={handleInputJumlah}
              onBlur={handleBlurJumlah}
              className="h-10 w-14 text-center font-bold text-teks focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Jumlah pesanan"
            />
            <button
              id="tombol-tambah-jumlah"
              type="button"
              onClick={handleTambah}
              disabled={Boolean(maxStok && jumlahAktif >= maxStok)}
              className="flex h-10 w-10 items-center justify-center rounded-r-lg text-lg font-bold text-teks transition-colors hover:bg-permukaan disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>

          {jumlahAktif > 1 && (
            <span className="text-sm text-teks-lembut">
              Total:{" "}
              <strong className="font-bold text-harga">
                {formatRupiah(totalHarga)}
              </strong>
            </span>
          )}
        </div>

        {maxStok && (
          <p className="text-xs text-teks-lembut">Stok tersedia: {maxStok}</p>
        )}
      </div>

      {/* Tombol Pesan via WhatsApp */}
      {perluPilihVarian ? (
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-utama/50 px-5 py-3 font-semibold text-white sm:w-auto"
        >
          Pilih varian untuk memesan
        </button>
      ) : (
        <a
          id="tombol-pesan-whatsapp"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
      )}
    </div>
  );
}

