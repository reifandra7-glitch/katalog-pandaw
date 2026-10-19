// Service Worker untuk Katalog UMKM (US-13)
const CACHE_NAME = "katalog-umkm-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: cache aset awal
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: bersihkan cache versi lama jika ada
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Tangani permintaan
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. KEAMANAN: Jangan pernah cache atau mencegat halaman admin, API, dan mutasi data
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api") ||
    event.request.method !== "GET"
  ) {
    return; // Langsung ke jaringan tanpa cache
  }

  // 2. Aset gambar & statis (icons, produk statis): Cache-first dengan network fallback
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/produk/")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Halaman HTML publik: Network-first, fallback ke cache jika offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Default: coba network, fallback ke cache jika ada
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
