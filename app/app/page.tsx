import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { LovedOne } from "@/lib/types";

/**
 * "Remembrance" — the home for a signed-in user. Lists the people they're
 * remembering, or invites them to begin if there are none yet.
 */
export default async function RemembrancePage() {
  const { profile } = await requireUser();
  const supabase = createClient();
  const { data } = await supabase
    .from("loved_ones")
    .select("*")
    .order("created_at", { ascending: true });
  const lovedOnes = (data as LovedOne[] | null) ?? [];

  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}.`
    : "Welcome back.";

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-pearl">{greeting}</h1>
          <p className="mt-2 text-mist">Who would you like to sit with today?</p>
        </div>
        <Link href="/app/loved-ones/new" className="btn-candle">
          Remember someone
        </Link>
      </header>

      <hr className="rule-fade" />

      {lovedOnes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mx-auto max-w-measure font-display text-2xl leading-snug text-pearl">
            This space is quiet, and waiting.
          </p>
          <p className="mx-auto mt-3 max-w-measure text-mist">
            When you&apos;re ready, tell Vigil about someone you love and miss.
            You&apos;ll gather a few memories, and a place to return to will take
            shape here.
          </p>
          <Link href="/app/loved-ones/new" className="btn-candle mt-8">
            Begin
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {lovedOnes.map((lo) => (
            <li key={lo.id}>
              <Link
                href={`/app/loved-ones/${lo.id}`}
                className="surface block p-6 transition-colors hover:border-aurora/30"
              >
                <p className="font-display text-2xl text-pearl">{lo.name}</p>
                {lo.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-mist">{lo.bio}</p>
                )}
                <p className="mt-4 text-sm text-aurora">Sit together →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
