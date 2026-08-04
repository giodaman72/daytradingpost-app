import { economicCountdown } from "@/lib/economic/economicFilters";

export function EconomicCountdown({
  scheduledTime,
  now,
  locale = "en",
}: {
  scheduledTime: string;
  now?: Date;
  locale?: "en" | "es";
}) {
  const countdown = economicCountdown(scheduledTime, now);
  return (
    <span
      className="economic-countdown"
      aria-label={`${locale === "es" ? "Programado" : "Scheduled"} ${countdown}`}
    >
      {countdown}
    </span>
  );
}
