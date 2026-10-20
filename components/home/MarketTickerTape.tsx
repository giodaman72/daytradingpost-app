"use client";

import { useEffect, useRef } from "react";
import {
  getHomepageInstruments,
  type InstrumentDefinition,
} from "@/constants/instruments";
import type { Locale } from "@/lib/i18n/config";
import { translateInstrumentName } from "@/lib/i18n/spanish";

const TICKER_TAPE_SCRIPT =
  "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";

/** Builds the TradingView ticker-tape config for the homepage markets. */
export function tickerTapeConfig(
  instruments: InstrumentDefinition[],
  locale: Locale,
) {
  return {
    symbols: instruments.map((instrument) => ({
      proName: instrument.tradingViewSymbol,
      title:
        locale === "es"
          ? translateInstrumentName(instrument.name)
          : instrument.name,
    })),
    showSymbolLogo: true,
    isTransparent: true,
    displayMode: "adaptive",
    colorTheme: "dark",
    locale,
  };
}

/**
 * Free TradingView ticker tape for the homepage market strip. It is used
 * while no first-party market-data provider is configured, so visitors see
 * live prices instead of "Data unavailable" cards.
 */
export function MarketTickerTape({ locale }: { locale: Locale }) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    const script = document.createElement("script");
    script.src = TICKER_TAPE_SCRIPT;
    script.async = true;
    script.type = "text/javascript";
    script.textContent = JSON.stringify(
      tickerTapeConfig(getHomepageInstruments(), locale),
    );
    widget.replaceChildren();
    widget.after(script);
    return () => {
      script.remove();
      // TradingView injects an iframe next to the script; clear it all.
      widget.parentElement
        ?.querySelectorAll("iframe")
        .forEach((frame) => frame.remove());
      widget.replaceChildren();
    };
  }, [locale]);

  const spanish = locale === "es";
  return (
    <div className="market-ticker-tape">
      <div className="tradingview-widget-container">
        <div
          ref={widgetRef}
          className="tradingview-widget-container__widget"
          aria-label={
            spanish
              ? "Cotizaciones de mercado de TradingView"
              : "TradingView market quotes"
          }
        />
      </div>
      <p className="market-ticker-attribution">
        {spanish ? "Cotizaciones de " : "Quotes by "}
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          TradingView
        </a>
        {spanish
          ? ". DayTradingPost no es propietario de estos datos."
          : ". DayTradingPost does not own this data."}
      </p>
    </div>
  );
}
