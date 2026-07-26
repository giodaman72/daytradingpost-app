import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TradingViewChart } from "@/components/charts/TradingViewChart";
import {
  loadTradingViewScript,
  tradingViewWidgetConfig,
} from "./tradingViewWidgetProvider";
describe("TradingView public widget adapter", () => {
  it("centralizes documented widget configuration", () =>
    expect(
      tradingViewWidgetConfig("chart", "OANDA:XAUUSD", "1h"),
    ).toMatchObject({
      container_id: "chart",
      symbol: "OANDA:XAUUSD",
      interval: "60",
    }));
  it("loads the provider script only once", async () => {
    const first = loadTradingViewScript();
    const second = loadTradingViewScript();
    expect(first).toBe(second);
    document
      .getElementById("daytradingpost-tradingview-script")
      ?.dispatchEvent(new Event("load"));
    await expect(first).resolves.toBeUndefined();
    expect(
      document.querySelectorAll("#daytradingpost-tradingview-script"),
    ).toHaveLength(1);
  });
  it("cleans up the widget instance on unmount", async () => {
    const remove = vi.fn();
    window.TradingView = {
      widget: class {
        remove = remove;
      },
    };
    const view = render(
      <TradingViewChart symbol="OANDA:XAUUSD" timeframe="1h" name="Gold" />,
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText("Gold TradingView chart"),
      ).toBeInTheDocument(),
    );
    view.unmount();
    expect(remove).toHaveBeenCalledOnce();
  });
});
