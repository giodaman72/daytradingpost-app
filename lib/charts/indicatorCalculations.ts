const nullable = (
  values: number[],
  period: number,
  calculation: (slice: number[]) => number,
) =>
  values.map((_, index) =>
    index + 1 < period
      ? null
      : calculation(values.slice(index + 1 - period, index + 1)),
  );
export function calculateSma(values: number[], period: number) {
  return nullable(
    values,
    period,
    (slice) => slice.reduce((sum, value) => sum + value, 0) / period,
  );
}
export function calculateEma(values: number[], period: number) {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  return values.reduce<number[]>((result, value, index) => {
    result.push(
      index === 0
        ? value
        : value * multiplier + result[index - 1] * (1 - multiplier),
    );
    return result;
  }, []);
}
export function calculateBollinger(
  values: number[],
  period: number,
  deviation = 2,
) {
  return values.map((_, index) => {
    if (index + 1 < period) return null;
    const slice = values.slice(index + 1 - period, index + 1);
    const middle = slice.reduce((sum, value) => sum + value, 0) / period;
    const standardDeviation = Math.sqrt(
      slice.reduce((sum, value) => sum + (value - middle) ** 2, 0) / period,
    );
    return {
      middle,
      upper: middle + standardDeviation * deviation,
      lower: middle - standardDeviation * deviation,
    };
  });
}
export function calculateRsi(values: number[], period: number) {
  return values.map((_, index) => {
    if (index < period) return null;
    const changes = values
      .slice(index - period, index + 1)
      .slice(1)
      .map((value, offset) => value - values[index - period + offset]);
    const gains =
      changes.reduce((sum, value) => sum + Math.max(0, value), 0) / period;
    const losses =
      changes.reduce((sum, value) => sum + Math.max(0, -value), 0) / period;
    return losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
  });
}
