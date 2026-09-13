import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

/**
 * Append an entry to the admin audit log.
 *
 * The audit_log has an admin-only INSERT policy and no UPDATE/DELETE policy, so
 * entries are append-only and only admins can write them. We use the normal
 * RLS client (the caller is always an admin, having passed requireAdmin()).
 *
 * Logging failures are swallowed — an audit write must never break the admin
 * action it records — but they are logged to the server console so they can be
 * noticed.
 */
export async function logAudit(entry: {
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;

    const supabase = createClient();
    await supabase.from("audit_log").insert({
      actor: user.id,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit] failed to write audit entry", err);
  }
}
