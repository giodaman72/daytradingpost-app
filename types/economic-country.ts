export type EconomicCountryCode =
  "AU" | "CA" | "CN" | "EU" | "GB" | "JP" | "NZ" | "US";

export type EconomicCountry = {
  code: EconomicCountryCode;
  name: string;
};
