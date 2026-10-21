"use client";

import Image from "next/image";
import { useState } from "react";
import { youTubeEmbedUrl } from "@/lib/video/youtube";

/**
 * Click-to-play YouTube player. Shows the thumbnail first and only loads
 * YouTube's player (privacy-enhanced mode) when the visitor presses play,
 * so the homepage stays fast and sets no YouTube cookies until then.
 */
export function DailyVideoPlayer({
  videoId,
  title,
  posterUrl,
  posterAlt,
  playLabel,
}: {
  videoId: string;
  title: string;
  posterUrl: string;
  posterAlt: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="daily-video-frame">
        <iframe
          src={youTubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="daily-video-frame daily-video-poster"
      onClick={() => setPlaying(true)}
      aria-label={`${playLabel}: ${title}`}
    >
      <Image
        src={posterUrl}
        alt={posterAlt}
        fill
        sizes="(max-width: 1080px) 100vw, 640px"
        loading="eager"
        fetchPriority="high"
      />
      <span className="daily-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
