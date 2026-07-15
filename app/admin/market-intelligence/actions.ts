"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMarketEditor } from "@/lib/auth/adminAuthorization";
import { invalidateMarketIntelligence } from "@/lib/market/marketIntelligenceCache";
import {
  parseIntelligenceForm,
  validateMarketIntelligence,
} from "@/lib/market/marketIntelligenceValidation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type EditorState = {
  message: string;
  errors: Record<string, string>;
};

function databasePayload(
  input: ReturnType<typeof parseIntelligenceForm>,
  userId: string,
) {
  return {
    instrument_slug: input.instrumentSlug,
    symbol: input.symbol,
    instrument_name: input.instrumentName,
    asset_class: input.assetClass,
    bias: input.bias,
    short_summary: input.shortSummary,
    technical_overview: input.technicalOverview,
    support_levels: input.supportLevels,
    resistance_levels: input.resistanceLevels,
    momentum: input.momentum,
    volatility: input.volatility,
    bullish_scenario: input.bullishScenario,
    bearish_scenario: input.bearishScenario,
    risk_factors: input.riskFactors,
    related_article_slug: input.relatedArticleSlug,
    is_featured: input.isFeatured,
    is_published: input.isPublished,
    valid_for_date: input.validForDate,
    published_at: input.isPublished ? new Date().toISOString() : null,
    updated_by: userId,
  };
}

async function finishMutation() {
  invalidateMarketIntelligence();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/analysis", "layout");
  revalidatePath("/market-brief");
  revalidatePath("/admin/market-intelligence");
}

export async function createMarketIntelligence(
  _previous: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const access = await requireMarketEditor();
  const input = parseIntelligenceForm(formData);
  const validation = validateMarketIntelligence(input);
  if (!validation.valid)
    return {
      message: "Review the highlighted fields.",
      errors: validation.errors,
    };

  const { error } = await getSupabaseAdmin()
    .from("market_intelligence")
    .insert({
      ...databasePayload(input, access.user.id),
      created_by: access.user.id,
    });

  if (error) {
    return {
      message:
        error.code === "23505"
          ? "A published outlook already exists for this instrument and date. Unpublish it or edit the existing record."
          : "The outlook could not be saved. Please try again.",
      errors: {},
    };
  }

  await finishMutation();
  redirect("/admin/market-intelligence?status=created");
}

export async function updateMarketIntelligence(
  id: string,
  _previous: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const access = await requireMarketEditor();
  const input = parseIntelligenceForm(formData);
  const validation = validateMarketIntelligence(input);
  if (!validation.valid)
    return {
      message: "Review the highlighted fields.",
      errors: validation.errors,
    };

  const { error } = await getSupabaseAdmin()
    .from("market_intelligence")
    .update(databasePayload(input, access.user.id))
    .eq("id", id);

  if (error) {
    return {
      message: "The outlook could not be updated. Please try again.",
      errors: {},
    };
  }

  await finishMutation();
  redirect("/admin/market-intelligence?status=updated");
}

export async function deleteMarketIntelligence(id: string) {
  await requireMarketEditor();

  const { error } = await getSupabaseAdmin()
    .from("market_intelligence")
    .delete()
    .eq("id", id);

  if (!error) await finishMutation();
  redirect(
    `/admin/market-intelligence?status=${error ? "delete-failed" : "deleted"}`,
  );
}
