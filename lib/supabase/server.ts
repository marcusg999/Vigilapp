import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * Server-side Supabase client for Server Components, Route Handlers, and Server
 * Actions. It reads the user's session from cookies and still runs under the
 * anon key, so RLS applies. This is the client the app uses for user data.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from a Server Component where cookies are
            // read-only. The middleware refreshes the session instead, so this
            // is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Privileged server client using the service-role key. Bypasses RLS, so it is
 * used ONLY for trusted server-side operations that need it — writing the
 * admin audit log, and performing true account deletion. Never import this
 * into client code.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } =
    require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
