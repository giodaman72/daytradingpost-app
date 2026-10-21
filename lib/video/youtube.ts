const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/**
 * Returns the 11-character video id from a YouTube link, or null when the
 * link is not a YouTube video. Accepts watch, youtu.be, embed, shorts and
 * live links.
 */
export function parseYouTubeId(input: string | null | undefined) {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be" || host === "www.youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first === "watch") id = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(first ?? ""))
      id = second ?? null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** Privacy-enhanced embed URL that starts playing once loaded. */
export function youTubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

export function youTubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** YouTube's own thumbnail, used when no custom thumbnail is set. */
export function youTubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
