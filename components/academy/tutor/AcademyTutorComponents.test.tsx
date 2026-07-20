import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AcademyTutorContextBadge } from "./AcademyTutorContextBadge";
import { AcademyTutorDisclaimer } from "./AcademyTutorDisclaimer";
import { AcademyTutorEmptyState } from "./AcademyTutorEmptyState";

describe("Academy Tutor components", () => {
  it("discloses the active course and lesson context", () => {
    render(
      <AcademyTutorContextBadge
        courseTitle="Risk Foundations"
        lessonTitle="Position sizing"
      />,
    );
    expect(
      screen.getByText("Risk Foundations · Position sizing"),
    ).toBeInTheDocument();
  });

  it("renders accessible educational and assessment boundaries", () => {
    render(
      <>
        <AcademyTutorEmptyState lessonTitle="Market structure" />
        <AcademyTutorDisclaimer />
      </>,
    );
    expect(
      screen.getByRole("heading", { name: /market structure/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cannot answer graded assessments/i),
    ).toBeInTheDocument();
  });
});
