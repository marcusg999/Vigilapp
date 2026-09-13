import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LovedOne, Memory, Offering } from "@/lib/types";
import {
  addMemory,
  addOffering,
  deleteOffering,
  startConversation,
} from "./actions";

/** Detail for one loved one: their memories, offerings, and a way into the ritual. */
export default async function LovedOnePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: lovedOne } = await supabase
    .from("loved_ones")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!lovedOne) notFound();
  const lo = lovedOne as LovedOne;

  const [memoriesRes, offeringsRes] = await Promise.all([
    supabase
      .from("memories")
      .select("*")
      .eq("loved_one_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("offerings")
      .select("*")
      .eq("loved_one_id", params.id)
      .order("created_at", { ascending: false }),
  ]);
  const memories = (memoriesRes.data as Memory[] | null) ?? [];
  const offerings = (offeringsRes.data as Offering[] | null) ?? [];

  const years = [formatYear(lo.born_on), formatYear(lo.died_on)]
    .filter(Boolean)
    .join(" – ");

  return (
    <div className="space-y-12">
      <Link href="/app" className="text-sm text-mist hover:text-pearl">
        ← Remembrance
      </Link>

      {/* Header + the primary ritual action */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl text-pearl">{lo.name}</h1>
          {years && <p className="mt-1 text-mist">{years}</p>}
          {lo.bio && <p className="mt-4 max-w-measure leading-relaxed text-mist">{lo.bio}</p>}
        </div>
        <form action={startConversation}>
          <input type="hidden" name="loved_one_id" value={lo.id} />
          <button type="submit" className="btn-candle">
            Enter the ritual
          </button>
        </form>
      </header>

      <hr className="rule-fade" />

      {/* Memories */}
      <section>
        <h2 className="font-display text-2xl text-pearl">Memories</h2>
        <p className="mt-1 text-sm text-mist">
          What you remember shapes how {lo.name} speaks.
        </p>

        <form action={addMemory} className="mt-5 space-y-3">
          <input type="hidden" name="loved_one_id" value={lo.id} />
          <textarea
            name="content"
            rows={3}
            required
            className="field"
            placeholder="Add a memory…"
          />
          <button type="submit" className="btn-quiet">
            Add memory
          </button>
        </form>

        {memories.length > 0 && (
          <ul className="mt-8 space-y-4">
            {memories.map((m) => (
              <li key={m.id} className="border-l border-aurora/30 pl-4">
                <p className="leading-relaxed text-pearl/90">{m.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rule-fade" />

      {/* Offerings */}
      <section>
        <h2 className="font-display text-2xl text-pearl">Offerings</h2>
        <p className="mt-1 text-sm text-mist">
          A few words left for {lo.name} — a note, a thanks, a goodbye.
        </p>

        <form action={addOffering} className="mt-5 space-y-3">
          <input type="hidden" name="loved_one_id" value={lo.id} />
          <textarea
            name="body"
            rows={3}
            required
            className="field"
            placeholder="Leave an offering…"
          />
          <button type="submit" className="btn-quiet">
            Leave offering
          </button>
        </form>

        {offerings.length > 0 && (
          <ul className="mt-8 space-y-4">
            {offerings.map((o) => (
              <li key={o.id} className="surface flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="whitespace-pre-wrap leading-relaxed text-pearl/90">{o.body}</p>
                  <p className="mt-2 text-xs text-mist/60">{formatDate(o.created_at)}</p>
                </div>
                <form action={deleteOffering}>
                  <input type="hidden" name="offering_id" value={o.id} />
                  <input type="hidden" name="loved_one_id" value={lo.id} />
                  <button
                    type="submit"
                    className="text-sm text-mist/60 transition-colors hover:text-candle-soft"
                    aria-label="Remove offering"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatYear(date: string | null): string {
  if (!date) return "";
  return date.slice(0, 4);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
