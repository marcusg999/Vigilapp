import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "@/lib/types";

/** Admin dashboard: a couple of counts and the most recent admin actions. */
export default async function AdminDashboard() {
  const supabase = createClient();

  const [totalRes, publishedRes, auditRes] = await Promise.all([
    supabase.from("content_items").select("id", { count: "exact", head: true }),
    supabase
      .from("content_items")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const total = totalRes.count ?? 0;
  const published = publishedRes.count ?? 0;
  const audit = (auditRes.data as AuditLogEntry[] | null) ?? [];

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl text-pearl">Dashboard</h1>
        <Link href="/admin/content/new" className="btn-candle">
          New content
        </Link>
      </header>

      <div className="flex gap-6">
        <Stat label="Content items" value={total} />
        <Stat label="Published" value={published} />
        <Stat label="Drafts" value={total - published} />
      </div>

      <section>
        <h2 className="font-display text-2xl text-pearl">Recent activity</h2>
        <hr className="rule-fade mt-4" />
        {audit.length === 0 ? (
          <p className="mt-6 text-mist">No admin actions recorded yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-aurora/10">
            {audit.map((entry) => (
              <li key={entry.id} className="flex items-baseline justify-between py-3">
                <span className="text-pearl/90">
                  <span className="text-candle-soft">{entry.action}</span>
                  {entry.entity && (
                    <span className="text-mist"> · {entry.entity}</span>
                  )}
                </span>
                <span className="text-sm text-mist/60">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface flex-1 p-6">
      <p className="font-display text-4xl text-pearl">{value}</p>
      <p className="mt-1 text-sm text-mist">{label}</p>
    </div>
  );
}
