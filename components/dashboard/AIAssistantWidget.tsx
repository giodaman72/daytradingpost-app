import Link from "next/link";
import type { AssistantUsageSummary } from "@/types/ai-usage";
import { DashboardPanel } from "./DashboardPanel";
import { localizeHref, type Locale } from "@/lib/i18n/config";

const questions = [
  ["Summarize today’s market brief", "market_analysis"],
  ["Explain the main risks across my watchlist", "watchlist_summary"],
  ["What are today’s major economic events?", "economic_event"],
] as const;

export function AIAssistantWidget({
  usage,
  premium,
  locale = "en",
}: {
  usage: AssistantUsageSummary | null;
  premium: boolean;
  locale?: Locale;
}) {
  const spanish = locale === "es";
  const localizedQuestions = spanish
    ? ([
        ["Resume el informe de mercados de hoy", "market_analysis"],
        ["Explica los principales riesgos de mi lista", "watchlist_summary"],
        [
          "¿Cuáles son los principales eventos económicos de hoy?",
          "economic_event",
        ],
      ] as const)
    : questions;
  return (
    <DashboardPanel
      id="ai-assistant"
      eyebrow={
        spanish ? "Bajo demanda y con fuentes" : "On-demand, source-grounded"
      }
      title={spanish ? "Asistente de trading con IA" : "AI Trading Assistant"}
      className="dashboard-panel-wide"
      action={
        <Link
          href={localizeHref("/assistant", locale)}
          className="dashboard-panel-link"
        >
          {spanish ? "Abrir asistente" : "Open assistant"} →
        </Link>
      }
    >
      <div className="dashboard-ai-widget">
        <div>
          <p>
            {spanish
              ? "Consulta análisis publicados, inteligencia estructurada de mercados, eventos económicos y material de la Academia."
              : "Ask against published analysis, structured market intelligence, economic events, and Academy material."}
          </p>
          <strong>
            {usage
              ? spanish
                ? `${usage.remaining} de ${usage.dailyLimit} preguntas disponibles hoy`
                : `${usage.remaining} of ${usage.dailyLimit} questions remaining today`
              : spanish
                ? "El uso estará disponible después de la migración de la base de datos de IA"
                : "Usage becomes available after the AI database migration"}
          </strong>
        </div>
        <div>
          {localizedQuestions.map(([prompt, mode]) => (
            <Link
              href={localizeHref(
                `/assistant?mode=${mode}&prompt=${encodeURIComponent(prompt)}`,
                locale,
              )}
              key={prompt}
            >
              {prompt}
            </Link>
          ))}
        </div>
        {!premium ? (
          <Link href={localizeHref("/premium", locale)}>
            {spanish
              ? "Mejora tu plan para usar el contexto de listas y límites más altos"
              : "Upgrade for watchlist context and higher limits"}{" "}
            →
          </Link>
        ) : null}
      </div>
    </DashboardPanel>
  );
}
