import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/types";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

/** A single reading. RLS ensures only published items are reachable here. */
export default async function ContentDetailPage({
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
    <article className="mx-auto max-w-2xl">
      <Link href="/app/education" className="text-sm text-mist hover:text-pearl">
        ← Traditions
      </Link>

      <header className="mt-4">
        {item.region && (
          <p className="text-sm text-aurora/80">{item.region}</p>
        )}
        <h1 className="mt-1 font-display text-4xl leading-tight text-pearl">
          {item.title}
        </h1>
      </header>

      {item.youtube_url && (
        <div className="mt-8">
          <YouTubeEmbed url={item.youtube_url} title={item.title} />
        </div>
      )}

      {/* Preserve the paragraph breaks authors write. */}
      <div className="mt-8 space-y-5">
        {item.body
          .split(/\n{2,}/)
          .map((para, i) => (
            <p key={i} className="max-w-measure leading-relaxed text-pearl/90">
              {para}
            </p>
          ))}
      </div>
    </article>
  );
}
