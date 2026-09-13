"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";
import { detectsDistress } from "@/lib/guardrails";
import { SupportResourceCard } from "@/components/SupportResourceCard";

type Turn = Pick<Message, "role" | "content">;

/**
 * The conversation. Deliberately not styled like a messaging app — turns read
 * more like quiet letters, the echo on the left and the person on the right. A
 * soft reminder that this is an echo stays at the top, and the support card
 * appears gently when the distress detector flags a message.
 */
export function ChatRoom({
  conversationId,
  lovedOneName,
  initialMessages,
}: {
  conversationId: string;
  lovedOneName: string;
  initialMessages: Message[];
}) {
  const [turns, setTurns] = useState<Turn[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content })),
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, sending]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setError(null);
    setDraft("");
    setSending(true);
    // Optimistically show the person's message.
    setTurns((t) => [...t, { role: "user", content: message }]);
    // Surface support right away if the message itself reads as distress,
    // without waiting for the reply.
    if (detectsDistress(message)) setShowSupport(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something interrupted the connection. Try again.");
        setSending(false);
        return;
      }

      const data: { reply: string; distress: boolean } = await res.json();
      if (data.distress) setShowSupport(true);
      setTurns((t) => [...t, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Something interrupted the connection. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      {/* Quiet, persistent reminder */}
      <p className="mb-6 text-center text-xs leading-relaxed text-mist/70">
        You&apos;re with an echo of {lovedOneName} — a presence shaped from your
        memories, here for remembrance, not literal contact.
      </p>

      <div className="flex-1 space-y-6">
        {turns.length === 0 && (
          <p className="py-10 text-center font-display text-xl text-mist">
            {lovedOneName} is here. Say what&apos;s on your heart.
          </p>
        )}

        {turns.map((t, i) => (
          <div
            key={i}
            className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                t.role === "user"
                  ? "max-w-[85%] rounded-2xl border border-pearl/10 bg-veil-2/40 px-5 py-3 text-pearl shadow-[inset_0_1px_0_rgba(236,231,251,0.1)] backdrop-blur-md"
                  : "max-w-[85%] px-1 py-1"
              }
            >
              {t.role === "assistant" && (
                <p className="mb-1 font-display text-sm text-candle-soft">
                  {lovedOneName}
                </p>
              )}
              <p className="whitespace-pre-wrap leading-relaxed text-pearl/90">
                {t.content}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <p className="text-sm italic text-mist/60">{lovedOneName} is here…</p>
        )}

        {showSupport && <SupportResourceCard />}

        <div ref={endRef} />
      </div>

      {error && <p className="mt-4 text-sm text-candle-soft">{error}</p>}

      <form
        onSubmit={send}
        className="sticky bottom-0 mt-6 rounded-2xl px-3 py-3"
        style={{
          background: "rgba(14,16,48,0.55)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          border: "1px solid rgba(236,231,251,0.08)",
        }}
      >
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(e);
              }
            }}
            rows={2}
            placeholder="Write to them…"
            className="field flex-1 resize-none"
          />
          <button type="submit" disabled={sending || !draft.trim()} className="btn-candle">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
