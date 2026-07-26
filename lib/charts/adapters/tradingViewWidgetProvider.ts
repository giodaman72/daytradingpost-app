import type { ChartTimeframe } from "@/types/chart-timeframe";
import { toTradingViewInterval } from "../chartTimeframes";

const SCRIPT_ID = "daytradingpost-tradingview-script";
let loader: Promise<void> | null = null;
export function loadTradingViewScript(timeoutMs = 10_000) {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Browser required."));
  if ("TradingView" in window) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      SCRIPT_ID,
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const timeout = window.setTimeout(
      () => reject(new Error("TradingView timed out.")),
      timeoutMs,
    );
    script.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeout);
        loader = null;
        reject(new Error("TradingView unavailable."));
      },
      { once: true },
    );
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      document.head.append(script);
    }
  });
  return loader;
}
export function tradingViewWidgetConfig(
  containerId: string,
  symbol: string,
  timeframe: ChartTimeframe,
) {
  return {
    autosize: true,
    container_id: containerId,
    symbol,
    interval: toTradingViewInterval(timeframe),
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    allow_symbol_change: false,
    calendar: false,
    hide_side_toolbar: false,
    withdateranges: true,
  };
}
