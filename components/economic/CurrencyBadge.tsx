import type { EconomicCurrency } from "@/types/economic-currency";

export function CurrencyBadge({ currency }: { currency: EconomicCurrency }) {
  return <span className="economic-currency">{currency}</span>;
}
