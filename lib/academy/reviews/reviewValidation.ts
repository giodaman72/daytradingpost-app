import { AcademyError } from "../academyErrors";
import { normalizePlainText } from "../academyValidation";

export function parseAcademyRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Rating must be a whole number from 1 to 5.",
    );
  return rating;
}

export function parseAcademyReview(input: Record<string, unknown>) {
  return {
    rating: parseAcademyRating(input.rating),
    reviewText: normalizePlainText(input.reviewText, "Review", 2_000),
    title: normalizePlainText(input.title, "Review title", 120),
  };
}

export function parseReviewModeration(input: Record<string, unknown>) {
  if (!["published", "rejected"].includes(String(input.status)))
    throw new AcademyError(
      "ACADEMY_VALIDATION_FAILED",
      "Invalid moderation status.",
    );
  return {
    reason: normalizePlainText(input.reason, "Moderation reason", 500),
    status: String(input.status) as "published" | "rejected",
  };
}
