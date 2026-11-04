import { Star } from "lucide-react";
import type { AcademyReviewAggregate } from "@/types/academy";
import { academyLessonText } from "@/lib/academy/academyLessonText";
import type { Locale } from "@/lib/i18n/config";

export function AcademyReviewSummary({
  aggregate,
  locale = "en",
}: {
  aggregate: AcademyReviewAggregate;
  locale?: Locale;
}) {
  const tr = academyLessonText(locale);
  const spanish = locale === "es";
  if (!aggregate.publishedCount)
    return <p>{tr("No published learner reviews yet.")}</p>;
  return (
    <p className="academy-review-summary">
      <Star size={18} aria-hidden="true" />
      <strong>
        {aggregate.averageRating} {tr("out of 5")}
      </strong>
      <span>
        {spanish
          ? `de ${aggregate.publishedCount} ${aggregate.publishedCount === 1 ? "reseña verificada" : "reseñas verificadas"} de estudiantes`
          : `from ${aggregate.publishedCount} verified learner ${aggregate.publishedCount === 1 ? "review" : "reviews"}`}
      </span>
    </p>
  );
}
