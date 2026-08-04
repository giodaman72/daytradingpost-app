import type { MarketStatus } from "@/types/market-data";

const labels: Record<MarketStatus, string> = {
  open: "Market open",
  closed: "Market closed",
  premarket: "Premarket",
  afterhours: "After hours",
  unavailable: "Status unavailable",
  unknown: "Status unknown",
};

const spanishLabels: Record<MarketStatus, string> = {
  open: "Mercado abierto",
  closed: "Mercado cerrado",
  premarket: "Premercado",
  afterhours: "Fuera de horario",
  unavailable: "Estado no disponible",
  unknown: "Estado desconocido",
};

export function MarketStatusBadge({
  status,
  locale = "en",
}: {
  status: MarketStatus;
  locale?: "en" | "es";
}) {
  return (
    <span className={`md-status md-status-${status}`}>
      {(locale === "es" ? spanishLabels : labels)[status]}
    </span>
  );
}
