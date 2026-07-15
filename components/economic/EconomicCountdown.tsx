import { economicCountdown } from "@/lib/economic/economicFilters";

export function EconomicCountdown({
  scheduledTime,
  now,
}: {
  scheduledTime: string;
  now?: Date;
}) {
  return (
    <span
      className="economic-countdown"
      aria-label={`Scheduled ${economicCountdown(scheduledTime, now)}`}
    >
      {economicCountdown(scheduledTime, now)}
    </span>
  );
}
