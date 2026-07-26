"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHART_INDICATORS } from "@/lib/charts/chartIndicators";
import type {
  ChartBarsResponse,
  ChartCandle,
  ChartProviderId,
} from "@/types/chart";
import type {
  ChartIndicatorConfig,
  ChartIndicatorId,
} from "@/types/chart-indicator";
import type { ChartLayout } from "@/types/chart-layout";
import type { ChartTimeframe } from "@/types/chart-timeframe";
import type { InstrumentDefinition } from "@/constants/instruments";
import { ChartAccessibilitySummary } from "./ChartAccessibilitySummary";
import { ChartCanvas } from "./ChartCanvas";
import { ChartToolbar } from "./ChartToolbar";
import { TradingViewChart } from "./TradingViewChart";

export function ChartShell({
  initialInstrument,
  initialTimeframe,
  provider,
  layouts,
  premium,
  authenticated,
}: {
  initialInstrument: InstrumentDefinition;
  initialTimeframe: ChartTimeframe;
  provider: ChartProviderId;
  layouts: ChartLayout[];
  premium: boolean;
  authenticated: boolean;
}) {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [indicators, setIndicators] = useState<ChartIndicatorConfig[]>([]);
  const [bars, setBars] = useState<ChartCandle[]>([]);
  const [meta, setMeta] = useState<ChartBarsResponse["meta"] | null>(null);
  const [status, setStatus] = useState(
    provider === "tradingview" ? "" : "Loading normalized candles…",
  );
  const usesTradingView = provider === "tradingview";
  function changeTimeframe(value: ChartTimeframe) {
    if (!usesTradingView) setStatus("Loading normalized candles…");
    setTimeframe(value);
    window.localStorage.setItem(
      `dtp-chart-timeframe:${initialInstrument.slug}`,
      value,
    );
    if (authenticated)
      void fetch("/api/chart-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrumentSlug: initialInstrument.slug,
          preferredProvider: provider,
          preferredTimeframe: value,
          showVolume: true,
          showEditorialOverlays: true,
          showEconomicEvents: false,
          showAlertLevels: false,
          theme: "dark",
          timezone: initialInstrument.timezone,
        }),
      });
  }
  useEffect(() => {
    if (usesTradingView) return;
    const controller = new AbortController();
    void fetch(
      `/api/charts/bars?instrument=${initialInstrument.slug}&timeframe=${timeframe}&limit=200`,
      { signal: controller.signal },
    )
      .then((response) => response.json())
      .then((result: ChartBarsResponse) => {
        setBars(result.data ?? []);
        setMeta(result.meta ?? null);
        setStatus("");
      })
      .catch(
        () =>
          !controller.signal.aborted && setStatus("Chart data is unavailable."),
      );
    return () => controller.abort();
  }, [initialInstrument.slug, timeframe, usesTradingView]);
  function toggleIndicator(id: ChartIndicatorId) {
    const definition = CHART_INDICATORS[id];
    if (definition.premium && !premium) {
      setStatus("This indicator requires premium access.");
      return;
    }
    setIndicators((current) =>
      current.some((item) => item.id === id)
        ? current.filter((item) => item.id !== id)
        : [...current, { id, parameters: definition.defaults }],
    );
  }
  async function saveLayout() {
    const response = await fetch("/api/chart-layouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${initialInstrument.name} ${timeframe}`,
        instrumentSlug: initialInstrument.slug,
        provider,
        timeframe,
        indicators,
        settings: {
          showEditorialOverlays: true,
          showEconomicEvents: false,
          showAlertLevels: false,
          theme: "dark",
        },
      }),
    });
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    setStatus(
      response.ok
        ? "Layout saved."
        : (body?.message ?? "Could not save layout."),
    );
  }
  function loadLayout(layout: ChartLayout) {
    setTimeframe(layout.timeframe);
    setIndicators(layout.indicators);
    setStatus(`Loaded ${layout.name}.`);
  }
  async function shareLayout(layout: ChartLayout) {
    const response = await fetch(`/api/chart-layouts/${layout.id}/share`, {
      method: "POST",
    });
    const body = (await response.json().catch(() => null)) as {
      data?: ChartLayout;
      message?: string;
    } | null;
    if (response.ok && body?.data?.shareId) {
      await navigator.clipboard?.writeText(
        `${window.location.origin}/charts/share/${body.data.shareId}`,
      );
      setStatus("Share link copied.");
    } else setStatus(body?.message ?? "Could not share layout.");
  }
  return (
    <section
      className="advanced-chart"
      aria-label={`${initialInstrument.name} advanced chart`}
    >
      <ChartToolbar
        instrument={initialInstrument.slug}
        timeframe={timeframe}
        supportedTimeframes={initialInstrument.supportedTimeframes}
        indicators={indicators.map((item) => item.id)}
        onInstrument={(slug) => router.push(`/charts/${slug}`)}
        onTimeframe={changeTimeframe}
        onIndicator={toggleIndicator}
      />
      <div className="chart-status-row" role="status">
        <strong>
          {usesTradingView
            ? "TradingView public widget"
            : "DayTradingPost first-party chart"}
        </strong>
        <span>
          {meta?.fixture
            ? "Development fixture"
            : meta?.delayed || initialInstrument.delayedByDefault
              ? "Delayed/provider-dependent data"
              : "Provider status unavailable"}
        </span>
      </div>
      {status ? <p className="chart-inline-status">{status}</p> : null}
      {usesTradingView ? (
        <TradingViewChart
          symbol={initialInstrument.tradingViewSymbol}
          timeframe={timeframe}
          name={initialInstrument.name}
        />
      ) : (
        <ChartCanvas bars={bars} name={initialInstrument.name} />
      )}
      <div className="chart-actions">
        {authenticated ? (
          <button type="button" onClick={() => void saveLayout()}>
            Save layout
          </button>
        ) : null}
        {layouts[0] ? (
          <button type="button" onClick={() => loadLayout(layouts[0])}>
            Load {layouts[0].name}
          </button>
        ) : null}
        {premium && layouts[0] ? (
          <button type="button" onClick={() => void shareLayout(layouts[0])}>
            Share saved layout
          </button>
        ) : null}
        <button type="button" onClick={() => setIndicators([])}>
          Reset layout
        </button>
        <a href={`/alerts/new?instrument=${initialInstrument.slug}`}>
          Create alert
        </a>
        <a
          href={`/assistant?mode=market_analysis&instrument=${initialInstrument.slug}&prompt=${encodeURIComponent(`Explain the ${timeframe} chart context and selected indicators: ${indicators.map((item) => item.id).join(", ") || "none"}.`)}`}
        >
          Ask AI about normalized chart context
        </a>
      </div>
      {layouts.length ? (
        <p>
          {layouts.length} saved layout{layouts.length === 1 ? "" : "s"}{" "}
          available.
        </p>
      ) : null}
      <ChartAccessibilitySummary
        name={initialInstrument.name}
        timeframe={timeframe}
        bars={bars}
        indicators={indicators}
        delayed={meta?.delayed ?? initialInstrument.delayedByDefault}
      />
      <p className="chart-risk-disclaimer">
        Educational information only—not investment advice or trade execution.
        Verify provider timestamps and data status independently.
      </p>
    </section>
  );
}
