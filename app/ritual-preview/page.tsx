"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Browser-only (three.js), so load without SSR.
const ConnectionRitual = dynamic(
  () => import("@/components/ritual/ConnectionRitual"),
  { ssr: false },
);

/**
 * A standalone preview of the connection ritual, for design review. It carries
 * no user data — replaying just remounts the component.
 */
export default function RitualPreviewPage() {
  const [key, setKey] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-display text-2xl text-pearl">The ritual has ended.</p>
        <button
          className="btn-candle"
          onClick={() => {
            setDone(false);
            setKey((k) => k + 1);
          }}
        >
          Play again
        </button>
      </main>
    );
  }

  return (
    <ConnectionRitual
      key={key}
      lovedOneName="Rosa"
      autoAdvanceMs={20000}
      onComplete={() => setDone(true)}
    />
  );
}
