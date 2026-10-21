import Link from "next/link";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getSanityImageUrl } from "@/lib/sanity/image";
import {
  parseYouTubeId,
  youTubeThumbnailUrl,
  youTubeWatchUrl,
} from "@/lib/video/youtube";
import type { DailyVideo } from "@/types/video";
import { DailyVideoPlayer } from "./DailyVideoPlayer";

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

/** Homepage hero holder for the daily market video. */
export function DailyVideoCard({
  video,
  locale,
}: {
  video: DailyVideo;
  locale: Locale;
}) {
  const videoId = parseYouTubeId(video.youtubeUrl);
  if (!videoId) return null;

  const spanish = locale === "es";
  const poster =
    getSanityImageUrl(video.thumbnail, 1280, 720) ??
    youTubeThumbnailUrl(videoId);
  const date = formatDate(video.publishedAt, locale);
  const episode = video.episode
    ? `EP ${String(video.episode).padStart(2, "0")}`
    : null;
  const article = video.relatedArticle?.slug
    ? localizeHref(`/analysis/${video.relatedArticle.slug}`, locale)
    : null;

  return (
    <article className="daily-video-card">
      <header className="daily-video-head">
        <span className="daily-video-kicker">
          <span className="daily-video-dot" aria-hidden="true" />
          {spanish ? "Video diario" : "Daily video"}
        </span>
        {episode ? <span className="daily-video-ep">{episode}</span> : null}
      </header>

      <DailyVideoPlayer
        videoId={videoId}
        title={video.title}
        posterUrl={poster}
        posterAlt={video.thumbnail?.alt || video.title}
        playLabel={spanish ? "Reproducir video" : "Play video"}
      />

      <div className="daily-video-body">
        {date ? (
          <p className="daily-video-meta">
            <time dateTime={video.publishedAt}>{date}</time>
          </p>
        ) : null}
        <h2>{video.title}</h2>
        {video.summary ? (
          <p className="daily-video-summary">{video.summary}</p>
        ) : null}
        <div className="daily-video-actions">
          {article ? (
            <Link href={article} className="daily-video-primary">
              {spanish ? "Leer el análisis" : "Read the analysis"}
              <span aria-hidden="true"> →</span>
            </Link>
          ) : null}
          <a
            href={youTubeWatchUrl(videoId)}
            className="daily-video-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {spanish ? "Ver en YouTube ↗" : "Watch on YouTube ↗"}
          </a>
        </div>
      </div>
    </article>
  );
}
