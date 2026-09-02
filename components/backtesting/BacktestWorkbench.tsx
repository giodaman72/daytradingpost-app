"use client";

import { useMemo, useState } from "react";
import {
  createSyntheticDailyCsv,
  parsePriceBarsCsv,
  priceBarsToCsv,
} from "@/lib/backtesting/csv";
import {
  DEFAULT_TREND_CONFIG,
  runTrendBacktest,
} from "@/lib/backtesting/engine";
import type {
  BacktestResult,
  PriceBar,
  TrendStrategyConfig,
} from "@/lib/backtesting/types";
import type { Locale } from "@/lib/i18n/config";

type NumericConfigKey = keyof TrendStrategyConfig;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(2)}%`;

function EquityCurve({
  result,
  locale,
}: {
  result: BacktestResult;
  locale: Locale;
}) {
  const points = result.equityCurve;
  const values = points.map((point) => point.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 38 - ((point.equity - min) / range) * 34;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div
      className="backtest-chart"
      role="img"
      aria-label={
        locale === "es"
          ? "Curva de capital de la estrategia"
          : "Strategy equity curve"
      }
    >
      <svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true">
        <path d={path} />
      </svg>
      <div>
        <span>{currency.format(min)}</span>
        <span>{currency.format(max)}</span>
      </div>
    </div>
  );
}

type AlpacaBarsResponse = {
  bars?: PriceBar[];
  meta?: {
    symbol: string;
    provider: string;
    feed: string;
    adjustment: string;
    timeframe: string;
    start: string;
    end: string;
    fetchedAt: string;
  };
  message?: string;
};

type DataSource = {
  kind: "synthetic" | "alpaca" | "csv";
  label: string;
  detail: string;
};

export function BacktestWorkbench({
  initialEndDate,
  locale = "en",
}: {
  initialEndDate: string;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const [csv, setCsv] = useState(() => createSyntheticDailyCsv());
  const [config, setConfig] = useState(DEFAULT_TREND_CONFIG);
  const [result, setResult] = useState<BacktestResult>(() =>
    runTrendBacktest(parsePriceBarsCsv(createSyntheticDailyCsv())),
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingAlpaca, setLoadingAlpaca] = useState(false);
  const [symbol, setSymbol] = useState("SPY");
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState(initialEndDate);
  const [dataSource, setDataSource] = useState<DataSource>({
    kind: "synthetic",
    label: spanish ? "Demostración sintética" : "Synthetic demo",
    detail: spanish
      ? "Serie de demostración determinista; no es historial de mercado"
      : "Deterministic demonstration series—not market history",
  });
  const rowCount = useMemo(
    () => Math.max(0, csv.trim().split(/\r?\n/).length - 1),
    [csv],
  );

  const setNumericConfig = (key: NumericConfigKey, value: string) => {
    setConfig((current) => ({ ...current, [key]: Number(value) }));
  };

  const run = () => {
    try {
      const bars = parsePriceBarsCsv(csv);
      setResult(runTrendBacktest(bars, config));
      setError(null);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : spanish
            ? "El backtest falló."
            : "Backtest failed.",
      );
    }
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setError(
        spanish
          ? "Los archivos CSV están limitados a 2 MB en esta herramienta de investigación."
          : "CSV files are limited to 2 MB in this browser-based research tool.",
      );
      return;
    }
    setCsv(await file.text());
    setDataSource({
      kind: "csv",
      label: file.name,
      detail: spanish
        ? "CSV local del navegador; no se carga ni se conserva"
        : "Local browser CSV—not uploaded or persisted",
    });
    setError(null);
  };

  const loadSyntheticDemo = () => {
    const syntheticCsv = createSyntheticDailyCsv();
    setCsv(syntheticCsv);
    setResult(runTrendBacktest(parsePriceBarsCsv(syntheticCsv), config));
    setDataSource({
      kind: "synthetic",
      label: spanish ? "Demostración sintética" : "Synthetic demo",
      detail: spanish
        ? "Serie de demostración determinista; no es historial de mercado"
        : "Deterministic demonstration series—not market history",
    });
    setError(null);
  };

  const loadAlpaca = async () => {
    setLoadingAlpaca(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        symbol,
        start: startDate,
        end: endDate,
      });
      const response = await fetch(`/api/research/alpaca-bars?${query}`);
      const payload = (await response.json()) as AlpacaBarsResponse;
      if (!response.ok)
        throw new Error(
          payload.message ||
            (spanish
              ? "No se pudieron cargar los datos de Alpaca."
              : "Alpaca data could not be loaded."),
        );
      if (!payload.bars?.length || !payload.meta)
        throw new Error(
          spanish
            ? "Alpaca no devolvió barras históricas utilizables."
            : "Alpaca returned no usable historical bars.",
        );

      const historicalCsv = priceBarsToCsv(payload.bars);
      const validatedBars = parsePriceBarsCsv(historicalCsv);
      setCsv(historicalCsv);
      setResult(runTrendBacktest(validatedBars, config));
      setDataSource({
        kind: "alpaca",
        label: `${payload.meta.symbol} · ${payload.meta.provider}`,
        detail: spanish
          ? `${payload.meta.timeframe} barras ajustadas · fuente ${payload.meta.feed.toUpperCase()} · ${payload.meta.start} a ${payload.meta.end}`
          : `${payload.meta.timeframe} adjusted bars · ${payload.meta.feed.toUpperCase()} feed · ${payload.meta.start} to ${payload.meta.end}`,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : spanish
            ? "No se pudieron cargar los datos de Alpaca."
            : "Alpaca data could not be loaded.",
      );
    } finally {
      setLoadingAlpaca(false);
    }
  };

  const fields: Array<{
    key: NumericConfigKey;
    label: string;
    min: number;
    max?: number;
    step?: number;
  }> = [
    {
      key: "initialCapital",
      label: spanish ? "Capital inicial ($)" : "Initial capital ($)",
      min: 100,
      step: 100,
    },
    {
      key: "fastEmaPeriod",
      label: spanish ? "EMA rápida" : "Fast EMA",
      min: 2,
      max: 200,
    },
    {
      key: "slowEmaPeriod",
      label: spanish ? "EMA lenta" : "Slow EMA",
      min: 3,
      max: 400,
    },
    {
      key: "atrPeriod",
      label: spanish ? "Periodo ATR" : "ATR period",
      min: 2,
      max: 100,
    },
    {
      key: "stopAtrMultiple",
      label: spanish ? "Stop (ATR ×)" : "Stop (ATR ×)",
      min: 0.25,
      max: 10,
      step: 0.25,
    },
    {
      key: "targetAtrMultiple",
      label: spanish ? "Objetivo (ATR ×)" : "Target (ATR ×)",
      min: 0.25,
      max: 20,
      step: 0.25,
    },
    {
      key: "riskPerTradePercent",
      label: spanish ? "Riesgo por operación (%)" : "Risk per trade (%)",
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      key: "maxAllocationPercent",
      label: spanish ? "Asignación máxima (%)" : "Max allocation (%)",
      min: 1,
      max: 100,
    },
    {
      key: "feeBps",
      label: spanish ? "Comisión (pb/lado)" : "Fee (bps/side)",
      min: 0,
      max: 100,
      step: 0.5,
    },
    {
      key: "slippageBps",
      label: spanish ? "Deslizamiento (pb/lado)" : "Slippage (bps/side)",
      min: 0,
      max: 100,
      step: 0.5,
    },
  ];

  return (
    <div className="backtest-workbench">
      <section className="backtest-panel" aria-labelledby="strategy-settings">
        <div className="backtest-panel-heading">
          <div>
            <span>{spanish ? "Estrategia 01" : "Strategy 01"}</span>
            <h2 id="strategy-settings">
              {spanish ? "Modelo de tendencia EMA–ATR" : "EMA–ATR trend model"}
            </h2>
          </div>
          <span className="backtest-badge">
            {spanish ? "Solo investigación" : "Research only"}
          </span>
        </div>
        <p>
          {spanish
            ? "Entra en largo cuando la EMA rápida esté por encima de la EMA lenta. Ejecuta en la apertura de la siguiente barra, dimensiona según el riesgo del stop y sal en el stop ATR, el objetivo ATR o la señal bajista de la siguiente barra."
            : "Enter long when the fast EMA is above the slow EMA. Execute on the next bar’s open, size from stop risk, and exit at the ATR stop, ATR target, or next-bar bearish signal."}
        </p>
        <div className="backtest-controls">
          {fields.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <input
                type="number"
                value={config[field.key]}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                onChange={(event) =>
                  setNumericConfig(field.key, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="backtest-panel" aria-labelledby="historical-data">
        <div className="backtest-panel-heading">
          <div>
            <span>{spanish ? "Entrada OHLC diaria" : "Daily OHLC input"}</span>
            <h2 id="historical-data">
              {spanish ? "Datos históricos" : "Historical data"}
            </h2>
          </div>
          <span>
            {dataSource.label} · {rowCount} {spanish ? "filas" : "rows"}
          </span>
        </div>
        <p>
          {spanish
            ? "Carga barras diarias ajustadas de Alpaca para el universo limitado de investigación o utiliza un CSV local. Las credenciales permanecen en el servidor; los archivos CSV se quedan en este navegador y no se cargan."
            : "Load adjusted daily Alpaca bars for the bounded research universe, or use a local CSV. Credentials remain server-side; CSV files stay in this browser and are not uploaded."}
        </p>
        <div className="backtest-source-status" data-source={dataSource.kind}>
          <strong>{dataSource.label}</strong>
          <span>{dataSource.detail}</span>
        </div>
        <fieldset className="backtest-provider-controls">
          <legend>
            {spanish ? "Datos históricos de Alpaca" : "Alpaca historical data"}
          </legend>
          <label>
            <span>{spanish ? "Símbolo" : "Symbol"}</span>
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
            >
              <option value="SPY">SPY · S&amp;P 500 ETF</option>
              <option value="QQQ">QQQ · Nasdaq-100 ETF</option>
              <option value="GLD">
                GLD · {spanish ? "ETF de oro" : "Gold ETF"}
              </option>
            </select>
          </label>
          <label>
            <span>{spanish ? "Fecha inicial" : "Start date"}</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            <span>{spanish ? "Fecha final" : "End date"}</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={initialEndDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
          <button
            className="button"
            type="button"
            disabled={loadingAlpaca}
            onClick={() => void loadAlpaca()}
          >
            {loadingAlpaca
              ? spanish
                ? "Cargando Alpaca…"
                : "Loading Alpaca…"
              : spanish
                ? "Cargar datos de Alpaca"
                : "Load Alpaca data"}
          </button>
        </fieldset>
        <p className="backtest-provider-note">
          {spanish
            ? "La investigación histórica utiliza la fuente diaria IEX de Alpaca, ajustada por acciones corporativas y almacenada en caché durante una hora. Es independiente de una futura visualización de cotizaciones con 15 minutos de retraso."
            : "Historical research uses Alpaca’s IEX daily feed, adjusted for corporate actions and cached for one hour. It is distinct from a future 15-minute-delayed quote display."}
        </p>
        <div className="backtest-data-actions">
          <button type="button" onClick={loadSyntheticDemo}>
            {spanish
              ? "Restablecer demostración sintética"
              : "Reset synthetic demo"}
          </button>
        </div>
        <label className="backtest-file">
          <span>{spanish ? "Elegir archivo CSV" : "Choose CSV file"}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
        </label>
        <details>
          <summary>
            {spanish ? "Inspeccionar o pegar CSV" : "Inspect or paste CSV"}
          </summary>
          <textarea
            aria-label={spanish ? "CSV OHLC histórico" : "Historical OHLC CSV"}
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value);
              setDataSource({
                kind: "csv",
                label: spanish ? "CSV editado" : "Edited CSV",
                detail: spanish
                  ? "CSV local del navegador; no se carga ni se conserva"
                  : "Local browser CSV—not uploaded or persisted",
              });
            }}
            spellCheck={false}
          />
        </details>
        {error ? (
          <p className="backtest-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="button backtest-run" type="button" onClick={run}>
          {spanish ? "Ejecutar backtest" : "Run backtest"}
        </button>
      </section>

      <section className="backtest-results" aria-labelledby="backtest-results">
        <div className="backtest-panel-heading">
          <div>
            <span>
              {spanish
                ? "Después de costes estimados"
                : "After estimated costs"}
            </span>
            <h2 id="backtest-results">
              {spanish ? "Resultados del backtest" : "Backtest results"}
            </h2>
          </div>
          <span>
            {result.metrics.tradeCount}{" "}
            {spanish ? "operaciones cerradas" : "closed trades"}
          </span>
        </div>
        <div className="backtest-metrics">
          <article>
            <span>{spanish ? "Rentabilidad total" : "Total return"}</span>
            <strong>{percent(result.metrics.totalReturnPercent)}</strong>
          </article>
          <article>
            <span>{spanish ? "Capital final" : "Ending equity"}</span>
            <strong>{currency.format(result.metrics.endingEquity)}</strong>
          </article>
          <article>
            <span>{spanish ? "Drawdown máximo" : "Max drawdown"}</span>
            <strong>{percent(result.metrics.maxDrawdownPercent)}</strong>
          </article>
          <article>
            <span>{spanish ? "Tasa de acierto" : "Win rate"}</span>
            <strong>{percent(result.metrics.winRatePercent)}</strong>
          </article>
          <article>
            <span>Sharpe (0% RF)</span>
            <strong>{result.metrics.sharpeRatio?.toFixed(2) ?? "—"}</strong>
          </article>
          <article>
            <span>{spanish ? "Factor de beneficio" : "Profit factor"}</span>
            <strong>{result.metrics.profitFactor?.toFixed(2) ?? "—"}</strong>
          </article>
        </div>
        <EquityCurve result={result} locale={locale} />
        <div className="backtest-table-wrap">
          <table>
            <caption>
              {spanish
                ? "Operaciones cerradas más recientes"
                : "Most recent closed trades"}
            </caption>
            <thead>
              <tr>
                <th>{spanish ? "Entrada" : "Entry"}</th>
                <th>{spanish ? "Salida" : "Exit"}</th>
                <th>{spanish ? "Motivo" : "Reason"}</th>
                <th>P&amp;L</th>
                <th>{spanish ? "Rentabilidad" : "Return"}</th>
              </tr>
            </thead>
            <tbody>
              {result.trades
                .slice(-8)
                .reverse()
                .map((trade) => (
                  <tr key={`${trade.entryTimestamp}-${trade.exitTimestamp}`}>
                    <td>{trade.entryTimestamp.slice(0, 10)}</td>
                    <td>{trade.exitTimestamp.slice(0, 10)}</td>
                    <td>
                      {spanish
                        ? ({
                            stop: "stop",
                            target: "objetivo",
                            signal: "señal",
                            end_of_data: "fin de los datos",
                          }[trade.exitReason] ??
                          trade.exitReason.replaceAll("_", " "))
                        : trade.exitReason.replaceAll("_", " ")}
                    </td>
                    <td className={trade.pnl >= 0 ? "positive" : "negative"}>
                      {currency.format(trade.pnl)}
                    </td>
                    <td>{percent(trade.returnPercent)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <ul className="backtest-warnings">
          {result.warnings.map((warning) => (
            <li key={warning}>
              {spanish
                ? warning
                    .replace(
                      "Results are hypothetical and do not predict future performance.",
                      "Los resultados son hipotéticos y no predicen el rendimiento futuro.",
                    )
                    .replace(
                      "The engine uses next-bar entries and exits; an intrabar stop is assumed to occur before a target when both are touched.",
                      "El motor utiliza entradas y salidas en la barra siguiente; si se alcanzan el stop y el objetivo dentro de la misma barra, se supone que el stop ocurre primero.",
                    )
                    .replace(
                      "Taxes, financing, liquidity limits, partial fills, and market impact are not modeled.",
                      "No se modelan impuestos, financiación, límites de liquidez, ejecuciones parciales ni impacto de mercado.",
                    )
                : warning}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
