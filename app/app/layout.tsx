import { requireUser, isAdmin } from "@/lib/auth";
import { TopNav } from "@/components/app-shell/TopNav";

/**
 * Shell for all signed-in user pages. `requireUser` enforces auth on the
 * server (the middleware also guards these routes) and gives us the profile
 * for the nav. `isAdmin` decides whether to show the admin link.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ profile }, admin] = await Promise.all([requireUser(), isAdmin()]);

  return (
    <div className="min-h-screen">
      <TopNav displayName={profile?.display_name ?? null} isAdmin={admin} />
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
