import Link from "next/link";
import { ContentForm } from "@/components/admin/ContentForm";
import { createContentItem } from "../actions";

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/content" className="text-sm text-mist hover:text-pearl">
        ← Content
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pearl">New reading</h1>
      <ContentForm action={createContentItem} submitLabel="Create" />
    </div>
  );
}
