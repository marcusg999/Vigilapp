"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Account deletion, with a deliberate confirmation step. Deletion is permanent
 * and cascades to every row the user owns (see /api/account/delete). We ask the
 * person to type "delete" so it can't happen by a stray click.
 */
export function DangerZone() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      setError("Something went wrong. Please try again in a moment.");
      setPending(false);
      return;
    }
    // Session is gone; send them home.
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <h2 className="font-display text-xl text-pearl">Leaving Pleroma</h2>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-mist">
        You can take everything with you, or close this space for good. Deleting
        your account permanently removes your profile, everyone you&apos;ve
        remembered here, your conversations, memories, and offerings. This can&apos;t
        be undone.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a href="/api/account/export" className="btn-quiet">
          Export my data
        </a>
      </div>

      <div className="mt-8 rounded-xl border border-candle/20 bg-night/40 p-5">
        <label htmlFor="confirm-delete" className="label">
          To delete your account, type <span className="text-pearl">delete</span> below.
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="confirm-delete"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field max-w-[220px]"
            placeholder="delete"
          />
          <button
            onClick={onDelete}
            disabled={confirm.trim().toLowerCase() !== "delete" || pending}
            className="btn-quiet border-candle/40 text-candle-soft disabled:opacity-40"
          >
            {pending ? "Closing your space…" : "Delete my account"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-candle-soft">{error}</p>}
      </div>
    </div>
  );
}
