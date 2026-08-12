import { calculateAtr, calculateEma } from "./indicators";
import type {
  BacktestMetrics,
  BacktestResult,
  BacktestTrade,
  EquityPoint,
  PriceBar,
  TrendStrategyConfig,
} from "./types";

type Position = {
  entryTimestamp: string;
  entryPrice: number;
  entryFee: number;
  quantity: number;
  stopPrice: number;
  targetPrice: number;
};

const round = (value: number, decimals = 6) => Number(value.toFixed(decimals));

export const DEFAULT_TREND_CONFIG: TrendStrategyConfig = {
  initialCapital: 10_000,
  fastEmaPeriod: 20,
  slowEmaPeriod: 50,
  atrPeriod: 14,
  stopAtrMultiple: 2,
  targetAtrMultiple: 4,
  riskPerTradePercent: 1,
  maxAllocationPercent: 100,
  feeBps: 5,
  slippageBps: 3,
};

export function validateTrendConfig(config: TrendStrategyConfig) {
  const positive: Array<keyof TrendStrategyConfig> = [
    "initialCapital",
    "fastEmaPeriod",
    "slowEmaPeriod",
    "atrPeriod",
    "stopAtrMultiple",
    "targetAtrMultiple",
    "riskPerTradePercent",
    "maxAllocationPercent",
  ];
  for (const key of positive)
    if (!Number.isFinite(config[key]) || config[key] <= 0)
      throw new Error(`${key} must be greater than zero.`);
  if (config.fastEmaPeriod >= config.slowEmaPeriod)
    throw new Error(
      "The fast EMA period must be shorter than the slow EMA period.",
    );
  if (config.riskPerTradePercent > 10)
    throw new Error("Risk per trade cannot exceed 10% in the research tool.");
  if (config.maxAllocationPercent > 100)
    throw new Error("Maximum allocation cannot exceed 100%.");
  if (config.feeBps < 0 || config.slippageBps < 0)
    throw new Error("Fees and slippage cannot be negative.");
}

function calculateMetrics(
  bars: PriceBar[],
  equityCurve: EquityPoint[],
  trades: BacktestTrade[],
): BacktestMetrics {
  const start = equityCurve[0]?.equity ?? 0;
  const endingEquity = equityCurve.at(-1)?.equity ?? start;
  const totalReturn = start > 0 ? endingEquity / start - 1 : 0;
  const elapsedDays =
    bars.length > 1
      ? (Date.parse(bars.at(-1)!.timestamp) - Date.parse(bars[0].timestamp)) /
        86_400_000
      : 0;
  const annualizedReturn =
    elapsedDays >= 30 && endingEquity > 0
      ? Math.pow(endingEquity / start, 365.25 / elapsedDays) - 1
      : null;
  const returns = equityCurve.slice(1).map((point, index) => {
    const previous = equityCurve[index].equity;
    return previous > 0 ? point.equity / previous - 1 : 0;
  });
  const mean = returns.length
    ? returns.reduce((sum, value) => sum + value, 0) / returns.length
    : 0;
  const variance =
    returns.length > 1
      ? returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        (returns.length - 1)
      : 0;
  const dailyDeviation = Math.sqrt(variance);
  const annualizedVolatility =
    returns.length > 1 ? dailyDeviation * Math.sqrt(252) : null;
  const sharpe =
    dailyDeviation > 0 ? (mean / dailyDeviation) * Math.sqrt(252) : null;
  const winners = trades.filter((trade) => trade.pnl > 0);
  const grossProfit = winners.reduce((sum, trade) => sum + trade.pnl, 0);
  const grossLoss = Math.abs(
    trades
      .filter((trade) => trade.pnl < 0)
      .reduce((sum, trade) => sum + trade.pnl, 0),
  );

  return {
    totalReturnPercent: round(totalReturn * 100, 2),
    annualizedReturnPercent:
      annualizedReturn === null ? null : round(annualizedReturn * 100, 2),
    annualizedVolatilityPercent:
      annualizedVolatility === null
        ? null
        : round(annualizedVolatility * 100, 2),
    sharpeRatio: sharpe === null ? null : round(sharpe, 2),
    maxDrawdownPercent: round(
      Math.max(0, ...equityCurve.map((point) => point.drawdownPercent)),
      2,
    ),
    winRatePercent: trades.length
      ? round((winners.length / trades.length) * 100, 2)
      : null,
    profitFactor:
      grossLoss > 0
        ? round(grossProfit / grossLoss, 2)
        : grossProfit > 0
          ? null
          : 0,
    tradeCount: trades.length,
    endingEquity: round(endingEquity, 2),
  };
}

export function runTrendBacktest(
  bars: PriceBar[],
  config: TrendStrategyConfig = DEFAULT_TREND_CONFIG,
): BacktestResult {
  validateTrendConfig(config);
  if (bars.length < config.slowEmaPeriod + 2)
    throw new Error(
      `At least ${config.slowEmaPeriod + 2} price rows are required.`,
    );

  const closes = bars.map((bar) => bar.close);
  const fastEma = calculateEma(closes, config.fastEmaPeriod);
  const slowEma = calculateEma(closes, config.slowEmaPeriod);
  const atr = calculateAtr(bars, config.atrPeriod);
  const costRate = (config.feeBps + config.slippageBps) / 10_000;
  const feeRate = config.feeBps / 10_000;
  let cash = config.initialCapital;
  let position: Position | null = null;
  let pendingAction: "enter" | "exit" | null = null;
  let peakEquity = config.initialCapital;
  const trades: BacktestTrade[] = [];
  const equityCurve: EquityPoint[] = [];

  const closePosition = (
    bar: PriceBar,
    rawExitPrice: number,
    reason: BacktestTrade["exitReason"],
  ) => {
    if (!position) return;
    const exitPrice = rawExitPrice * (1 - config.slippageBps / 10_000);
    const proceeds = exitPrice * position.quantity;
    const exitFee = proceeds * feeRate;
    cash += proceeds - exitFee;
    const pnl =
      (exitPrice - position.entryPrice) * position.quantity -
      position.entryFee -
      exitFee;
    trades.push({
      entryTimestamp: position.entryTimestamp,
      exitTimestamp: bar.timestamp,
      entryPrice: round(position.entryPrice),
      exitPrice: round(exitPrice),
      quantity: round(position.quantity),
      pnl: round(pnl, 2),
      returnPercent: round(
        (pnl / (position.entryPrice * position.quantity + position.entryFee)) *
          100,
        2,
      ),
      exitReason: reason,
    });
    position = null;
  };

  bars.forEach((bar, index) => {
    if (pendingAction === "exit" && position)
      closePosition(bar, bar.open, "signal");
    if (pendingAction === "enter" && !position && atr[index - 1]) {
      const entryPrice = bar.open * (1 + config.slippageBps / 10_000);
      const stopDistance = (atr[index - 1] as number) * config.stopAtrMultiple;
      const equity = cash;
      const riskBudget = equity * (config.riskPerTradePercent / 100);
      const riskQuantity =
        riskBudget / (stopDistance + entryPrice * costRate * 2);
      const allocationQuantity =
        (equity * (config.maxAllocationPercent / 100)) /
        (entryPrice * (1 + feeRate));
      const quantity = Math.max(0, Math.min(riskQuantity, allocationQuantity));
      const entryFee = entryPrice * quantity * feeRate;
      const requiredCash = entryPrice * quantity + entryFee;
      if (quantity > 0 && requiredCash <= cash) {
        cash -= requiredCash;
        position = {
          entryTimestamp: bar.timestamp,
          entryPrice,
          entryFee,
          quantity,
          stopPrice: entryPrice - stopDistance,
          targetPrice:
            entryPrice + (atr[index - 1] as number) * config.targetAtrMultiple,
        };
      }
    }
    pendingAction = null;

    if (position) {
      const hitStop = bar.low <= position.stopPrice;
      const hitTarget = bar.high >= position.targetPrice;
      if (hitStop) closePosition(bar, position.stopPrice, "stop");
      else if (hitTarget) closePosition(bar, position.targetPrice, "target");
    }

    const equity = cash + (position ? position.quantity * bar.close : 0);
    peakEquity = Math.max(peakEquity, equity);
    equityCurve.push({
      timestamp: bar.timestamp,
      equity: round(equity, 2),
      drawdownPercent: round(((peakEquity - equity) / peakEquity) * 100, 4),
    });

    if (
      index < bars.length - 1 &&
      fastEma[index] !== null &&
      slowEma[index] !== null
    ) {
      const bullish = (fastEma[index] as number) > (slowEma[index] as number);
      if (bullish && !position) pendingAction = "enter";
      if (!bullish && position) pendingAction = "exit";
    }
  });

  if (position) {
    const finalBar = bars.at(-1)!;
    closePosition(finalBar, finalBar.close, "end_of_data");
    const finalEquity = cash;
    peakEquity = Math.max(peakEquity, finalEquity);
    equityCurve[equityCurve.length - 1] = {
      timestamp: finalBar.timestamp,
      equity: round(finalEquity, 2),
      drawdownPercent: round(
        ((peakEquity - finalEquity) / peakEquity) * 100,
        4,
      ),
    };
  }

  return {
    metrics: calculateMetrics(bars, equityCurve, trades),
    trades,
    equityCurve,
    warnings: [
      "Results are hypothetical and do not predict future performance.",
      "The engine uses next-bar entries and exits; an intrabar stop is assumed to occur before a target when both are touched.",
      "Taxes, financing, liquidity limits, partial fills, and market impact are not modeled.",
    ],
  };
}
