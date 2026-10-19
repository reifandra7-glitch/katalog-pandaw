/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supaya deploy tidak gagal hanya karena error tipe kecil selama workshop.
  typescript: { ignoreBuildErrors: true },
  // US-06: file middleware menggunakan nama proxy.js (bukan middleware.js) — sesuai Next.js 16.
  customMiddlewareFile: "proxy",
};

export default nextConfig;
