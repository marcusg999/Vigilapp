"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Create a loved one along with their persona config and any initial memories,
 * all in one submission. Everything is written under the current user (RLS also
 * enforces ownership). Redirects to the new loved one's page on success.
 */
export async function createLovedOne(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const dateOrNull = (k: string) => {
    const v = str(k);
    return v === "" ? null : v;
  };

  const name = str("name");
  if (!name) redirect("/app/loved-ones/new?error=name");

  // Create the loved one first — we need its id for the child rows.
  const { data: lovedOne, error } = await supabase
    .from("loved_ones")
    .insert({
      user_id: user.id,
      name,
      bio: str("bio"),
      born_on: dateOrNull("born_on"),
      died_on: dateOrNull("died_on"),
    })
    .select("id")
    .single();

  if (error || !lovedOne) redirect("/app/loved-ones/new?error=save");

  // Characteristic phrases arrive as free text (one per line or comma-separated)
  // and are stored as a text[]. Split, trim, and drop blanks.
  const phrases = str("characteristic_phrases")
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  await supabase.from("persona_configs").insert({
    loved_one_id: lovedOne.id,
    user_id: user.id,
    relationship: str("relationship"),
    personality: str("personality"),
    characteristic_phrases: phrases,
    tone: str("tone"),
    topics_to_favor: str("topics_to_favor"),
    topics_to_avoid: str("topics_to_avoid"),
  });

  // Up to three initial memories from the form.
  const memories = [str("memory_1"), str("memory_2"), str("memory_3")]
    .filter(Boolean)
    .map((content) => ({
      loved_one_id: lovedOne.id,
      user_id: user.id,
      content,
    }));
  if (memories.length) {
    await supabase.from("memories").insert(memories);
  }

  redirect(`/app/loved-ones/${lovedOne.id}`);
}
