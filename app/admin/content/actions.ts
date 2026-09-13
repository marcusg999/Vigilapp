"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { ContentCategory } from "@/lib/types";

/** Read + normalize the content form fields. */
function readForm(formData: FormData) {
  const category = String(formData.get("category") ?? "ritual") as ContentCategory;
  return {
    category: category === "nde" ? "nde" : "ritual",
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim() || null,
    youtube_url: String(formData.get("youtube_url") ?? "").trim() || null,
    published: formData.get("published") === "on",
  };
}

export async function createContentItem(formData: FormData) {
  const { user } = await requireAdmin();
  const fields = readForm(formData);
  if (!fields.title) redirect("/admin/content/new?error=title");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("content_items")
    .insert({ ...fields, created_by: user.id })
    .select("id")
    .single();

  if (error || !data) redirect("/admin/content/new?error=save");

  await logAudit({
    action: "content.create",
    entity: "content_items",
    entityId: data.id,
    metadata: { title: fields.title, published: fields.published },
  });

  revalidatePath("/admin/content");
  redirect("/admin/content");
}

export async function updateContentItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/content");
  const fields = readForm(formData);

  const supabase = createClient();
  await supabase.from("content_items").update(fields).eq("id", id);

  await logAudit({
    action: "content.update",
    entity: "content_items",
    entityId: id,
    metadata: { title: fields.title, published: fields.published },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/app/education/${id}`);
  redirect("/admin/content");
}

export async function deleteContentItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("content_items").delete().eq("id", id);

  await logAudit({
    action: "content.delete",
    entity: "content_items",
    entityId: id,
  });

  revalidatePath("/admin/content");
}
