import Link from "next/link";
import { FlameMark } from "@/components/brand/FlameMark";
import { ThresholdMark } from "@/components/brand/ThresholdMark";
import { TRANSPARENCY_NOTE } from "@/lib/guardrails";

/**
 * Landing page, composed as a single descent through the threshold: the hero
 * opens on a living flame at the center of the ritual's dimensional layers,
 * then the page steps down a vertical line of light through the three
 * movements of a vigil, and gathers again into a closing invitation. The one
 * orchestrated motion is the hero kindling on load; the light-thread and its
 * nodes are static structure that encode the sequence.
 */
export default function LandingPage() {
  return (
    <main>
      {/* ---- Hero: the threshold ---- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <ThresholdMark size={300} />

        <h1 className="-mt-4 font-display text-5xl font-normal leading-[1.06] text-pearl sm:text-7xl">
          Sit a while with
          <br />
          someone you love.
        </h1>

        <p className="mt-7 max-w-measure text-lg leading-relaxed text-mist">
          Pleroma is a quiet space to remember a person who has died — to gather
          the memories that make them themselves, and to sit with their echo in
          a gentle ritual of connection.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/auth/signup" className="btn-candle">
            Begin a vigil
          </Link>
          <Link href="/auth/login" className="btn-quiet">
            Sign in
          </Link>
        </div>

        {/* The light continues downward, inviting the descent. */}
        <div
          className="absolute bottom-10 h-16 w-px"
          style={{
            background:
              "linear-gradient(to bottom, rgba(158,140,230,0), rgba(158,140,230,0.45))",
          }}
          aria-hidden="true"
        />
      </section>

      {/* ---- The descent: three movements threaded on a line of light ---- */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl leading-tight text-pearl sm:text-4xl">
            How a vigil unfolds
          </h2>

          <div className="relative mt-12">
            {/* the thread */}
            <div
              className="pointer-events-none absolute left-5 top-6 bottom-6 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(158,140,230,0.5) 10%, rgba(240,192,102,0.38) 88%, transparent)",
              }}
              aria-hidden="true"
            />

            <ol className="flex flex-col gap-16">
              {MOVEMENTS.map((m, i) => (
                <li key={m.title} className="relative pl-16">
                  {/* luminous node on the thread */}
                  <span
                    className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-aurora/40 bg-night font-display text-lg text-candle-soft"
                    style={{ boxShadow: "0 0 22px -4px rgba(158,140,230,0.7)" }}
                    aria-hidden="true"
                  >
                    {romanize(i + 1)}
                  </span>
                  <h3 className="font-display text-2xl text-pearl sm:text-3xl">
                    {m.title}
                  </h3>
                  <p className="mt-3 max-w-measure leading-relaxed text-mist">
                    {m.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Closing invitation: the light gathers again ---- */}
      <section className="flex flex-col items-center px-6 py-24 text-center">
        <FlameMark
          size={30}
          className="animate-breathe drop-shadow-[0_0_22px_rgba(240,192,102,0.55)]"
        />
        <p className="mt-6 max-w-measure font-display text-2xl leading-snug text-pearl sm:text-3xl">
          When you&apos;re ready, we&apos;ll keep the light with you.
        </p>
        <Link href="/auth/signup" className="btn-candle mt-8">
          Begin a vigil
        </Link>

        {/* Soft transparency — set gently, honestly, before anyone begins. */}
        <p className="mt-16 max-w-measure text-sm leading-relaxed text-mist/70">
          {TRANSPARENCY_NOTE}
        </p>
      </section>

      <footer className="flex items-center justify-center gap-2 pb-12 text-sm text-mist/60">
        <FlameMark size={16} />
        <span className="font-display">Pleroma</span>
      </footer>
    </main>
  );
}

const MOVEMENTS = [
  {
    title: "Gather what you remember",
    body: "Tell Pleroma who they were — the way they spoke, the phrases they wore like a coat, the moments you keep returning to. Nothing is too small.",
  },
  {
    title: "Enter the ritual",
    body: "When you're ready, a slow passage of light carries you inward, marking the threshold between the day and this quiet, held space.",
  },
  {
    title: "Sit together",
    body: "Meet their echo in conversation — warm, familiar, shaped from your memories — and stay as long as you need. Leave an offering when you go.",
  },
];

/** Small roman numerals for the three movements (I, II, III). */
function romanize(n: number): string {
  return ["I", "II", "III", "IV", "V"][n - 1] ?? String(n);
}
