import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertCard } from "./AlertCard";
import { AlertEmptyState } from "./AlertEmptyState";
import { WatchlistCard } from "@/components/watchlists/WatchlistCard";
const dates = "2026-07-15T12:00:00Z";
describe("smart feature components", () => {
  it("renders a watchlist card", () => {
    render(
      <WatchlistCard
        watchlist={{
          id: "w1",
          userId: "u1",
          name: "FX",
          description: null,
          isDefault: true,
          displayOrder: 0,
          createdAt: dates,
          updatedAt: dates,
          items: [],
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "FX" })).toHaveAttribute(
      "href",
      "/watchlists/w1",
    );
  });
  it("renders alert status as text", () => {
    render(
      <AlertCard
        alert={{
          id: "a1",
          userId: "u1",
          watchlistId: null,
          instrumentSlug: "gold",
          alertType: "price_above",
          name: "Gold alert",
          conditionOperator: "gt",
          thresholdValue: "2500",
          comparisonReference: null,
          economicEventId: null,
          marketIntelligenceField: null,
          channels: ["dashboard"],
          status: "active",
          cooldownMinutes: 60,
          lastEvaluatedAt: null,
          lastTriggeredAt: null,
          expiresAt: null,
          createdAt: dates,
          updatedAt: dates,
        }}
      />,
    );
    expect(screen.getByText("active")).toBeVisible();
  });
  it("renders an actionable empty state", () => {
    render(<AlertEmptyState />);
    expect(screen.getByRole("link", { name: "Create alert" })).toHaveAttribute(
      "href",
      "/alerts/new",
    );
  });
});
