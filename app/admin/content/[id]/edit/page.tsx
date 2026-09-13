import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/types";
import { ContentForm } from "@/components/admin/ContentForm";
import { updateContentItem } from "../../actions";

export default async function EditContentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const item = data as ContentItem;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/content" className="text-sm text-mist hover:text-pearl">
        ← Content
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pearl">Edit reading</h1>
      <ContentForm action={updateContentItem} item={item} submitLabel="Save changes" />
    </div>
  );
}
