import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * True account deletion. We verify the session, then delete the underlying
 * auth.users row with the service-role client. Every table's foreign key to
 * auth.users is `on delete cascade`, so this removes the profile, loved ones,
 * persona configs, memories, conversations, messages, and offerings along with
 * it — genuine deletion, not a soft flag.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }

  // Clear the now-orphaned session cookies.
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
