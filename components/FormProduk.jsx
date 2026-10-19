"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// US-14: Fitur bantu buat deskripsi produk otomatis dengan Google Gemini AI.
export default function FormProduk({ produk = {}, action, labelTombol }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [catatanAi, setCatatanAi] = useState("");

  const [sedangAi, setSedangAi] = useState(false);
  const [errorAi, setErrorAi] = useState(null);
  const [suksesAi, setSuksesAi] = useState(false);
  const [pratinjauAi, setPratinjauAi] = useState(null);

  const handleBuatDeskripsi = async () => {
    setErrorAi(null);
    setSuksesAi(false);
    setPratinjauAi(null);

    const namaBersih = nama.trim();
    if (!namaBersih) {
      setErrorAi("Nama produk wajib diisi sebelum membuat deskripsi dengan AI.");
      return;
    }

    setSedangAi(true);

    try {
      const res = await buatDeskripsiAI({
        nama: namaBersih,
        kategori: kategori.trim(),
        catatan: catatanAi.trim(),
      });

      if (!res.sukses) {
        setErrorAi(res.error || "Gagal membuat deskripsi.");
      } else {
        const hasil = res.deskripsi;
        // Jika deskripsi saat ini sudah ada isinya dan berbeda dari hasil baru,
        // tampilkan pratinjau agar admin menyetujui sebelum menimpa.
        if (deskripsi.trim() && deskripsi.trim() !== hasil) {
          setPratinjauAi(hasil);
        } else {
          setDeskripsi(hasil);
          setSuksesAi(true);
        }
      }
    } catch (err) {
      setErrorAi(err.message || "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setSedangAi(false);
    }
  };

  const terapkanPratinjau = () => {
    if (pratinjauAi) {
      setDeskripsi(pratinjauAi);
      setPratinjauAi(null);
      setSuksesAi(true);
    }
  };

  const tolakPratinjau = () => {
    setPratinjauAi(null);
  };

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {/* Hidden input id hanya dikirim saat mode ubah (US-09) */}
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input
        id="input-nama-produk"
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Contoh: Kopi Robusta Asli 250 g"
        required
      />

      <Input
        id="input-harga-produk"
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        placeholder="Contoh: 45000"
        required
      />

      <Input
        id="input-kategori-produk"
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
        placeholder="Contoh: Minuman, Camilan, Kerajinan"
      />

      <Input
        id="input-foto-url"
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      {/* Bagian Bantuan AI untuk Deskripsi (US-14) */}
      <div className="rounded-xl border border-garis bg-permukaan/40 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teks-lembut">
              Bantuan AI Deskripsi (US-14)
            </span>
            <button
              id="tombol-buat-deskripsi-ai"
              type="button"
              disabled={sedangAi}
              onClick={handleBuatDeskripsi}
              className="inline-flex items-center gap-1.5 rounded-lg bg-utama px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-utama-gelap disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sedangAi ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Sedang membuat deskripsi...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>
                    {deskripsi.trim()
                      ? "Buat Ulang Deskripsi dengan AI"
                      : "Buat Deskripsi dengan AI"}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="input-catatan-ai"
              className="text-xs text-teks-lembut font-medium"
            >
              Keunggulan atau catatan khusus (opsional untuk memandu AI):
            </label>
            <input
              id="input-catatan-ai"
              type="text"
              value={catatanAi}
              onChange={(e) => setCatatanAi(e.target.value)}
              placeholder="Contoh: digoreng renyah, tanpa pengawet, rasa gurih pedas"
              className="w-full rounded-md border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          {/* Alert Error AI jika gagal */}
          {errorAi && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              <strong className="font-semibold">Perhatian:</strong> {errorAi}
            </div>
          )}

          {/* Notifikasi sukses */}
          {suksesAi && (
            <p className="text-xs text-utama font-medium">
              ✓ Deskripsi berhasil dibuat oleh AI. Silakan periksa atau sesuaikan teks di bawah.
            </p>
          )}

          {/* Modal/Kotak konfirmasi jika deskripsi lama mau ditimpa */}
          {pratinjauAi && (
            <div className="flex flex-col gap-2 rounded-lg border border-utama/30 bg-white p-3 shadow-sm">
              <span className="text-xs font-bold text-teks">
                Pratinjau Deskripsi Baru dari AI:
              </span>
              <p className="rounded bg-permukaan p-2 text-xs italic text-teks">
                &ldquo;{pratinjauAi}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={terapkanPratinjau}
                  className="rounded bg-utama px-2.5 py-1 text-xs font-semibold text-white hover:bg-utama-gelap"
                >
                  Terapkan ke Kolom Deskripsi
                </button>
                <button
                  type="button"
                  onClick={tolakPratinjau}
                  className="rounded border border-garis bg-latar px-2.5 py-1 text-xs text-teks hover:bg-permukaan"
                >
                  Pertahankan Deskripsi Lama
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Input
        id="input-deskripsi-produk"
        label="Deskripsi"
        name="deskripsi"
        textarea
        value={deskripsi}
        onChange={(e) => setDeskripsi(e.target.value)}
        placeholder="Tulis deskripsi produk atau gunakan tombol bantuan AI di atas"
      />

      <div className="flex gap-3 pt-2">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
