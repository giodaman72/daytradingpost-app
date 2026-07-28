import { describe, expect, it } from "vitest";
import { calculateReviewAggregate } from "./reviewRepository";
import {
  parseAcademyRating,
  parseAcademyReview,
  parseReviewModeration,
} from "./reviewValidation";

describe("Academy reviews", () => {
  it("accepts only whole ratings from one to five", () => {
    expect(parseAcademyRating(1)).toBe(1);
    expect(parseAcademyRating(5)).toBe(5);
    expect(() => parseAcademyRating(0)).toThrow();
    expect(() => parseAcademyRating(3.5)).toThrow();
    expect(() => parseAcademyRating(6)).toThrow();
  });

  it("normalizes learner text and enforces limits", () => {
    expect(
      parseAcademyReview({
        rating: 4,
        reviewText: "  <b>Helpful</b> course  ",
        title: "  Clear  ",
      }),
    ).toMatchObject({
      rating: 4,
      reviewText: "Helpful course",
      title: "Clear",
    });
    expect(() =>
      parseAcademyReview({
        rating: 4,
        reviewText: "x".repeat(2001),
        title: "x",
      }),
    ).toThrow();
  });

  it("calculates aggregates only from valid supplied published ratings", () => {
    expect(calculateReviewAggregate([5, 4, 3])).toEqual({
      averageRating: 4,
      publishedCount: 3,
    });
    expect(calculateReviewAggregate([])).toEqual({
      averageRating: null,
      publishedCount: 0,
    });
    expect(calculateReviewAggregate([0, 6, 4.5])).toEqual({
      averageRating: null,
      publishedCount: 0,
    });
  });

  it("validates moderation status and requires a reason", () => {
    expect(
      parseReviewModeration({
        reason: "Meets guidelines",
        status: "published",
      }),
    ).toEqual({ reason: "Meets guidelines", status: "published" });
    expect(() =>
      parseReviewModeration({ reason: "", status: "published" }),
    ).toThrow();
  });
});
