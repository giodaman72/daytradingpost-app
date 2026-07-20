import type {
  AcademyCourse,
  AcademyLessonType,
  AcademyProgressStatus,
  AcademyVideo,
} from "@/types/academy";

export function formatAcademyDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function lessonTypeLabel(type: AcademyLessonType) {
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isLessonLocked(status: AcademyProgressStatus | undefined) {
  return status === "locked";
}

export function filterAcademyCourses(
  courses: AcademyCourse[],
  input: {
    access?: string;
    difficulty?: string;
    query?: string;
  },
) {
  const query = input.query?.trim().toLowerCase();
  return courses.filter((course) => {
    if (
      input.difficulty &&
      input.difficulty !== "all" &&
      course.difficulty !== input.difficulty
    )
      return false;
    if (
      input.access &&
      input.access !== "all" &&
      course.accessLevel !== input.access
    )
      return false;
    if (!query) return true;
    return [
      course.title,
      course.excerpt,
      course.category?.title ?? "",
      course.instructor?.name ?? "",
      ...course.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export type AcademyVideoSource =
  | { kind: "iframe"; src: string }
  | { kind: "native"; src: string }
  | { kind: "unavailable"; src: null };

function validHttpsUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function normalizeAcademyVideoResumePosition(
  position: number,
  duration: number,
  completionThreshold = 0.9,
) {
  if (
    !Number.isFinite(position) ||
    !Number.isFinite(duration) ||
    position <= 0 ||
    duration <= 0
  )
    return 0;
  const clamped = Math.min(Math.floor(position), Math.floor(duration));
  return clamped / duration >= completionThreshold ? 0 : clamped;
}

export function getAcademyVideoSource(
  video: AcademyVideo,
  resumePosition = 0,
): AcademyVideoSource {
  const id = video.providerVideoId?.trim();
  const resume = normalizeAcademyVideoResumePosition(
    resumePosition,
    video.durationSeconds,
  );
  if (video.provider === "youtube" && id && /^[\w-]{6,32}$/.test(id))
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0${resume ? `&start=${resume}` : ""}`,
    };
  if (video.provider === "vimeo" && id && /^\d{5,20}$/.test(id))
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${id}?dnt=1&api=1${resume ? `#t=${resume}s` : ""}`,
    };
  if (video.provider === "youtube" || video.provider === "vimeo")
    return { kind: "unavailable", src: null };
  const playback = validHttpsUrl(video.playbackUrl);
  if (!playback) return { kind: "unavailable", src: null };
  if (video.provider === "mux")
    return playback.hostname === "stream.mux.com"
      ? { kind: "native", src: playback.toString() }
      : { kind: "unavailable", src: null };
  if (
    video.provider === "cloudflare-stream" &&
    playback.hostname.endsWith("videodelivery.net") &&
    playback.pathname.includes("/iframe")
  )
    return { kind: "iframe", src: playback.toString() };
  if (video.provider === "cloudflare-stream")
    return { kind: "unavailable", src: null };
  return { kind: "native", src: playback.toString() };
}

export function isSafeAcademyResourceUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return true;
  const url = validHttpsUrl(value);
  if (!url) return false;
  return !["javascript:", "data:", "file:"].includes(url.protocol);
}
