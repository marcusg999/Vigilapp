import Link from "next/link";
import { createLovedOne } from "./actions";
import { TRANSPARENCY_NOTE } from "@/lib/guardrails";

/**
 * Guided onboarding: gather who the loved one was and a few memories. The copy
 * frames this as "gathering what you remember," and the transparency note sits
 * at the top so the framing is set before anything is entered.
 */
export default function NewLovedOnePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;
  const errorMessage =
    error === "name"
      ? "Please give them a name so we know who to remember."
      : error === "save"
        ? "We couldn't save this just now. Please try again in a moment — and if it keeps happening, it usually means the database isn't fully set up yet (see the server logs)."
        : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app" className="text-sm text-mist hover:text-pearl">
        ← Back
      </Link>

      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-candle/30 bg-night/50 px-4 py-3 text-sm text-candle-soft"
        >
          {errorMessage}
        </p>
      )}

      <header className="mt-4">
        <h1 className="font-display text-3xl text-pearl">
          Gathering what you remember
        </h1>
        <p className="mt-3 max-w-measure leading-relaxed text-mist">
          Tell Pleroma about the person you&apos;re remembering. The more you share
          — the way they spoke, what they cared about, the moments you return to
          — the more their echo will feel like them.
        </p>
      </header>

      <p className="note-quote mt-6">{TRANSPARENCY_NOTE}</p>

      <form action={createLovedOne} className="mt-8 space-y-8">
        {/* Who they were */}
        <section className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Their name
            </label>
            <input id="name" name="name" required className="field" placeholder="e.g. Rosa" />
          </div>
          <div>
            <label htmlFor="relationship" className="label">
              Who they were to you
            </label>
            <input
              id="relationship"
              name="relationship"
              className="field"
              placeholder="e.g. my grandmother"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="born_on" className="label">
                Born <span className="text-mist/50">(optional)</span>
              </label>
              <input id="born_on" name="born_on" type="date" className="field" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="died_on" className="label">
                Passed <span className="text-mist/50">(optional)</span>
              </label>
              <input id="died_on" name="died_on" type="date" className="field" />
            </div>
          </div>
          <div>
            <label htmlFor="bio" className="label">
              A little about them
            </label>
            <textarea id="bio" name="bio" rows={3} className="field" placeholder="Who were they, in a few sentences?" />
          </div>
        </section>

        <hr className="rule-fade" />

        {/* How they sounded */}
        <section className="space-y-4">
          <h2 className="font-display text-xl text-pearl">How they came across</h2>
          <div>
            <label htmlFor="personality" className="label">
              Their personality and spirit
            </label>
            <textarea
              id="personality"
              name="personality"
              rows={3}
              className="field"
              placeholder="Warm and stubborn, quick to laugh, endlessly patient…"
            />
          </div>
          <div>
            <label htmlFor="tone" className="label">
              How they spoke — their cadence
            </label>
            <textarea
              id="tone"
              name="tone"
              rows={2}
              className="field"
              placeholder="Slow and gentle, lots of questions, a little formal…"
            />
          </div>
          <div>
            <label htmlFor="characteristic_phrases" className="label">
              Things they often said
            </label>
            <textarea
              id="characteristic_phrases"
              name="characteristic_phrases"
              rows={3}
              className="field"
              placeholder={"One per line —\n“We'll see, mija.”\n“Eat something first.”"}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="topics_to_favor" className="label">
                Subjects to lean toward
              </label>
              <input
                id="topics_to_favor"
                name="topics_to_favor"
                className="field"
                placeholder="Cooking, the garden, family stories"
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="topics_to_avoid" className="label">
                Subjects to gently avoid
              </label>
              <input
                id="topics_to_avoid"
                name="topics_to_avoid"
                className="field"
                placeholder="Anything you'd rather not revisit"
              />
            </div>
          </div>
        </section>

        <hr className="rule-fade" />

        {/* Memories */}
        <section className="space-y-4">
          <h2 className="font-display text-xl text-pearl">A few memories</h2>
          <p className="max-w-measure text-sm text-mist">
            Share one to three moments you hold onto. These ground the
            conversation in what really happened between you.
          </p>
          <textarea name="memory_1" rows={3} className="field" placeholder="A memory…" />
          <textarea name="memory_2" rows={3} className="field" placeholder="Another, if you'd like…" />
          <textarea name="memory_3" rows={3} className="field" placeholder="And one more…" />
        </section>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="btn-candle">
            Create this space
          </button>
          <Link href="/app" className="text-sm text-mist hover:text-pearl">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
