import Link from "next/link";
import type { AcademyLearningRecommendation } from "@/types/academy";
import { RecommendationReason } from "./RecommendationReason";

export function NextLessonRecommendation({
  recommendation,
}: {
  recommendation: AcademyLearningRecommendation;
}) {
  return (
    <article className="dashboard-panel academy-next-learning">
      <span className="section-kicker">Continue learning</span>
      <h2>{recommendation.lessonTitle ?? recommendation.course.title}</h2>
      <p>{recommendation.course.excerpt}</p>
      <RecommendationReason>{recommendation.reasonText}</RecommendationReason>
      <Link
        className="button academy-primary-action"
        href={recommendation.href}
      >
        {recommendation.type === "assessment"
          ? "Resume assessment"
          : "Continue learning"}
      </Link>
    </article>
  );
}
