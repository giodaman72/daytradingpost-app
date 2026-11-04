import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartAccessibilitySummary } from "./ChartAccessibilitySummary";
import { ChartCanvas } from "./ChartCanvas";
describe("chart components", () => {
  it("renders an accessible chart summary", () => {
    render(
      <ChartAccessibilitySummary
        name="Gold"
        timeframe="1h"
        bars={[]}
        indicators={[]}
        delayed
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Accessible chart summary" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delayed")).toBeInTheDocument();
  });
  it("omits empty price rows when TradingView supplies the prices", () => {
    render(
      <ChartAccessibilitySummary
        name="Oro"
        timeframe="1h"
        bars={[]}
        indicators={[]}
        delayed
        locale="es"
        source="tradingview"
      />,
    );
    expect(screen.queryByText("No disponible")).not.toBeInTheDocument();
    expect(screen.queryByText("Retrasados")).not.toBeInTheDocument();
    expect(
      screen.getByText("Precios y hora mostrados en el gráfico de TradingView"),
    ).toBeInTheDocument();
  });
  it("renders a truthful unavailable state without candles", () => {
    render(<ChartCanvas bars={[]} name="Gold" />);
    expect(
      screen.getByText(/No candles have been fabricated/i),
    ).toBeInTheDocument();
  });
});
