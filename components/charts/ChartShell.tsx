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
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function ChartShell({
  initialInstrument,
  initialTimeframe,
  provider,
  layouts,
  premium,
  authenticated,
  locale = "en",
}: {
  initialInstrument: InstrumentDefinition;
  initialTimeframe: ChartTimeframe;
  provider: ChartProviderId;
  layouts: ChartLayout[];
  premium: boolean;
  authenticated: boolean;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const router = useRouter();
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [indicators, setIndicators] = useState<ChartIndicatorConfig[]>([]);
  const [bars, setBars] = useState<ChartCandle[]>([]);
  const [meta, setMeta] = useState<ChartBarsResponse["meta"] | null>(null);
  const [status, setStatus] = useState(
    provider === "tradingview"
      ? ""
      : spanish
        ? "Cargando velas normalizadas…"
        : "Loading normalized candles…",
  );
  const usesTradingView = provider === "tradingview";
  function changeTimeframe(value: ChartTimeframe) {
    if (!usesTradingView)
      setStatus(
        spanish
          ? "Cargando velas normalizadas…"
          : "Loading normalized candles…",
      );
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
          !controller.signal.aborted &&
          setStatus(
            spanish
              ? "Los datos del gráfico no están disponibles."
              : "Chart data is unavailable.",
          ),
      );
    return () => controller.abort();
  }, [initialInstrument.slug, spanish, timeframe, usesTradingView]);
  function toggleIndicator(id: ChartIndicatorId) {
    const definition = CHART_INDICATORS[id];
    if (definition.premium && !premium) {
      setStatus(
        spanish
          ? "Este indicador requiere acceso Premium."
          : "This indicator requires premium access.",
      );
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
        ? spanish
          ? "Diseño guardado."
          : "Layout saved."
        : spanish
          ? "No se pudo guardar el diseño."
          : (body?.message ?? "Could not save layout."),
    );
  }
  function loadLayout(layout: ChartLayout) {
    setTimeframe(layout.timeframe);
    setIndicators(layout.indicators);
    setStatus(
      spanish ? `Diseño ${layout.name} cargado.` : `Loaded ${layout.name}.`,
    );
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
      setStatus(spanish ? "Enlace copiado." : "Share link copied.");
    } else
      setStatus(
        spanish
          ? "No se pudo compartir el diseño."
          : (body?.message ?? "Could not share layout."),
      );
  }
  return (
    <section
      className="advanced-chart"
      aria-label={`${initialInstrument.name} ${spanish ? "gráfico avanzado" : "advanced chart"}`}
    >
      <ChartToolbar
        instrument={initialInstrument.slug}
        timeframe={timeframe}
        supportedTimeframes={initialInstrument.supportedTimeframes}
        indicators={indicators.map((item) => item.id)}
        onInstrument={(slug) =>
          router.push(localizeHref(`/charts/${slug}`, locale))
        }
        onTimeframe={changeTimeframe}
        onIndicator={toggleIndicator}
        locale={locale}
      />
      <div className="chart-status-row" role="status">
        <strong>
          {usesTradingView
            ? spanish
              ? "Widget público de TradingView"
              : "TradingView public widget"
            : spanish
              ? "Gráfico propio de DayTradingPost"
              : "DayTradingPost first-party chart"}
        </strong>
        <span>
          {meta?.fixture
            ? spanish
              ? "Ejemplo de desarrollo"
              : "Development fixture"
            : meta?.delayed || initialInstrument.delayedByDefault
              ? spanish
                ? "Datos retrasados o dependientes del proveedor"
                : "Delayed/provider-dependent data"
              : spanish
                ? "Estado del proveedor no disponible"
                : "Provider status unavailable"}
        </span>
      </div>
      {status ? <p className="chart-inline-status">{status}</p> : null}
      {usesTradingView ? (
        <TradingViewChart
          symbol={initialInstrument.tradingViewSymbol}
          timeframe={timeframe}
          name={initialInstrument.name}
          locale={locale}
        />
      ) : (
        <ChartCanvas
          bars={bars}
          name={initialInstrument.name}
          locale={locale}
        />
      )}
      <div className="chart-actions">
        {authenticated ? (
          <button type="button" onClick={() => void saveLayout()}>
            {spanish ? "Guardar diseño" : "Save layout"}
          </button>
        ) : null}
        {layouts[0] ? (
          <button type="button" onClick={() => loadLayout(layouts[0])}>
            {spanish ? "Cargar" : "Load"} {layouts[0].name}
          </button>
        ) : null}
        {premium && layouts[0] ? (
          <button type="button" onClick={() => void shareLayout(layouts[0])}>
            {spanish ? "Compartir diseño guardado" : "Share saved layout"}
          </button>
        ) : null}
        <button type="button" onClick={() => setIndicators([])}>
          {spanish ? "Restablecer diseño" : "Reset layout"}
        </button>
        <a href={`/alerts/new?instrument=${initialInstrument.slug}`}>
          {spanish ? "Crear alerta" : "Create alert"}
        </a>
        <a
          href={`/assistant?mode=market_analysis&instrument=${initialInstrument.slug}&prompt=${encodeURIComponent(`Explain the ${timeframe} chart context and selected indicators: ${indicators.map((item) => item.id).join(", ") || "none"}.`)}`}
        >
          {spanish
            ? "Preguntar a la IA por el contexto normalizado"
            : "Ask AI about normalized chart context"}
        </a>
      </div>
      {layouts.length ? (
        <p>
          {spanish
            ? `${layouts.length} diseño${layouts.length === 1 ? "" : "s"} guardado${layouts.length === 1 ? "" : "s"} disponible${layouts.length === 1 ? "" : "s"}.`
            : `${layouts.length} saved layout${layouts.length === 1 ? "" : "s"} available.`}
        </p>
      ) : null}
      <ChartAccessibilitySummary
        name={initialInstrument.name}
        timeframe={timeframe}
        bars={bars}
        indicators={indicators}
        delayed={meta?.delayed ?? initialInstrument.delayedByDefault}
        locale={locale}
      />
      <p className="chart-risk-disclaimer">
        {spanish
          ? "Información únicamente educativa; no es asesoramiento de inversión ni ejecución de operaciones. Verifica de forma independiente las horas y el estado de los datos del proveedor."
          : "Educational information only—not investment advice or trade execution. Verify provider timestamps and data status independently."}
      </p>
    </section>
  );
}
