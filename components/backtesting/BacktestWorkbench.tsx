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

type NumericConfigKey = keyof TrendStrategyConfig;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(2)}%`;

function EquityCurve({ result }: { result: BacktestResult }) {
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
      aria-label="Strategy equity curve"
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
}: {
  initialEndDate: string;
}) {
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
    label: "Synthetic demo",
    detail: "Deterministic demonstration series—not market history",
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
      setError(caught instanceof Error ? caught.message : "Backtest failed.");
    }
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setError(
        "CSV files are limited to 2 MB in this browser-based research tool.",
      );
      return;
    }
    setCsv(await file.text());
    setDataSource({
      kind: "csv",
      label: file.name,
      detail: "Local browser CSV—not uploaded or persisted",
    });
    setError(null);
  };

  const loadSyntheticDemo = () => {
    const syntheticCsv = createSyntheticDailyCsv();
    setCsv(syntheticCsv);
    setResult(runTrendBacktest(parsePriceBarsCsv(syntheticCsv), config));
    setDataSource({
      kind: "synthetic",
      label: "Synthetic demo",
      detail: "Deterministic demonstration series—not market history",
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
        throw new Error(payload.message || "Alpaca data could not be loaded.");
      if (!payload.bars?.length || !payload.meta)
        throw new Error("Alpaca returned no usable historical bars.");

      const historicalCsv = priceBarsToCsv(payload.bars);
      const validatedBars = parsePriceBarsCsv(historicalCsv);
      setCsv(historicalCsv);
      setResult(runTrendBacktest(validatedBars, config));
      setDataSource({
        kind: "alpaca",
        label: `${payload.meta.symbol} · ${payload.meta.provider}`,
        detail: `${payload.meta.timeframe} adjusted bars · ${payload.meta.feed.toUpperCase()} feed · ${payload.meta.start} to ${payload.meta.end}`,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
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
      label: "Initial capital ($)",
      min: 100,
      step: 100,
    },
    { key: "fastEmaPeriod", label: "Fast EMA", min: 2, max: 200 },
    { key: "slowEmaPeriod", label: "Slow EMA", min: 3, max: 400 },
    { key: "atrPeriod", label: "ATR period", min: 2, max: 100 },
    {
      key: "stopAtrMultiple",
      label: "Stop (ATR ×)",
      min: 0.25,
      max: 10,
      step: 0.25,
    },
    {
      key: "targetAtrMultiple",
      label: "Target (ATR ×)",
      min: 0.25,
      max: 20,
      step: 0.25,
    },
    {
      key: "riskPerTradePercent",
      label: "Risk per trade (%)",
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      key: "maxAllocationPercent",
      label: "Max allocation (%)",
      min: 1,
      max: 100,
    },
    { key: "feeBps", label: "Fee (bps/side)", min: 0, max: 100, step: 0.5 },
    {
      key: "slippageBps",
      label: "Slippage (bps/side)",
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
            <span>Strategy 01</span>
            <h2 id="strategy-settings">EMA–ATR trend model</h2>
          </div>
          <span className="backtest-badge">Research only</span>
        </div>
        <p>
          Enter long when the fast EMA is above the slow EMA. Execute on the
          next bar’s open, size from stop risk, and exit at the ATR stop, ATR
          target, or next-bar bearish signal.
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
            <span>Daily OHLC input</span>
            <h2 id="historical-data">Historical data</h2>
          </div>
          <span>
            {dataSource.label} · {rowCount} rows
          </span>
        </div>
        <p>
          Load adjusted daily Alpaca bars for the bounded research universe, or
          use a local CSV. Credentials remain server-side; CSV files stay in
          this browser and are not uploaded.
        </p>
        <div className="backtest-source-status" data-source={dataSource.kind}>
          <strong>{dataSource.label}</strong>
          <span>{dataSource.detail}</span>
        </div>
        <fieldset className="backtest-provider-controls">
          <legend>Alpaca historical data</legend>
          <label>
            <span>Symbol</span>
            <select
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
            >
              <option value="SPY">SPY · S&amp;P 500 ETF</option>
              <option value="QQQ">QQQ · Nasdaq-100 ETF</option>
              <option value="GLD">GLD · Gold ETF</option>
            </select>
          </label>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label>
            <span>End date</span>
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
            {loadingAlpaca ? "Loading Alpaca…" : "Load Alpaca data"}
          </button>
        </fieldset>
        <p className="backtest-provider-note">
          Historical research uses Alpaca’s IEX daily feed, adjusted for
          corporate actions and cached for one hour. It is distinct from a
          future 15-minute-delayed quote display.
        </p>
        <div className="backtest-data-actions">
          <button type="button" onClick={loadSyntheticDemo}>
            Reset synthetic demo
          </button>
        </div>
        <label className="backtest-file">
          <span>Choose CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void loadFile(event.target.files?.[0])}
          />
        </label>
        <details>
          <summary>Inspect or paste CSV</summary>
          <textarea
            aria-label="Historical OHLC CSV"
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value);
              setDataSource({
                kind: "csv",
                label: "Edited CSV",
                detail: "Local browser CSV—not uploaded or persisted",
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
          Run backtest
        </button>
      </section>

      <section className="backtest-results" aria-labelledby="backtest-results">
        <div className="backtest-panel-heading">
          <div>
            <span>After estimated costs</span>
            <h2 id="backtest-results">Backtest results</h2>
          </div>
          <span>{result.metrics.tradeCount} closed trades</span>
        </div>
        <div className="backtest-metrics">
          <article>
            <span>Total return</span>
            <strong>{percent(result.metrics.totalReturnPercent)}</strong>
          </article>
          <article>
            <span>Ending equity</span>
            <strong>{currency.format(result.metrics.endingEquity)}</strong>
          </article>
          <article>
            <span>Max drawdown</span>
            <strong>{percent(result.metrics.maxDrawdownPercent)}</strong>
          </article>
          <article>
            <span>Win rate</span>
            <strong>{percent(result.metrics.winRatePercent)}</strong>
          </article>
          <article>
            <span>Sharpe (0% RF)</span>
            <strong>{result.metrics.sharpeRatio?.toFixed(2) ?? "—"}</strong>
          </article>
          <article>
            <span>Profit factor</span>
            <strong>{result.metrics.profitFactor?.toFixed(2) ?? "—"}</strong>
          </article>
        </div>
        <EquityCurve result={result} />
        <div className="backtest-table-wrap">
          <table>
            <caption>Most recent closed trades</caption>
            <thead>
              <tr>
                <th>Entry</th>
                <th>Exit</th>
                <th>Reason</th>
                <th>P&amp;L</th>
                <th>Return</th>
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
                    <td>{trade.exitReason.replaceAll("_", " ")}</td>
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
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
