"use client";

import Link from "next/link";
import type {
  AcademyCourse,
  AcademyRecommendationReason,
} from "@/types/academy";
import {
  academyIdempotencyKey,
  recordAcademyClientEvent,
} from "../academyClient";
import { RecommendationReason } from "./RecommendationReason";

export function RecommendedCourseCard({
  course,
  reason,
  reasonText,
}: {
  course: AcademyCourse;
  reason: AcademyRecommendationReason;
  reasonText: string;
}) {
  return (
    <article className="academy-recommendation-card">
      <span className="academy-access-badge">{course.difficulty}</span>
      <h2>{course.title}</h2>
      <p>{course.excerpt}</p>
      <RecommendationReason>{reasonText}</RecommendationReason>
      <Link
        className="button"
        href={`/academy/courses/${course.slug}`}
        onClick={() =>
          recordAcademyClientEvent({
            courseId: course.id,
            idempotencyKey: academyIdempotencyKey(
              `academy-recommendation-opened-${reason}`,
            ),
            name: "academy_recommendation_opened",
          })
        }
      >
        View course
      </Link>
    </article>
  );
}
