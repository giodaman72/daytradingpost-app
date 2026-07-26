"use client";
import { useEffect, useId, useState } from "react";
import {
  loadTradingViewScript,
  tradingViewWidgetConfig,
} from "@/lib/charts/adapters/tradingViewWidgetProvider";
import type { ChartTimeframe } from "@/types/chart-timeframe";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => { remove?: () => void };
    };
  }
}
export function TradingViewChart({
  symbol,
  timeframe,
  name,
}: {
  symbol: string;
  timeframe: ChartTimeframe;
  name: string;
}) {
  const id = `tv-${useId().replaceAll(":", "")}`;
  const [error, setError] = useState("");
  useEffect(() => {
    let widget: { remove?: () => void } | null = null;
    let active = true;
    void loadTradingViewScript()
      .then(() => {
        if (!active || !window.TradingView) return;
        widget = new window.TradingView.widget(
          tradingViewWidgetConfig(id, symbol, timeframe),
        );
      })
      .catch(
        () => active && setError("TradingView is temporarily unavailable."),
      );
    return () => {
      active = false;
      widget?.remove?.();
      document.getElementById(id)?.replaceChildren();
    };
  }, [id, symbol, timeframe]);
  if (error)
    return (
      <div className="chart-unavailable" role="alert">
        {error}
      </div>
    );
  return (
    <div className="chart-frame">
      <div id={id} aria-label={`${name} TradingView chart`} />
      <p>
        Chart and third-party market data supplied by TradingView.
        DayTradingPost does not own this data.
      </p>
    </div>
  );
}
