import type { EconomicStatistics } from "@/types/economic-statistics";

const labels: [keyof EconomicStatistics, string][] = [
  ["todayHighImpact", "Today high impact"],
  ["todayMediumImpact", "Today medium impact"],
  ["tomorrow", "Tomorrow"],
  ["thisWeek", "This week"],
  ["countriesCovered", "Countries"],
  ["currenciesCovered", "Currencies"],
];

export function StatisticsCards({
  statistics,
}: {
  statistics: EconomicStatistics;
}) {
  return (
    <dl className="economic-statistics">
      {labels.map(([key, label]) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd>{statistics[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
