export function calculateEma(values: number[], period: number) {
  const output: Array<number | null> = Array(values.length).fill(null);
  if (period < 1 || values.length < period) return output;

  const seed =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  output[period - 1] = seed;
  const multiplier = 2 / (period + 1);
  for (let index = period; index < values.length; index += 1) {
    output[index] =
      values[index] * multiplier +
      (output[index - 1] as number) * (1 - multiplier);
  }
  return output;
}

export function calculateAtr(
  bars: Array<{ high: number; low: number; close: number }>,
  period: number,
) {
  const output: Array<number | null> = Array(bars.length).fill(null);
  if (period < 1 || bars.length < period + 1) return output;

  const trueRanges = bars.map((bar, index) => {
    if (index === 0) return bar.high - bar.low;
    const previousClose = bars[index - 1].close;
    return Math.max(
      bar.high - bar.low,
      Math.abs(bar.high - previousClose),
      Math.abs(bar.low - previousClose),
    );
  });
  const seed =
    trueRanges.slice(1, period + 1).reduce((sum, value) => sum + value, 0) /
    period;
  output[period] = seed;
  for (let index = period + 1; index < bars.length; index += 1) {
    output[index] =
      ((output[index - 1] as number) * (period - 1) + trueRanges[index]) /
      period;
  }
  return output;
}
