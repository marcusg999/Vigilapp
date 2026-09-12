import { requireUser } from "@/lib/auth";
import { TopNav } from "@/components/app-shell/TopNav";

/**
 * Shell for all signed-in user pages. `requireUser` enforces auth on the
 * server (the middleware also guards these routes) and gives us the profile
 * for the nav.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen">
      <TopNav
        displayName={profile?.display_name ?? null}
        isAdmin={profile?.role === "admin"}
      />
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
