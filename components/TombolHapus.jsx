"use client";

import { hapusProduk } from "@/app/admin/actions";

// US-10: Tombol hapus produk dengan konfirmasi di browser.
// Komponen client karena memakai confirm() browser API.
export default function TombolHapus({ id, nama }) {
  function handleSubmit(e) {
    if (!confirm(`Hapus produk "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={hapusProduk} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-bahaya transition-colors hover:border-bahaya"
      >
        Hapus
      </button>
    </form>
  );
}
