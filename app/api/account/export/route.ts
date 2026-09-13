import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * One-tap data export. Gathers every row the signed-in user owns across the
 * app's tables and returns it as a downloadable JSON file.
 *
 * RLS already scopes each query to the current user, so a plain select per
 * table returns only their data. (User content is exportable here and is never
 * used to train any model.)
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [
    profile,
    lovedOnes,
    personaConfigs,
    memories,
    conversations,
    messages,
    offerings,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("loved_ones").select("*"),
    supabase.from("persona_configs").select("*"),
    supabase.from("memories").select("*"),
    supabase.from("conversations").select("*"),
    supabase.from("messages").select("*"),
    supabase.from("offerings").select("*"),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile: profile.data ?? null,
    loved_ones: lovedOnes.data ?? [],
    persona_configs: personaConfigs.data ?? [],
    memories: memories.data ?? [],
    conversations: conversations.data ?? [],
    messages: messages.data ?? [],
    offerings: offerings.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vigil-export-${user.id}.json"`,
    },
  });
}
