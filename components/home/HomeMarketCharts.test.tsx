import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeMarketCharts } from "./HomeMarketCharts";

vi.mock("@/components/charts/TradingViewChart", () => ({
  TradingViewChart: ({
    symbol,
    timeframe,
  }: {
    symbol: string;
    timeframe: string;
  }) => (
    <div
      data-testid="provider-chart"
      data-symbol={symbol}
      data-timeframe={timeframe}
    />
  ),
}));

describe("homepage market charts", () => {
  it.each([
    ["dollar-index", "Dollar Index", "INDEX:DXY"],
    ["eurusd", "EUR/USD", "OANDA:EURUSD"],
    ["gbpusd", "GBP/USD", "OANDA:GBPUSD"],
    ["usdjpy", "USD/JPY", "OANDA:USDJPY"],
  ])("opens the requested %s chart", (slug, name, symbol) => {
    render(<HomeMarketCharts locale="en" enabled />);
    expect(screen.getByRole("option", { name })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Market"), {
      target: { value: slug },
    });
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-symbol",
      symbol,
    );
    expect(
      screen.getByRole("link", { name: /Open advanced chart/ }),
    ).toHaveAttribute("href", `/charts/${slug}`);
  });
  it("uses supported daily intervals for the Dollar Index", () => {
    render(<HomeMarketCharts locale="en" enabled />);
    fireEvent.change(screen.getByLabelText("Market"), {
      target: { value: "dollar-index" },
    });
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-timeframe",
      "1d",
    );
    expect(screen.getByLabelText("Timeframe")).toHaveValue("1d");
    expect(
      screen.queryByRole("option", { name: "1 hour" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Timeframe"), {
      target: { value: "1w" },
    });
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-timeframe",
      "1w",
    );
  });
  it("switches the provider symbol, interval, and advanced chart destination", () => {
    render(<HomeMarketCharts locale="en" enabled />);
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-symbol",
      "OANDA:XAUUSD",
    );
    fireEvent.change(screen.getByLabelText("Market"), {
      target: { value: "bitcoin" },
    });
    fireEvent.change(screen.getByLabelText("Timeframe"), {
      target: { value: "4h" },
    });
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-symbol",
      "COINBASE:BTCUSD",
    );
    expect(screen.getByTestId("provider-chart")).toHaveAttribute(
      "data-timeframe",
      "4h",
    );
    expect(
      screen.getByRole("link", { name: /Open advanced chart/ }),
    ).toHaveAttribute("href", "/charts/bitcoin");
    expect(
      screen.getByRole("link", { name: /Open Quant Research/ }),
    ).toHaveAttribute("href", "/research/backtesting");
  });

  it("keeps Spanish controls and destinations localized", () => {
    render(<HomeMarketCharts locale="es" enabled />);
    fireEvent.change(screen.getByLabelText("Mercado"), {
      target: { value: "silver" },
    });
    expect(screen.getByLabelText("Intervalo")).toHaveValue("1h");
    expect(
      screen.getByRole("link", { name: /Abrir gráfico avanzado/ }),
    ).toHaveAttribute("href", "/es/charts/silver");
    expect(
      screen.getByRole("link", { name: /Abrir Quant Research/ }),
    ).toHaveAttribute("href", "/es/research/backtesting");
  });

  it("respects the widget disable setting without displaying simulated data", () => {
    render(<HomeMarketCharts locale="en" enabled={false} />);
    expect(screen.queryByTestId("provider-chart")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Embedded charts are unavailable",
    );
    expect(
      screen.getByRole("link", { name: /Open advanced chart/ }),
    ).toBeInTheDocument();
  });
});
