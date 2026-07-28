import "server-only";

export type AcademyJobItemResult = "succeeded" | "skipped";

export type AcademyJobSummary = {
  failed: number;
  processed: number;
  skipped: number;
  succeeded: number;
};

export async function runAcademyBatchJob<T>(input: {
  items: readonly T[];
  maximumBatchSize?: number;
  process: (item: T) => Promise<AcademyJobItemResult>;
}): Promise<AcademyJobSummary> {
  const maximumBatchSize = Math.min(
    100,
    Math.max(1, Math.floor(input.maximumBatchSize ?? 25)),
  );
  const summary: AcademyJobSummary = {
    failed: 0,
    processed: 0,
    skipped: 0,
    succeeded: 0,
  };

  for (const item of input.items.slice(0, maximumBatchSize)) {
    summary.processed += 1;
    try {
      const result = await input.process(item);
      summary[result] += 1;
    } catch {
      summary.failed += 1;
    }
  }

  return summary;
}
