import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getHomepageInstruments } from "@/constants/instruments";
import { MarketTickerTape, tickerTapeConfig } from "./MarketTickerTape";

describe("homepage TradingView ticker tape", () => {
  it("lists every homepage market with its TradingView symbol", () => {
    const instruments = getHomepageInstruments();
    const config = tickerTapeConfig(instruments, "en");

    expect(config.symbols).toHaveLength(instruments.length);
    expect(config.symbols).toContainEqual({
      proName: "OANDA:XAUUSD",
      title: "Gold",
    });
    expect(config.symbols).toContainEqual({
      proName: "CAPITALCOM:US100",
      title: "Nasdaq 100",
    });
    expect(config.locale).toBe("en");
  });

  it("uses Spanish market names and locale on the Spanish homepage", () => {
    const config = tickerTapeConfig(getHomepageInstruments(), "es");

    expect(config.locale).toBe("es");
    expect(config.symbols.map((item) => item.proName)).toContain(
      "OANDA:XAGUSD",
    );
  });

  it("loads the TradingView embed script with the config", () => {
    const { container } = render(<MarketTickerTape locale="en" />);

    const script = container.querySelector("script");
    expect(script?.src).toBe(
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
    );
    expect(JSON.parse(script?.textContent ?? "{}").symbols).toHaveLength(
      getHomepageInstruments().length,
    );
    expect(screen.getByRole("link", { name: "TradingView" })).toHaveAttribute(
      "href",
      "https://www.tradingview.com/",
    );
  });
});
