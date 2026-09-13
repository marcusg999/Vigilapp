import Link from "next/link";
import { FlameMark } from "@/components/brand/FlameMark";

/** Centered, quiet frame for the sign-in / sign-up / MFA screens. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 flex flex-col items-center gap-3">
        <FlameMark size={40} className="animate-breathe" />
        <span className="font-display text-2xl text-pearl">Vigil</span>
      </Link>
      <div className="w-full">{children}</div>
    </main>
  );
}
