import { getInstrument } from "@/constants/instruments";
import {
  ASSET_CLASSES,
  MARKET_BIASES,
  MOMENTUM_STATES,
  VOLATILITY_STATES,
  type AssetClass,
  type MarketBias,
  type MarketLevel,
  type MomentumState,
  type VolatilityState,
} from "@/types/market-intelligence";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SYMBOL = /^[A-Z0-9]{2,12}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type IntelligenceInput = {
  instrumentSlug: string;
  symbol: string;
  instrumentName: string;
  assetClass: AssetClass;
  bias: MarketBias;
  shortSummary: string;
  technicalOverview: string;
  supportLevels: MarketLevel[];
  resistanceLevels: MarketLevel[];
  momentum: MomentumState;
  volatility: VolatilityState;
  bullishScenario: string;
  bearishScenario: string;
  riskFactors: string[];
  relatedArticleSlug: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  validForDate: string;
};

export function normalizeLevels(value: string | string[]) {
  const values = Array.isArray(value) ? value : value.split(/[,\n]/);
  return values
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((value) => ({ value }));
}

export function validateMarketIntelligence(input: IntelligenceInput) {
  const errors: Record<string, string> = {};
  const instrument = getInstrument(input.instrumentSlug);
  if (!instrument || !SLUG.test(input.instrumentSlug))
    errors.instrumentSlug = "Select a supported instrument.";
  if (!SYMBOL.test(input.symbol))
    errors.symbol = "Use a valid uppercase symbol.";
  if (!MARKET_BIASES.includes(input.bias))
    errors.bias = "Select an accepted bias.";
  if (!ASSET_CLASSES.includes(input.assetClass))
    errors.assetClass = "Select an accepted asset class.";
  if (!MOMENTUM_STATES.includes(input.momentum))
    errors.momentum = "Select an accepted momentum state.";
  if (!VOLATILITY_STATES.includes(input.volatility))
    errors.volatility = "Select an accepted volatility state.";
  if (
    !ISO_DATE.test(input.validForDate) ||
    Number.isNaN(Date.parse(`${input.validForDate}T00:00:00Z`))
  )
    errors.validForDate = "Enter a valid ISO date.";
  if (input.shortSummary.length < 20 || input.shortSummary.length > 320)
    errors.shortSummary = "Summary must be 20–320 characters.";
  if (input.technicalOverview.length < 20)
    errors.technicalOverview = "Add a technical overview.";
  if (input.bullishScenario.length < 20)
    errors.bullishScenario = "Add a bullish scenario.";
  if (input.bearishScenario.length < 20)
    errors.bearishScenario = "Add a bearish scenario.";
  if (!input.supportLevels.length)
    errors.supportLevels = "Add at least one support level.";
  if (!input.resistanceLevels.length)
    errors.resistanceLevels = "Add at least one resistance level.";
  if (!input.riskFactors.length)
    errors.riskFactors = "Add at least one risk factor.";
  if (input.relatedArticleSlug && !SLUG.test(input.relatedArticleSlug))
    errors.relatedArticleSlug = "Use a valid article slug.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function parseIntelligenceForm(formData: FormData): IntelligenceInput {
  const instrument = getInstrument(
    String(formData.get("instrumentSlug") || ""),
  );
  return {
    instrumentSlug: instrument?.slug ?? "",
    symbol: instrument?.symbol ?? "",
    instrumentName: instrument?.name ?? "",
    assetClass: instrument?.assetClass ?? "commodities",
    bias: String(formData.get("bias")) as MarketBias,
    shortSummary: String(formData.get("shortSummary") || "")
      .trim()
      .normalize("NFKC"),
    technicalOverview: String(formData.get("technicalOverview") || "")
      .trim()
      .normalize("NFKC"),
    supportLevels: normalizeLevels(String(formData.get("supportLevels") || "")),
    resistanceLevels: normalizeLevels(
      String(formData.get("resistanceLevels") || ""),
    ),
    momentum: String(formData.get("momentum")) as MomentumState,
    volatility: String(formData.get("volatility")) as VolatilityState,
    bullishScenario: String(formData.get("bullishScenario") || "").trim(),
    bearishScenario: String(formData.get("bearishScenario") || "").trim(),
    riskFactors: String(formData.get("riskFactors") || "")
      .split(/[,\n]/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 12),
    relatedArticleSlug:
      String(formData.get("relatedArticleSlug") || "").trim() || null,
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
    validForDate: String(formData.get("validForDate") || ""),
  };
}

export function parseMarketIntelligenceFilters(searchParams: URLSearchParams) {
  const errors: string[] = [];
  const date = searchParams.get("date")?.trim();
  const assetClass = searchParams.get("assetClass")?.trim() as
    AssetClass | undefined;
  const featuredValue = searchParams.get("featured")?.trim();
  const rawLimit = searchParams.get("limit")?.trim();
  const limit = rawLimit ? Number(rawLimit) : 12;

  if (
    date &&
    (!ISO_DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)))
  )
    errors.push("date must use YYYY-MM-DD format");
  if (assetClass && !ASSET_CLASSES.includes(assetClass))
    errors.push("assetClass is not supported");
  if (featuredValue && !["true", "false"].includes(featuredValue))
    errors.push("featured must be true or false");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    errors.push("limit must be an integer from 1 to 50");

  return {
    valid: errors.length === 0,
    errors,
    filters: {
      date: date || undefined,
      assetClass: assetClass || undefined,
      featured: featuredValue ? featuredValue === "true" : undefined,
      limit,
    },
  };
}
