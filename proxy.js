import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * proxy.js — pengganti middleware.js di Next.js 16.
 * US-06: lindungi semua rute /admin kecuali /admin/login.
 * Kalau belum login, alihkan ke /admin/login.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Halaman login boleh diakses siapa pun
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Buat response yang bisa dipakai untuk membaca & menulis cookie sesi
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() adalah satu-satunya cara aman untuk memeriksa sesi di middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belum login → alihkan ke /admin/login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
