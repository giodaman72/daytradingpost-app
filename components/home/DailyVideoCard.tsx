import Image from "next/image";
import Link from "next/link";
import comingSoonPoster from "@/public/images/daily-video-coming-soon.webp";
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

/**
 * Shown in the same hero slot until the first daily video is published, so
 * the video holder is always there. Links to the latest analysis meanwhile.
 */
export function DailyVideoPlaceholder({
  locale,
  latestAnalysis,
}: {
  locale: Locale;
  latestAnalysis?: { slug: string; title: string } | null;
}) {
  const spanish = locale === "es";

  return (
    <article className="daily-video-card">
      <header className="daily-video-head">
        <span className="daily-video-kicker">
          <span className="daily-video-dot" aria-hidden="true" />
          {spanish ? "Video diario" : "Daily video"}
        </span>
        <span className="daily-video-ep">
          {spanish ? "Próximamente" : "Coming soon"}
        </span>
      </header>

      <div className="daily-video-frame daily-video-soon">
        <Image
          src={comingSoonPoster}
          alt={
            spanish
              ? "DayTradingPost: análisis pre-mercado diario de EE. UU."
              : "DayTradingPost: daily US pre-market analysis"
          }
          fill
          sizes="(max-width: 1080px) 100vw, 640px"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="daily-video-body">
        <p className="daily-video-meta">
          {spanish
            ? "Lunes a viernes · 9:00 a. m. ET"
            : "Monday to Friday · 9:00 AM ET"}
        </p>
        <h2>
          {spanish
            ? "El análisis pre-mercado en video llega pronto."
            : "The daily pre-market video is coming soon."}
        </h2>
        <p className="daily-video-summary">
          {spanish
            ? "Niveles clave, sesgo y el plan de la sesión para ocho mercados, cada día antes de la apertura."
            : "Key levels, bias and the session game plan for eight markets, every trading day before the open."}
        </p>
        {latestAnalysis ? (
          <div className="daily-video-actions">
            <Link
              href={localizeHref(`/analysis/${latestAnalysis.slug}`, locale)}
              className="daily-video-primary"
            >
              {spanish ? "Leer el último análisis" : "Read the latest analysis"}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
