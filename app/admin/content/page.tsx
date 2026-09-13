import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/types";
import { deleteContentItem } from "./actions";

/** All content items (admins see drafts and published), with edit/delete. */
export default async function AdminContentList() {
  const supabase = createClient();
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .order("updated_at", { ascending: false });
  const items = (data as ContentItem[] | null) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-pearl">Content</h1>
          <p className="mt-2 text-mist">Readings for the Traditions section.</p>
        </div>
        <Link href="/admin/content/new" className="btn-candle">
          New content
        </Link>
      </header>

      <hr className="rule-fade" />

      {items.length === 0 ? (
        <p className="py-8 text-mist">Nothing here yet. Create the first reading.</p>
      ) : (
        <ul className="divide-y divide-aurora/10">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-display text-lg text-pearl">{item.title}</p>
                <p className="mt-1 text-sm text-mist">
                  {item.category === "nde" ? "Near-death experience" : "Mourning ritual"}
                  {item.region ? ` · ${item.region}` : ""}
                  {" · "}
                  <span className={item.published ? "text-aurora" : "text-mist/60"}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href={`/admin/content/${item.id}/edit`}
                  className="text-aurora hover:text-pearl"
                >
                  Edit
                </Link>
                <form action={deleteContentItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-mist/60 transition-colors hover:text-candle-soft"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
