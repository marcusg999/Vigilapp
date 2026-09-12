import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types";

/**
 * Refreshes the Supabase auth session on every request and guards routes.
 *
 * - Unauthenticated visitors are allowed only on the landing page and /auth/*.
 * - Everything under /app and /admin requires a session.
 * - /admin additionally requires the `admin` role (checked here as a fast gate;
 *   RLS + the admin layout enforce it authoritatively on the server too).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" || path.startsWith("/auth") || path.startsWith("/api/auth");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Admin-area role gate. A missing/insufficient role is bounced to the app.
  if (user && path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
