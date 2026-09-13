/**
 * Embeds a YouTube video from a URL, using the privacy-enhanced
 * youtube-nocookie host. We extract the id ourselves and only ever build a
 * known-good embed URL, so a malformed or hostile `youtube_url` can't inject
 * anything — an unrecognized URL simply renders nothing.
 */
export function YouTubeEmbed({
  url,
  title,
}: {
  url: string;
  title?: string;
}) {
  const id = extractYouTubeId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-aurora/15">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/** Pull the 11-character video id out of the common YouTube URL shapes. */
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return isValidId(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id && isValidId(id) ? id : null;
      }
      // /embed/<id> or /shorts/<id>
      const parts = u.pathname.split("/");
      const id = parts[2];
      return id && isValidId(id) ? id : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isValidId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}
