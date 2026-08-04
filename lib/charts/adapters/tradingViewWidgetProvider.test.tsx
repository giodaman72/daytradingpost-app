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
  it("cleans up the widget instance before replacing it", async () => {
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
    view.rerender(
      <TradingViewChart symbol="OANDA:XAUUSD" timeframe="4h" name="Gold" />,
    );
    await waitFor(() => expect(remove).toHaveBeenCalledOnce());
  });
  it("does not remove a widget after its route container is detached", async () => {
    const remove = vi.fn(() => {
      throw new TypeError(
        "Cannot read properties of null (reading 'parentNode')",
      );
    });
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
    view.container.remove();
    expect(() => view.unmount()).not.toThrow();
    expect(remove).not.toHaveBeenCalled();
  });
});
