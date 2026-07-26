import type { ChartCandle } from "@/types/chart";

export function ChartCanvas({
  bars,
  name,
}: {
  bars: ChartCandle[];
  name: string;
}) {
  if (!bars.length)
    return (
      <div className="chart-unavailable" role="status">
        Historical OHLC is not configured for the first-party chart. No candles
        have been fabricated.
      </div>
    );
  const width = 1_000;
  const height = 430;
  const minimum = Math.min(...bars.map((bar) => bar.low));
  const maximum = Math.max(...bars.map((bar) => bar.high));
  const scale = (value: number) =>
    height -
    25 -
    ((value - minimum) / Math.max(maximum - minimum, 0.000001)) * (height - 50);
  const candleWidth = Math.max(2, Math.min(12, width / bars.length - 2));
  return (
    <svg
      className="chart-canvas"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${name} candlestick chart`}
    >
      <title>{name} normalized candlestick chart</title>
      {bars.map((bar, index) => {
        const x = 15 + (index * (width - 30)) / Math.max(1, bars.length - 1);
        const rising = bar.close >= bar.open;
        return (
          <g
            key={bar.timestamp}
            className={rising ? "candle-up" : "candle-down"}
          >
            <line x1={x} x2={x} y1={scale(bar.high)} y2={scale(bar.low)} />
            <rect
              x={x - candleWidth / 2}
              y={Math.min(scale(bar.open), scale(bar.close))}
              width={candleWidth}
              height={Math.max(2, Math.abs(scale(bar.open) - scale(bar.close)))}
            />
          </g>
        );
      })}
    </svg>
  );
}
