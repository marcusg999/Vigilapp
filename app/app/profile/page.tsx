import Link from "next/link";
import { requireUser, isAdmin } from "@/lib/auth";
import { updateDisplayName } from "./actions";
import { DangerZone } from "./DangerZone";

/** The user's account: display name, MFA (admins), and data rights. */
export default async function ProfilePage() {
  const [{ user, profile }, admin] = await Promise.all([
    requireUser(),
    isAdmin(),
  ]);

  return (
    <div className="space-y-14">
      <header>
        <h1 className="font-display text-3xl text-pearl">You</h1>
        <p className="mt-2 text-mist">Your account and your data.</p>
      </header>

      {/* Display name */}
      <section>
        <h2 className="font-display text-xl text-pearl">How we address you</h2>
        <form action={updateDisplayName} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label htmlFor="display_name" className="label">
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name ?? ""}
              className="field"
              placeholder="Your name"
            />
          </div>
          <button type="submit" className="btn-quiet">
            Save
          </button>
        </form>
        <p className="mt-3 text-sm text-mist/70">
          Signed in as {user.email}
        </p>
      </section>

      <hr className="rule-fade" />

      {admin && (
        <>
          <section>
            <h2 className="font-display text-xl text-pearl">
              Administrator security
            </h2>
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-mist">
              The admin area is protected by two-factor authentication. Set up
              or manage your authenticator here.
            </p>
            <Link href="/auth/mfa" className="btn-quiet mt-4">
              Manage two-factor
            </Link>
          </section>
          <hr className="rule-fade" />
        </>
      )}

      <section>
        <DangerZone />
      </section>
    </div>
  );
}
