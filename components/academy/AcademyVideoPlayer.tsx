"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AcademyVideo } from "@/types/academy";
import {
  getAcademyVideoSource,
  normalizeAcademyVideoResumePosition,
} from "@/lib/academy/academyPresentation";
import { academyRequest, recordAcademyClientEvent } from "./academyClient";

type AcademyVideoPlayerProps = {
  courseId: string;
  enrollmentId: string;
  initialPosition: number;
  lessonId: string;
  moduleId: string;
  video: AcademyVideo;
};

export function AcademyVideoPlayer({
  courseId,
  enrollmentId,
  initialPosition,
  lessonId,
  moduleId,
  video,
}: AcademyVideoPlayerProps) {
  const resumePosition = normalizeAcademyVideoResumePosition(
    initialPosition,
    video.durationSeconds,
  );
  const source = getAcademyVideoSource(video, resumePosition);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSentRef = useRef(resumePosition);
  const [position, setPosition] = useState(resumePosition);
  const [status, setStatus] = useState("Progress is saved as you watch.");

  const synchronize = useCallback(
    async (nextPosition: number, nextDuration: number, force = false) => {
      const safePosition = Math.max(
        0,
        Math.min(Math.floor(nextPosition), Math.floor(nextDuration)),
      );
      setPosition(safePosition);
      if (
        !force &&
        Math.abs(safePosition - lastSentRef.current) < 10 &&
        safePosition < nextDuration
      )
        return;
      try {
        await academyRequest(`/api/academy/lessons/${lessonId}/progress`, {
          body: JSON.stringify({
            durationSeconds: nextDuration,
            enrollmentId,
            positionSeconds: safePosition,
          }),
          method: "PATCH",
        });
        lastSentRef.current = safePosition;
        setStatus("Progress saved.");
        recordAcademyClientEvent({
          courseId,
          lessonId,
          moduleId,
          name: "academy_lesson_progressed",
        });
      } catch {
        setStatus(
          "Progress could not be saved. Keep this page open and retry.",
        );
      }
    },
    [courseId, enrollmentId, lessonId, moduleId],
  );

  useEffect(() => {
    if (source.kind !== "iframe") return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iframeOrigin = new URL(source.src).origin;
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.youtube-nocookie.com" &&
        event.origin !== "https://player.vimeo.com"
      )
        return;
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const message = data as {
        data?: { duration?: number; seconds?: number };
        event?: string;
        info?: { currentTime?: number; duration?: number };
      };
      const seconds = message.data?.seconds ?? message.info?.currentTime;
      const duration = message.data?.duration ?? message.info?.duration;
      if (
        typeof seconds === "number" &&
        typeof duration === "number" &&
        duration > 0
      )
        void synchronize(seconds, duration);
    };
    window.addEventListener("message", handleMessage);
    const interval = window.setInterval(() => {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: lessonId }),
        iframeOrigin,
      );
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "getCurrentTime", args: [] }),
        iframeOrigin,
      );
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "getDuration", args: [] }),
        iframeOrigin,
      );
      iframe.contentWindow?.postMessage(
        JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
        iframeOrigin,
      );
    }, 5_000);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("message", handleMessage);
    };
  }, [lessonId, source.kind, source.src, synchronize]);

  if (source.kind === "unavailable")
    return (
      <div className="academy-video-unavailable" role="status">
        This lesson video is not currently available. The text and resources
        below remain accessible.
      </div>
    );

  return (
    <div className="academy-video-player">
      <div className="academy-video-frame">
        {source.kind === "iframe" ? (
          <iframe
            ref={iframeRef}
            src={source.src}
            title="Academy lesson video"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={source.src}
            controls
            preload="metadata"
            poster={video.posterImageUrl ?? undefined}
            onLoadedMetadata={(event) => {
              if (resumePosition > 0)
                event.currentTarget.currentTime = resumePosition;
            }}
            onPlay={() =>
              recordAcademyClientEvent({
                courseId,
                lessonId,
                moduleId,
                name: "academy_video_started",
              })
            }
            onPause={(event) =>
              void synchronize(
                event.currentTarget.currentTime,
                event.currentTarget.duration,
                true,
              )
            }
            onTimeUpdate={(event) =>
              void synchronize(
                event.currentTarget.currentTime,
                event.currentTarget.duration,
              )
            }
            onEnded={(event) => {
              void synchronize(
                event.currentTarget.duration,
                event.currentTarget.duration,
                true,
              );
              recordAcademyClientEvent({
                courseId,
                lessonId,
                moduleId,
                name: "academy_video_completed",
              });
            }}
          >
            {video.captions.map((caption) => (
              <track
                key={`${caption.language}:${caption.url}`}
                kind="captions"
                src={caption.url}
                srcLang={caption.language}
                label={caption.label}
              />
            ))}
          </video>
        )}
      </div>
      <div className="academy-video-status" aria-live="polite">
        <span>{status}</span>
        <span>
          {Math.floor(position / 60)}:
          {String(Math.floor(position % 60)).padStart(2, "0")} watched
        </span>
      </div>
    </div>
  );
}
