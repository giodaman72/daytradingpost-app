import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  MarketIntelligenceFilters,
  MarketIntelligenceRecord,
  MarketLevel,
} from "@/types/market-intelligence";

type Row = Record<string, unknown>;
const levels = (value: unknown): MarketLevel[] =>
  Array.isArray(value)
    ? value.filter((item): item is MarketLevel =>
        Boolean(item && typeof item === "object" && "value" in item),
      )
    : [];
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export function mapIntelligenceRow(row: Row): MarketIntelligenceRecord {
  return {
    id: String(row.id),
    instrumentSlug: String(row.instrument_slug),
    symbol: String(row.symbol),
    instrumentName: String(row.instrument_name),
    assetClass: row.asset_class as MarketIntelligenceRecord["assetClass"],
    bias: row.bias as MarketIntelligenceRecord["bias"],
    shortSummary: String(row.short_summary),
    technicalOverview: String(row.technical_overview),
    supportLevels: levels(row.support_levels),
    resistanceLevels: levels(row.resistance_levels),
    momentum: row.momentum as MarketIntelligenceRecord["momentum"],
    volatility: row.volatility as MarketIntelligenceRecord["volatility"],
    bullishScenario: String(row.bullish_scenario),
    bearishScenario: String(row.bearish_scenario),
    riskFactors: strings(row.risk_factors),
    relatedArticleSlug: row.related_article_slug
      ? String(row.related_article_slug)
      : null,
    isFeatured: Boolean(row.is_featured),
    isPublished: Boolean(row.is_published),
    validForDate: String(row.valid_for_date),
    publishedAt: row.published_at ? String(row.published_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listPublishedIntelligence(
  filters: MarketIntelligenceFilters = {},
) {
  try {
    let query = getSupabaseAdmin()
      .from("market_intelligence")
      .select("*")
      .eq("is_published", true)
      .lte(
        "valid_for_date",
        filters.date ?? new Date().toISOString().slice(0, 10),
      )
      .order("valid_for_date", { ascending: false })
      .order("is_featured", { ascending: false })
      .limit(filters.limit ?? 12);
    if (filters.date) query = query.eq("valid_for_date", filters.date);
    if (filters.assetClass) query = query.eq("asset_class", filters.assetClass);
    if (filters.featured !== undefined)
      query = query.eq("is_featured", filters.featured);
    const { data, error } = await query;
    if (error) return [];
    return (data as Row[]).map(mapIntelligenceRow);
  } catch {
    return [];
  }
}

export async function findPublishedIntelligence(instrumentOrArticle: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(instrumentOrArticle)) return null;
  try {
    const { data } = await getSupabaseAdmin()
      .from("market_intelligence")
      .select("*")
      .eq("is_published", true)
      .lte("valid_for_date", new Date().toISOString().slice(0, 10))
      .or(
        `instrument_slug.eq.${instrumentOrArticle},related_article_slug.eq.${instrumentOrArticle}`,
      )
      .order("valid_for_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? mapIntelligenceRow(data as Row) : null;
  } catch {
    return null;
  }
}

export async function listAllIntelligence() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("market_intelligence")
      .select("*")
      .order("valid_for_date", { ascending: false })
      .limit(100);
    return error ? [] : (data as Row[]).map(mapIntelligenceRow);
  } catch {
    return [];
  }
}

export async function findIntelligenceById(id: string) {
  try {
    const { data } = await getSupabaseAdmin()
      .from("market_intelligence")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapIntelligenceRow(data as Row) : null;
  } catch {
    return null;
  }
}
