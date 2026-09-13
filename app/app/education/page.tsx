import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/types";

/**
 * "Traditions" — the education section. Reads published content the admins have
 * created (RLS returns only published rows to ordinary users). Rituals and
 * near-death-experience pieces are shown as two quiet groups.
 */
export default async function EducationPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("content_items")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  const items = (data as ContentItem[] | null) ?? [];

  const rituals = items.filter((i) => i.category === "ritual");
  const nde = items.filter((i) => i.category === "nde");

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-3xl text-pearl">Traditions</h1>
        <p className="mt-2 max-w-measure leading-relaxed text-mist">
          How people across the world have held their dead, and what those close
          to death have described. Offered as company for the grieving, not as
          doctrine.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="py-10 text-mist">
          There&apos;s nothing here yet. New readings will appear as they&apos;re added.
        </p>
      ) : (
        <>
          <ContentGroup heading="Mourning rituals" items={rituals} />
          <ContentGroup heading="Near the threshold" items={nde} />
        </>
      )}
    </div>
  );
}

function ContentGroup({
  heading,
  items,
}: {
  heading: string;
  items: ContentItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl text-pearl">{heading}</h2>
      <hr className="rule-fade mt-4" />
      <ul className="mt-6 divide-y divide-aurora/10">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/app/education/${item.id}`}
              className="block py-5 transition-colors hover:text-pearl"
            >
              <p className="font-display text-xl text-pearl">{item.title}</p>
              {item.region && (
                <p className="mt-1 text-sm text-aurora/80">{item.region}</p>
              )}
              <p className="mt-2 line-clamp-2 max-w-measure text-sm text-mist">
                {item.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
