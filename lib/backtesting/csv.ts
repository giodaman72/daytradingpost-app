import type { PriceBar } from "./types";

const REQUIRED_COLUMNS = ["date", "open", "high", "low", "close"] as const;

export function parsePriceBarsCsv(csv: string): PriceBar[] {
  const lines = csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2)
    throw new Error("CSV must include a header and at least one price row.");

  const headers = lines[0]
    .split(",")
    .map((value) => value.trim().toLowerCase());
  for (const required of REQUIRED_COLUMNS)
    if (!headers.includes(required))
      throw new Error(`CSV is missing the required “${required}” column.`);

  const column = (name: string) => headers.indexOf(name);
  const bars = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(",").map((value) => value.trim());
    const timestamp = values[column("date")];
    const open = Number(values[column("open")]);
    const high = Number(values[column("high")]);
    const low = Number(values[column("low")]);
    const close = Number(values[column("close")]);
    const volumeIndex = column("volume");
    const volume =
      volumeIndex >= 0 && values[volumeIndex]
        ? Number(values[volumeIndex])
        : undefined;
    const row = rowIndex + 2;

    if (!timestamp || Number.isNaN(Date.parse(timestamp)))
      throw new Error(`Row ${row} has an invalid date.`);
    if (![open, high, low, close].every(Number.isFinite))
      throw new Error(`Row ${row} has a non-numeric OHLC value.`);
    if (open <= 0 || high <= 0 || low <= 0 || close <= 0)
      throw new Error(`Row ${row} contains a non-positive price.`);
    if (
      high < Math.max(open, close) ||
      low > Math.min(open, close) ||
      high < low
    )
      throw new Error(`Row ${row} has inconsistent OHLC values.`);
    if (volume !== undefined && (!Number.isFinite(volume) || volume < 0))
      throw new Error(`Row ${row} has an invalid volume.`);

    return {
      timestamp: new Date(timestamp).toISOString(),
      open,
      high,
      low,
      close,
      volume,
    };
  });

  bars.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  if (new Set(bars.map((bar) => bar.timestamp)).size !== bars.length)
    throw new Error("CSV contains duplicate dates.");
  return bars;
}

export function createSyntheticDailyCsv(length = 420) {
  const rows = ["date,open,high,low,close,volume"];
  let previousClose = 100;
  const start = Date.UTC(2024, 0, 2);
  for (let index = 0; index < length; index += 1) {
    const date = new Date(start + index * 86_400_000);
    const trend =
      index < 120
        ? 0.001
        : index < 210
          ? -0.0014
          : index < 340
            ? 0.0012
            : -0.0004;
    const cycle =
      Math.sin(index * 0.31) * 0.007 + Math.cos(index * 0.07) * 0.003;
    const open = previousClose * (1 + Math.sin(index * 0.17) * 0.0015);
    const close = open * (1 + trend + cycle);
    const spread = Math.abs(Math.sin(index * 0.23)) * 0.008 + 0.003;
    const high = Math.max(open, close) * (1 + spread);
    const low = Math.min(open, close) * (1 - spread * 0.9);
    rows.push(
      `${date.toISOString().slice(0, 10)},${open.toFixed(4)},${high.toFixed(4)},${low.toFixed(4)},${close.toFixed(4)},${Math.round(100000 + index * 73)}`,
    );
    previousClose = close;
  }
  return rows.join("\n");
}

export function priceBarsToCsv(bars: PriceBar[]) {
  return [
    "date,open,high,low,close,volume",
    ...bars.map((bar) =>
      [
        bar.timestamp.slice(0, 10),
        bar.open,
        bar.high,
        bar.low,
        bar.close,
        bar.volume ?? "",
      ].join(","),
    ),
  ].join("\n");
}
