export class ChartError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export function normalizeChartError(error: unknown) {
  return error instanceof ChartError
    ? error
    : new ChartError("INTERNAL_ERROR", "Chart service unavailable.", 500);
}
