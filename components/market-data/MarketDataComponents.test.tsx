import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getInstrument } from "@/constants/instruments";
import { developmentMarketDataProvider } from "@/lib/market-data/providers/developmentProvider";
import { MarketDataCard } from "./MarketDataCard";

describe("market-data components", () => {
  it("labels simulated quotes and keeps editorial bias out of price cards", async () => {
    const quote = await developmentMarketDataProvider.getQuote(
      getInstrument("gold")!,
    );
    render(<MarketDataCard quote={quote} />);
    expect(screen.getByText("Simulated:")).toBeInTheDocument();
    expect(
      screen.getByText(/not live or delayed market data/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/bias/i)).not.toBeInTheDocument();
  });

  it("uses text and an accessible label in addition to change color", async () => {
    const quote = await developmentMarketDataProvider.getQuote(
      getInstrument("gold")!,
    );
    render(<MarketDataCard quote={quote} />);
    expect(screen.getByLabelText(/daily price up/i)).toHaveTextContent("↑");
    expect(screen.getByText("Status unknown")).toBeInTheDocument();
  });
});
