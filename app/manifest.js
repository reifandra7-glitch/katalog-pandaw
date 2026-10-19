import { toko } from "@/lib/toko";

// US-13: Web App Manifest untuk PWA (Progressive Web App)
export default function manifest() {
  return {
    name: toko.nama,
    short_name: toko.nama,
    description: toko.tagline,
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#1f6b4f",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
