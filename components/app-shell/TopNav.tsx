"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlameMark } from "@/components/brand/FlameMark";

/**
 * The persistent header for signed-in areas. Quiet by design: the wordmark,
 * a few links, and a way out. The active link is marked with a soft candle
 * underline rather than a filled pill.
 */
export function TopNav({
  displayName,
  isAdmin,
}: {
  displayName: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/app", label: "Remembrance" },
    { href: "/app/education", label: "Traditions" },
    { href: "/app/profile", label: "You" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-aurora/10 bg-night/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/app" className="flex items-center gap-2">
          <FlameMark size={22} />
          <span className="font-display text-lg text-pearl">Vigil</span>
        </Link>

        <div className="flex items-center gap-6">
          {links.map((link) => {
            const active =
              link.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm transition-colors ${
                  active ? "text-candle" : "text-mist hover:text-pearl"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="font-sans text-sm text-mist/70 transition-colors hover:text-pearl"
            >
              Leave
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
