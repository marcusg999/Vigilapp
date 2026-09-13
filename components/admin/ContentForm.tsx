import type { ContentItem } from "@/lib/types";

/**
 * The create/edit form for a content item. Shared by the "new" and "edit"
 * pages — pass the server `action` and, when editing, the existing `item`.
 */
export function ContentForm({
  action,
  item,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  item?: ContentItem;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-8 space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={item?.title ?? ""}
          className="field"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={item?.category ?? "ritual"}
            className="field"
          >
            <option value="ritual">Mourning ritual</option>
            <option value="nde">Near-death experience</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label htmlFor="region" className="label">
            Origin / region
          </label>
          <input
            id="region"
            name="region"
            defaultValue={item?.region ?? ""}
            className="field"
            placeholder="e.g. Japan"
          />
        </div>
      </div>

      <div>
        <label htmlFor="youtube_url" className="label">
          YouTube URL <span className="text-mist/50">(optional)</span>
        </label>
        <input
          id="youtube_url"
          name="youtube_url"
          type="url"
          defaultValue={item?.youtube_url ?? ""}
          className="field"
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </div>

      <div>
        <label htmlFor="body" className="label">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          defaultValue={item?.body ?? ""}
          className="field"
          placeholder="Write the reading. Blank lines separate paragraphs."
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-mist">
        <input
          type="checkbox"
          name="published"
          defaultChecked={item?.published ?? false}
          className="accent-candle"
        />
        Published (visible to everyone in Traditions)
      </label>

      <button type="submit" className="btn-candle">
        {submitLabel}
      </button>
    </form>
  );
}
