"use client";

import { useState, useEffect } from "react";
import Tombol from "@/components/Tombol";

// US-13: Komponen instalasi PWA dan pendaftaran Service Worker
export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [modalIosBuka, setModalIosBuka] = useState(false);
  const [sudahTerpasang, setSudahTerpasang] = useState(false);

  useEffect(() => {
    // 1. Registrasi Service Worker di browser yang mendukung
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Service worker terdaftar dengan sukses
        })
        .catch((err) => {
          console.warn("Gagal mendaftarkan service worker:", err);
        });
    }

    // 2. Deteksi status standalone (apakah sudah dibuka sebagai PWA)
    const cekStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(cekStandalone);

    // 3. Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const cekIos = /iphone|ipad|ipod/.test(userAgent);
    // Safari di iOS (bukan Chrome/Firefox iOS)
    const cekSafari =
      cekIos &&
      /safari/.test(userAgent) &&
      !/crios|fxios|opios|mercury/.test(userAgent);

    setIsIos(cekIos);

    // 4. Tangkap event beforeinstallprompt (Android / Chrome / Edge / Desktop)
    const handleBeforeInstall = (e) => {
      // Cegah banner otomatis bawaan agar bisa dipicu melalui tombol kita
      e.preventDefault();
      setDeferredPrompt(e);
      setBisaInstall(true);
    };

    const handleAppInstalled = () => {
      setSudahTerpasang(true);
      setBisaInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Tampilkan prompt instalasi browser
    deferredPrompt.prompt();

    // Tunggu pilihan pengguna
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setSudahTerpasang(true);
      setBisaInstall(false);
    }
    setDeferredPrompt(null);
  };

  // Jangan tampilkan apa pun jika aplikasi sudah dibuka dalam mode standalone atau sudah diinstal
  if (isStandalone || sudahTerpasang) {
    return null;
  }

  return (
    <>
      {/* Tombol Install untuk browser dengan event beforeinstallprompt (Android / Chrome / Edge) */}
      {bisaInstall && (
        <button
          id="tombol-install-pwa"
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 rounded-lg bg-utama px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-utama-gelap focus:outline-none focus:ring-2 focus:ring-utama focus:ring-offset-2"
          aria-label="Install aplikasi katalog di HP"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Install Aplikasi</span>
        </button>
      )}

      {/* Tombol Panduan Install untuk iOS Safari */}
      {!bisaInstall && isIos && !isStandalone && (
        <button
          id="tombol-install-ios"
          type="button"
          onClick={() => setModalIosBuka(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-utama/30 bg-utama/10 px-3.5 py-1.5 text-xs font-semibold text-utama transition hover:bg-utama/20"
          aria-label="Petunjuk pasang di layar utama iPhone"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Pasang di iPhone</span>
        </button>
      )}

      {/* Modal Petunjuk Add to Home Screen untuk iOS Safari */}
      {modalIosBuka && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-modal-ios"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
        >
          <div className="w-full max-w-sm rounded-2xl bg-latar p-6 shadow-xl border border-garis animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <h3 id="judul-modal-ios" className="text-lg font-bold text-teks">
                Pasang di Layar Utama iPhone
              </h3>
              <button
                type="button"
                onClick={() => setModalIosBuka(false)}
                className="rounded-lg p-1 text-teks-lembut hover:bg-permukaan hover:text-teks"
                aria-label="Tutup petunjuk"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs text-teks-lembut">
              Ikuti langkah mudah ini untuk memasang katalog langsung di layar iPhone kamu:
            </p>

            <ol className="mt-4 space-y-3 text-xs text-teks">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-utama text-[11px] font-bold text-white">
                  1
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan / Share</strong>{" "}
                  <span className="inline-block px-1 py-0.5 bg-permukaan rounded text-[10px] font-mono">
                    [↑]
                  </span>{" "}
                  di bilah bawah Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-utama text-[11px] font-bold text-white">
                  2
                </span>
                <span>
                  Gulir ke bawah dan pilih{" "}
                  <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-utama text-[11px] font-bold text-white">
                  3
                </span>
                <span>
                  Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.
                </span>
              </li>
            </ol>

            <div className="mt-6">
              <Tombol
                type="button"
                varian="utama"
                className="w-full text-xs"
                onClick={() => setModalIosBuka(false)}
              >
                Mengerti
              </Tombol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
