import Link from "next/link";
import type { AcademyLearningRecommendation } from "@/types/academy";
import { RecommendationReason } from "./RecommendationReason";

export function LearningPathRecommendation({
  recommendation,
}: {
  recommendation: AcademyLearningRecommendation;
}) {
  return (
    <article className="academy-recommendation-card learning-path">
      <span className="section-kicker">Learning path</span>
      <h2>{recommendation.course.title}</h2>
      <RecommendationReason>{recommendation.reasonText}</RecommendationReason>
      <Link href={recommendation.href} className="text-link">
        Open next course <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
