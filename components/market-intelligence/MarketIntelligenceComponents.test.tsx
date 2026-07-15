import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyMarketState } from "./EmptyMarketState";
import { MarketBiasBadge } from "./MarketBiasBadge";
import { MarketOutlookCard } from "./MarketOutlookCard";
import { summarizeMarketIntelligence } from "@/lib/market/marketIntelligenceTransforms";
import { marketIntelligenceFixture } from "@/test/fixtures/marketIntelligence";

describe("market intelligence components", () => {
  it("labels bias as editorial", () => {
    render(<MarketBiasBadge bias="bullish" />);
    expect(screen.getByText("Bullish editorial bias")).toBeInTheDocument();
  });
  it("renders an accessible empty state", () => {
    render(<EmptyMarketState />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "No published outlooks available",
    );
  });
  it("renders an outlook without inventing a price", () => {
    render(
      <MarketOutlookCard
        outlook={summarizeMarketIntelligence(marketIntelligenceFixture())}
      />,
    );
    expect(screen.getByRole("heading", { name: "Gold" })).toBeInTheDocument();
    expect(screen.queryByText("$", { exact: false })).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read the Gold outlook" }),
    ).toHaveAttribute("href", "/analysis/gold-daily-outlook");
  });
});
