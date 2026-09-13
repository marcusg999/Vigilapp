"use client";

/**
 * Admin two-factor (TOTP) enrollment and step-up verification.
 *
 * Two situations, handled by one page:
 *  - No verified factor yet  -> ENROLL: show a QR code, the admin scans it with
 *    an authenticator app and enters a 6-digit code to enroll + verify.
 *  - A verified factor exists but this session is only aal1 -> VERIFY: the
 *    admin enters a current code to step the session up to aal2.
 *
 * On success the session reaches aal2 and requireAdmin() lets them into /admin.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "loading" | "enroll" | "verify" | "done";

export default function MfaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Decide enroll vs verify on mount.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        if (!cancelled) setError(error.message);
        return;
      }

      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) {
        if (!cancelled) {
          setFactorId(verified.id);
          setMode("verify");
        }
        return;
      }

      // Clear any half-finished (not-yet-verified) factors so enroll gives a
      // fresh QR.
      for (const f of data.totp.filter((f) => f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const enroll = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (enroll.error) {
        if (!cancelled) setError(enroll.error.message);
        return;
      }
      if (!cancelled) {
        setFactorId(enroll.data.id);
        setQrSvg(enroll.data.totp.qr_code);
        setSecret(enroll.data.totp.secret);
        setMode("enroll");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setPending(true);

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });

    if (error) {
      setError("That code didn't work. Check your authenticator and try again.");
      setPending(false);
      return;
    }

    setMode("done");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="surface p-8">
      <h1 className="font-display text-2xl text-pearl">
        {mode === "verify" ? "Confirm it's you" : "Protect the admin area"}
      </h1>

      {mode === "loading" && (
        <p className="mt-3 text-sm text-mist">Preparing…</p>
      )}

      {mode === "enroll" && (
        <>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Scan this with an authenticator app (1Password, Authy, Google
            Authenticator), then enter the 6-digit code it shows.
          </p>
          {qrSvg && (
            <div
              className="mx-auto mt-5 w-fit rounded-xl bg-pearl p-3"
              // qr_code is a trusted SVG data string from Supabase.
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          )}
          {secret && (
            <p className="mt-3 break-all text-center text-xs text-mist">
              Can&apos;t scan? Enter this key: <span className="text-pearl">{secret}</span>
            </p>
          )}
        </>
      )}

      {mode === "verify" && (
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Enter the current 6-digit code from your authenticator app to unlock
          the admin area.
        </p>
      )}

      {(mode === "enroll" || mode === "verify") && (
        <form onSubmit={onVerify} className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="label">
              Authentication code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="field tracking-[0.4em]"
              placeholder="000000"
            />
          </div>
          {error && <p className="text-sm text-candle-soft">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="btn-candle w-full"
          >
            {pending ? "Checking…" : mode === "enroll" ? "Enroll and continue" : "Unlock admin"}
          </button>
        </form>
      )}

      {error && mode === "loading" && (
        <p className="mt-4 text-sm text-candle-soft">{error}</p>
      )}
    </div>
  );
}
