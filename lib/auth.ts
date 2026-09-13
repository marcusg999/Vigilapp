import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Server-side auth helpers. These run in Server Components / Route Handlers and
 * read the session from cookies via the RLS-scoped client.
 *
 * Admin status is not a column — it lives in the `admin_users` registry that
 * clients can't read directly. We check it through the `is_admin()` SQL
 * function (SECURITY DEFINER), called as an RPC.
 */

export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data ?? null;
}

/** Whether the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}

/**
 * Require a signed-in user. Redirects to sign-in if there is none. Returns the
 * user and their profile (profile may be null in the brief window before the
 * handle_new_user trigger has run).
 */
export async function requireUser(): Promise<{
  user: User;
  profile: Profile | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ?? null };
}

/**
 * Require an admin with a fully-verified (aal2 / MFA) session.
 *  - not signed in         -> /auth/login
 *  - signed in, not admin  -> /app
 *  - admin without MFA yet -> /auth/mfa (to enroll or verify)
 */
export async function requireAdmin(): Promise<{ user: User; profile: Profile | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: admin } = await supabase.rpc("is_admin");
  if (admin !== true) redirect("/app");

  // Step-up MFA for the admin area.
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/auth/mfa");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ?? null };
}
