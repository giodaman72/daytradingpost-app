import type { MarketLevel } from "@/types/market-intelligence";
import type { Locale } from "@/lib/i18n/config";

export function MarketLevels({
  label,
  levels,
  locale = "en",
}: {
  label: string;
  levels: MarketLevel[];
  locale?: Locale;
}) {
  return (
    <div className="mi-levels">
      <span>{label}</span>
      {levels.length ? (
        <ul>
          {levels.map((level, index) => (
            <li key={`${level.value}-${index}`}>
              {level.label ? `${level.label}: ` : ""}
              {level.value}
            </li>
          ))}
        </ul>
      ) : (
        <p>{locale === "es" ? "No indicado" : "Not provided"}</p>
      )}
    </div>
  );
}
