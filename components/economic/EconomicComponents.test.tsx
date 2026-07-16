import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { developmentEconomicProvider } from "@/lib/economic/providers/developmentProvider";
import { EconomicCard } from "./EconomicCard";
import { EconomicTable } from "./EconomicTable";
import { ImpactBadge } from "./ImpactBadge";

describe("economic components", () => {
  it("communicates impact with text, not color alone", () => {
    render(<ImpactBadge impact="high" />);
    expect(screen.getByText("High impact")).toBeInTheDocument();
  });

  it("labels fixtures and renders semantic event time", async () => {
    const events = await developmentEconomicProvider.getWeek(
      new Date("2026-07-15T12:00:00Z"),
      "America/New_York",
    );
    render(<EconomicCard event={events[0]} />);
    expect(screen.getByText(/simulated schedule/i)).toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute(
      "datetime",
      events[0].scheduledTime,
    );
  });

  it("renders an accessible responsive table", async () => {
    const events = await developmentEconomicProvider.getWeek(
      new Date("2026-07-15T12:00:00Z"),
      "America/New_York",
    );
    render(<EconomicTable events={events.slice(0, 2)} />);
    expect(
      screen.getByRole("table", { name: /economic events/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").length).toBe(8);
  });
});
