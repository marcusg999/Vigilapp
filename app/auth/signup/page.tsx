"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TRANSPARENCY_NOTE } from "@/lib/guardrails";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    // If a session came back (email confirmation off), make sure the display
    // name is saved and enter the app. Otherwise ask them to confirm their
    // email first. (The transparency note must be acknowledged via the required
    // checkbox before this point.)
    if (data.session) {
      if (displayName) {
        await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", data.session.user.id);
      }
      router.push("/app");
      router.refresh();
    } else {
      setCheckEmail(true);
      setPending(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="surface p-8 text-center">
        <h1 className="font-display text-2xl text-pearl">One more step</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          We&apos;ve sent a confirmation link to {email}. Open it to complete
          your sign-up, then come back and sign in.
        </p>
        <Link href="/auth/login" className="btn-quiet mt-6">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="surface p-8">
      <h1 className="font-display text-2xl text-pearl">Begin a vigil</h1>
      <p className="mt-2 text-sm text-mist">
        A quiet account, for you alone.
      </p>

      {/* Soft transparency, set before anyone begins. */}
      <p className="mt-5 rounded-xl bg-night/50 p-4 text-sm leading-relaxed text-mist/90">
        {TRANSPARENCY_NOTE}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="label">
            What may we call you?
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-mist">
          <input
            type="checkbox"
            required
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-1 accent-candle"
          />
          <span>
            I understand this is a space for symbolic remembrance — an echo
            shaped from memory, not literal contact.
          </span>
        </label>

        {error && <p className="text-sm text-candle-soft">{error}</p>}

        <button
          type="submit"
          disabled={pending || !ack}
          className="btn-candle w-full disabled:opacity-50"
        >
          {pending ? "Creating your space…" : "Create my space"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-aurora hover:text-pearl">
          Sign in
        </Link>
      </p>
    </div>
  );
}
