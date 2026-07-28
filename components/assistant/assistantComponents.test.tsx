import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssistantContextBadge } from "./AssistantContextBadge";
import { AssistantCitationList } from "./AssistantCitationList";

describe("assistant UI components", () => {
  it("renders a readable context mode", () => {
    render(<AssistantContextBadge mode="risk_management" />);
    expect(screen.getByText("risk management")).toBeInTheDocument();
  });
  it("renders an accessible citation link and data disclosure", () => {
    render(
      <AssistantCitationList
        citations={[
          {
            sourceType: "market_data",
            sourceId: "quote-1",
            title: "Gold snapshot",
            url: "/analysis",
            timestamp: "2026-01-01T00:00:00Z",
            section: null,
            delayed: true,
            premium: false,
            fixture: false,
            excerpt: "A delayed snapshot.",
          },
        ]}
      />,
    );
    expect(
      screen.getByLabelText("Citation 1: Gold snapshot"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Delayed data/)).toBeInTheDocument();
  });
});
