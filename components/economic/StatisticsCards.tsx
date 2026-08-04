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
  locale = "en",
}: {
  statistics: EconomicStatistics;
  locale?: "en" | "es";
}) {
  const spanishLabels: Record<keyof EconomicStatistics, string> = {
    todayHighImpact: "Alto impacto hoy",
    todayMediumImpact: "Impacto medio hoy",
    tomorrow: "Mañana",
    thisWeek: "Esta semana",
    countriesCovered: "Países",
    currenciesCovered: "Divisas",
  };
  return (
    <dl className="economic-statistics">
      {labels.map(([key, label]) => (
        <div key={key}>
          <dt>{locale === "es" ? spanishLabels[key] : label}</dt>
          <dd>{statistics[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
