export type PriceBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type TrendStrategyConfig = {
  initialCapital: number;
  fastEmaPeriod: number;
  slowEmaPeriod: number;
  atrPeriod: number;
  stopAtrMultiple: number;
  targetAtrMultiple: number;
  riskPerTradePercent: number;
  maxAllocationPercent: number;
  feeBps: number;
  slippageBps: number;
};

export type BacktestTrade = {
  entryTimestamp: string;
  exitTimestamp: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  returnPercent: number;
  exitReason: "signal" | "stop" | "target" | "end_of_data";
};

export type EquityPoint = {
  timestamp: string;
  equity: number;
  drawdownPercent: number;
};

export type BacktestMetrics = {
  totalReturnPercent: number;
  annualizedReturnPercent: number | null;
  annualizedVolatilityPercent: number | null;
  sharpeRatio: number | null;
  maxDrawdownPercent: number;
  winRatePercent: number | null;
  profitFactor: number | null;
  tradeCount: number;
  endingEquity: number;
};

export type BacktestResult = {
  metrics: BacktestMetrics;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  warnings: string[];
};
