import { describe, expect, it } from "vitest";
import { getInstrument } from "@/constants/instruments";
import type { ChartCandle } from "@/types/chart";
import { normalizeCandles } from "./chartCandles";
import { CHART_PLAN_LIMITS } from "./chartAuthorization";
import { validateIndicator } from "./chartIndicators";
import {
  calculateBollinger,
  calculateEma,
  calculateRsi,
  calculateSma,
} from "./indicatorCalculations";
import { resolveChartSymbol } from "./chartSymbols";
import { isChartTimeframe, toTradingViewInterval } from "./chartTimeframes";
import { parseBarsQuery } from "./chartValidation";
import { parseLayoutInput } from "./chartValidation";
import { DevelopmentChartDatafeed } from "./datafeeds/developmentChartDatafeed";
import { normalizeChartAssistantContext } from "./chartAssistantContext";
import { normalizeEditorialAnnotations } from "./overlays/editorialOverlayService";
import { normalizeEconomicAnnotations } from "./overlays/economicOverlayService";
import { normalizeOwnedAlertAnnotations } from "./overlays/alertOverlayService";
import type { MarketIntelligenceRecord } from "@/types/market-intelligence";
import type { EconomicEvent } from "@/types/economic-event";
import type { Alert } from "@/types/alert";

const candle = (timestamp: number, close = 10): ChartCandle => ({
  timestamp,
  open: 9,
  high: 11,
  low: 8,
  close,
  volume: 100,
  source: "test",
  delayed: true,
  fixture: false,
  receivedAt: "2026-01-01T00:00:00Z",
});
describe("advanced chart core", () => {
  it("maps canonical instruments to TradingView symbols", () =>
    expect(getInstrument("gold")?.tradingViewSymbol).toBe("OANDA:XAUUSD"));
  it.each([
    ["nasdaq-100", "CAPITALCOM:US100"],
    ["sp-500", "CAPITALCOM:US500"],
    ["dow-jones", "CAPITALCOM:US30"],
    ["natural-gas", "CAPITALCOM:NATURALGAS"],
    ["copper", "CAPITALCOM:COPPER"],
  ])("uses a public-widget symbol for %s", (instrument, expectedSymbol) =>
    expect(getInstrument(instrument)?.tradingViewSymbol).toBe(expectedSymbol),
  );
  it("rejects unsupported instruments", () =>
    expect(resolveChartSymbol("made-up")).toBeNull());
  it("maps timeframes", () => {
    expect(isChartTimeframe("4h")).toBe(true);
    expect(toTradingViewInterval("4h")).toBe("240");
  });
  it("rejects unsupported timeframes", () =>
    expect(() =>
      parseBarsQuery(
        "https://example.com?instrument=gold&timeframe=2h",
        500,
        365,
      ),
    ).toThrow());
  it("sorts and removes duplicate candles", () =>
    expect(
      normalizeCandles([candle(2), candle(1), candle(2, 12)]).map(
        (item) => item.timestamp,
      ),
    ).toEqual([1, 2]));
  it("removes invalid OHLC candles", () =>
    expect(normalizeCandles([{ ...candle(1), high: 1 }])).toEqual([]));
  it("validates free and premium indicators", () => {
    expect(
      validateIndicator({ id: "sma", parameters: { period: 20 } }, false),
    ).not.toBeNull();
    expect(
      validateIndicator({ id: "bollinger", parameters: {} }, false),
    ).toBeNull();
  });
  it("rejects invalid indicator parameters", () =>
    expect(
      validateIndicator({ id: "sma", parameters: { period: -1 } }, true),
    ).toBeNull());
  it("calculates SMA deterministically", () =>
    expect(calculateSma([1, 2, 3], 2)).toEqual([null, 1.5, 2.5]));
  it("calculates EMA deterministically", () =>
    expect(calculateEma([1, 2, 3], 2)).toEqual([
      1, 1.6666666666666665, 2.5555555555555554,
    ]));
  it("calculates Bollinger bands", () =>
    expect(calculateBollinger([1, 2, 3], 3)[2]?.middle).toBe(2));
  it("calculates RSI", () =>
    expect(calculateRsi([1, 2, 3, 4], 3)[3]).toBe(100));
  it("centralizes membership limits", () =>
    expect(CHART_PLAN_LIMITS.premium.layouts).toBeGreaterThan(
      CHART_PLAN_LIMITS.free.layouts,
    ));
  it("labels development data as delayed fixtures", async () => {
    const result = await new DevelopmentChartDatafeed().getBars({
      instrument: "gold",
      timeframe: "1h",
      from: 0,
      to: 360_000,
      limit: 20,
    });
    expect(result.meta).toMatchObject({
      delayed: true,
      fixture: true,
      source: "development",
    });
  });
  it("bounds historical API ranges and bar counts", () => {
    const result = parseBarsQuery(
      "https://example.com?instrument=gold&timeframe=1h&from=1&to=9999999999&limit=9999",
      500,
      30,
    );
    expect(result.limit).toBe(500);
    expect(result.to - result.from).toBeLessThanOrEqual(30 * 86_400);
  });
  it("normalizes editorial levels only for authorized premium context", () => {
    const intelligence = {
      id: "analysis-1",
      supportLevels: [{ value: "2,300" }],
      resistanceLevels: [{ value: "2400" }],
      publishedAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    } as MarketIntelligenceRecord;
    expect(normalizeEditorialAnnotations(intelligence, false)).toEqual([]);
    expect(normalizeEditorialAnnotations(intelligence, true)).toHaveLength(2);
  });
  it("omits cancelled economic events", () => {
    const events = [
      {
        id: "cpi",
        title: "CPI",
        status: "cancelled",
        scheduledTime: "2026-01-01T00:00:00Z",
      },
    ] as EconomicEvent[];
    expect(normalizeEconomicAnnotations(events)).toEqual([]);
  });
  it("keeps alert overlays owner scoped", () => {
    const alerts = [
      {
        id: "alert-1",
        userId: "owner",
        instrumentSlug: "gold",
        thresholdValue: "2300",
        name: "Gold level",
        status: "active",
        lastTriggeredAt: null,
      },
    ] as Alert[];
    expect(normalizeOwnedAlertAnnotations(alerts, "other", "gold")).toEqual([]);
    expect(
      normalizeOwnedAlertAnnotations(alerts, "owner", "gold"),
    ).toHaveLength(1);
  });
  it("validates provider-neutral layout payloads", () => {
    expect(
      parseLayoutInput(
        {
          name: "<b>Gold layout</b>",
          instrumentSlug: "gold",
          provider: "first_party",
          timeframe: "1h",
          indicators: [{ id: "sma", parameters: { period: 20 } }],
          settings: {},
        },
        false,
        3,
      ).name,
    ).toBe("Gold layout");
  });
  it("rejects unsupported layout symbols", () =>
    expect(() =>
      parseLayoutInput(
        {
          name: "Invalid",
          instrumentSlug: "fake",
          provider: "first_party",
          timeframe: "1h",
        },
        true,
        8,
      ),
    ).toThrow());
  it("normalizes only structured AI chart context", () => {
    expect(
      normalizeChartAssistantContext({
        instrumentSlug: "gold",
        timeframe: "1h",
        indicators: [{ id: "sma", parameters: { period: 20 } }],
        annotations: [],
        dataTimestamp: null,
        delayed: true,
      }),
    ).toMatchObject({ instrument: "gold", timeframe: "1h", delayed: true });
  });
  it("sanitizes annotation labels sent to AI", () => {
    const normalized = normalizeChartAssistantContext({
      instrumentSlug: "gold",
      timeframe: "1h",
      indicators: [],
      annotations: [
        {
          id: "a",
          kind: "support",
          label: "<<script>bad</script>Support",
          value: 2300,
          timestamp: null,
          sourceId: "source",
          sourceType: "article",
          premium: false,
        },
      ],
      dataTimestamp: null,
      delayed: true,
    });
    expect(normalized?.annotations[0].label).toBe("badSupport");
  });
});
