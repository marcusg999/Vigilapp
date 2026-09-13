import Link from "next/link";
import { FlameMark } from "@/components/brand/FlameMark";
import { ThresholdMark } from "@/components/brand/ThresholdMark";
import { TRANSPARENCY_NOTE } from "@/lib/guardrails";

/**
 * Landing page. The hero opens on the most characteristic thing in this app's
 * world: a flame at the center of a threshold of light — a preview of the
 * connection ritual. Everything else is given room to breathe; reverence is
 * expressed as space and light rather than decoration.
 */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <ThresholdMark size={240} />

        <h1 className="-mt-2 font-display text-4xl font-normal leading-[1.12] text-pearl sm:text-6xl">
          Sit a while with
          <br />
          someone you love.
        </h1>

        <p className="mt-6 max-w-measure text-lg leading-relaxed text-mist">
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
      </section>

      <hr className="rule-fade w-full" />

      {/* The three movements of a vigil — a genuine sequence, so it reads top
          to bottom, joined by the light rather than boxed into cards. */}
      <section className="w-full py-20">
        <div className="mx-auto flex max-w-xl flex-col gap-12">
          {MOVEMENTS.map((m, i) => (
            <div key={m.title} className="flex gap-6">
              <div className="pt-1">
                <span className="font-display text-2xl text-aurora/70">
                  {romanize(i + 1)}
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl text-pearl">{m.title}</h2>
                <p className="mt-2 max-w-measure leading-relaxed text-mist">
                  {m.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="rule-fade w-full" />

      {/* Soft transparency — set gently, honestly, before anyone begins. */}
      <section className="w-full py-16">
        <p className="mx-auto max-w-measure text-center text-sm leading-relaxed text-mist/80">
          {TRANSPARENCY_NOTE}
        </p>
      </section>

      <footer className="flex items-center gap-2 pb-12 text-sm text-mist/60">
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
