import type { MarketLevel } from "@/types/market-intelligence";

export function MarketLevels({
  label,
  levels,
}: {
  label: string;
  levels: MarketLevel[];
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
        <p>Not provided</p>
      )}
    </div>
  );
}
