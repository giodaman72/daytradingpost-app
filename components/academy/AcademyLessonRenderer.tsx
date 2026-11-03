import { BarChart3, ExternalLink, Radio, Video } from "lucide-react";
import type { AcademyLesson, AcademyLessonType } from "@/types/academy";
import {
  academyLessonText,
  type AcademyLessonTranslate,
} from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";
import { isSafeAcademyResourceUrl } from "@/lib/academy/academyPresentation";
import { AcademyPortableText } from "./AcademyPortableText";
import { AcademyVideoPlayer } from "./AcademyVideoPlayer";

type AcademyLessonRendererProps = {
  courseId: string;
  enrollmentId: string;
  initialPosition: number;
  lesson: AcademyLesson;
  locale?: Locale;
  moduleId: string;
};

export type AcademyLessonRendererKind =
  | "assessment"
  | "chart-practice"
  | "external-resource"
  | "text"
  | "video"
  | "webinar-replay";

export function academyLessonRendererKind(
  lessonType: AcademyLessonType,
): AcademyLessonRendererKind {
  if (lessonType === "quiz" || lessonType === "assessment") return "assessment";
  if (lessonType === "chart-practice") return "chart-practice";
  if (lessonType === "external-resource") return "external-resource";
  if (lessonType === "webinar-replay") return "webinar-replay";
  if (lessonType === "video" || lessonType === "mixed") return "video";
  return "text";
}

function LessonTranscript({
  lesson,
  tr,
}: {
  lesson: AcademyLesson;
  tr: AcademyLessonTranslate;
}) {
  if (!lesson.video?.transcript?.length) return null;
  return (
    <details className="academy-transcript">
      <summary>{tr("Open video transcript")}</summary>
      <div>
        <AcademyPortableText value={lesson.video.transcript} />
      </div>
    </details>
  );
}

export function AcademyLessonRenderer({
  courseId,
  enrollmentId,
  initialPosition,
  lesson,
  locale = "en",
  moduleId,
}: AcademyLessonRendererProps) {
  const tr = academyLessonText(locale);
  const renderer = academyLessonRendererKind(lesson.lessonType);

  if (renderer === "external-resource") {
    const safeUrl =
      "externalUrl" in lesson && isSafeAcademyResourceUrl(lesson.externalUrl)
        ? lesson.externalUrl
        : null;
    return (
      <>
        <AcademyPortableText value={lesson.body} />
        <section className="academy-external-resource-notice">
          <ExternalLink aria-hidden="true" />
          <div>
            <h2>{tr("External educational resource")}</h2>
            <p>
              {tr(
                "This link leaves DayTradingPost. Review the destination and its terms before continuing.",
              )}
            </p>
            {safeUrl ? (
              <a
                className="button button-secondary"
                href={safeUrl}
                target="_blank"
                rel="noreferrer noopener external"
              >
                {tr("Open approved external resource")}
              </a>
            ) : (
              <p role="status">
                {tr("This external resource is unavailable.")}
              </p>
            )}
          </div>
        </section>
      </>
    );
  }

  if (renderer === "chart-practice") {
    return (
      <>
        <AcademyPortableText value={lesson.body} />
        <section
          className="academy-chart-practice"
          aria-labelledby="chart-practice-title"
        >
          <BarChart3 aria-hidden="true" />
          <div>
            <span className="section-kicker">{tr("Practice foundation")}</span>
            <h2 id="chart-practice-title">{tr("Chart practice workspace")}</h2>
            <p>
              {tr(
                "Interactive chart integration is not available in this repository. Use the lesson instructions and any provided historical examples. Nothing shown here is a live quote or trade recommendation.",
              )}
            </p>
          </div>
        </section>
      </>
    );
  }

  if ((renderer === "video" || renderer === "webinar-replay") && lesson.video) {
    return (
      <>
        {renderer === "webinar-replay" ? (
          <div className="academy-webinar-replay" role="note">
            <Radio aria-hidden="true" />
            <p>
              <strong>{tr("Recorded webinar replay.")}</strong>{" "}
              {tr(
                "Market commentary and prices discussed in this recording are historical, not current.",
              )}
            </p>
          </div>
        ) : null}
        <AcademyVideoPlayer
          courseId={courseId}
          enrollmentId={enrollmentId}
          initialPosition={initialPosition}
          lessonId={lesson.id}
          locale={locale}
          moduleId={moduleId}
          video={lesson.video}
        />
        <LessonTranscript lesson={lesson} tr={tr} />
        <AcademyPortableText value={lesson.body} />
      </>
    );
  }

  if (renderer === "assessment")
    return (
      <>
        <div className="academy-assessment-intro" role="note">
          <Video aria-hidden="true" />
          <p>
            {tr(
              "Review the lesson material before starting. A formal attempt begins only after you activate the assessment control below.",
            )}
          </p>
        </div>
        <AcademyPortableText value={lesson.body} />
      </>
    );

  return <AcademyPortableText value={lesson.body} />;
}
