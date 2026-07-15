import type { EconomicCountryCode } from "@/types/economic-country";

const flags: Record<EconomicCountryCode, string> = {
  AU: "🇦🇺",
  CA: "🇨🇦",
  CN: "🇨🇳",
  EU: "🇪🇺",
  GB: "🇬🇧",
  JP: "🇯🇵",
  NZ: "🇳🇿",
  US: "🇺🇸",
};

export function CountryFlag({
  code,
  name,
}: {
  code: EconomicCountryCode;
  name: string;
}) {
  return (
    <span className="economic-country">
      <span aria-hidden="true">{flags[code]}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
