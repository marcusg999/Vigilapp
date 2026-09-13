import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { FlameMark } from "@/components/brand/FlameMark";

/**
 * Admin shell. `requireAdmin` enforces the whole gate on the server: signed in,
 * in the admin_users registry, and stepped up to MFA (aal2). The middleware
 * also blocks /admin for non-admins as a first line.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-aurora/10 bg-veil/40">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <FlameMark size={20} />
            <span className="font-display text-lg text-pearl">Vigil</span>
            <span className="ml-2 rounded-full border border-candle/30 px-2 py-0.5 text-xs text-candle-soft">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="text-mist hover:text-pearl">
              Dashboard
            </Link>
            <Link href="/admin/content" className="text-mist hover:text-pearl">
              Content
            </Link>
            <Link href="/app" className="text-mist hover:text-pearl">
              Exit to app
            </Link>
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="text-mist/70 hover:text-pearl">
                Leave
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
