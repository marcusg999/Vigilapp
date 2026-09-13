"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Add a memory to a loved one. */
export async function addMemory(formData: FormData) {
  const lovedOneId = String(formData.get("loved_one_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const userId = await currentUserId();
  if (!userId || !lovedOneId || !content) return;

  const supabase = createClient();
  await supabase
    .from("memories")
    .insert({ loved_one_id: lovedOneId, user_id: userId, content });
  revalidatePath(`/app/loved-ones/${lovedOneId}`);
}

/** Leave a written offering for a loved one. */
export async function addOffering(formData: FormData) {
  const lovedOneId = String(formData.get("loved_one_id") ?? "");
  const bodyText = String(formData.get("body") ?? "").trim();
  const userId = await currentUserId();
  if (!userId || !lovedOneId || !bodyText) return;

  const supabase = createClient();
  await supabase
    .from("offerings")
    .insert({ loved_one_id: lovedOneId, user_id: userId, body: bodyText });
  revalidatePath(`/app/loved-ones/${lovedOneId}`);
}

/** Remove an offering (RLS restricts this to the owner's rows). */
export async function deleteOffering(formData: FormData) {
  const id = String(formData.get("offering_id") ?? "");
  const lovedOneId = String(formData.get("loved_one_id") ?? "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("offerings").delete().eq("id", id);
  revalidatePath(`/app/loved-ones/${lovedOneId}`);
}

/**
 * Start a new conversation with a loved one's echo, then send the user into the
 * connection ritual + chat for it.
 */
export async function startConversation(formData: FormData) {
  const lovedOneId = String(formData.get("loved_one_id") ?? "");
  const userId = await currentUserId();
  if (!userId || !lovedOneId) redirect("/app");

  const supabase = createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .insert({ loved_one_id: lovedOneId, user_id: userId })
    .select("id")
    .single();

  if (!conversation) redirect(`/app/loved-ones/${lovedOneId}`);
  redirect(`/app/loved-ones/${lovedOneId}/connect?c=${conversation.id}`);
}
