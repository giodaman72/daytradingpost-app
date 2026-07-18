import "server-only";
import { ASSISTANT_CONTEXT_RULES } from "@/constants/ai-assistant";
import type { AssistantRequest } from "@/types/ai-assistant";
import type { RetrievalDocument, RetrievalResult } from "@/types/ai-context";
import { AssistantError } from "../assistantErrors";
import { canUseAssistantMode } from "../assistantPolicy";
import { getAssistantConfig } from "../assistantConfig";
import { retrieveAcademyContent } from "./academyRetriever";
import { rankAndDeduplicateDocuments } from "./contextAssembler";
import { retrieveEconomicEvents } from "./economicRetriever";
import { retrieveMarketData } from "./marketDataRetriever";
import { retrieveMarketIntelligence } from "./marketIntelligenceRetriever";
import { retrieveSanityArticles } from "./sanityRetriever";
import { retrieveWatchlist } from "./watchlistRetriever";

export async function retrieveAssistantContext(
  request: AssistantRequest,
  userId: string,
  hasPremiumAccess: boolean,
): Promise<RetrievalResult> {
  const rule = ASSISTANT_CONTEXT_RULES[request.contextMode];
  if (!canUseAssistantMode(request.contextMode, hasPremiumAccess))
    throw new AssistantError(
      "FORBIDDEN",
      "Watchlist summaries are available to premium members.",
      403,
    );
  const allowed = new Set(rule.sources);
  const tasks: Promise<RetrievalDocument[]>[] = [];
  if (allowed.has("article"))
    tasks.push(
      retrieveSanityArticles(request.articleSlug ?? null, hasPremiumAccess),
    );
  if (allowed.has("market_intelligence"))
    tasks.push(retrieveMarketIntelligence(request.instrumentSlug ?? null));
  if (allowed.has("market_data"))
    tasks.push(retrieveMarketData(request.instrumentSlug ?? null));
  if (allowed.has("economic_event"))
    tasks.push(retrieveEconomicEvents(request.economicEventId ?? null));
  if (allowed.has("academy"))
    tasks.push(retrieveAcademyContent(hasPremiumAccess));
  if (allowed.has("watchlist"))
    tasks.push(retrieveWatchlist(userId, request.watchlistId ?? null));

  const settled = await Promise.allSettled(tasks);
  const accessError = settled.find(
    (item) =>
      item.status === "rejected" &&
      item.reason instanceof AssistantError &&
      item.reason.code === "FORBIDDEN",
  );
  if (accessError?.status === "rejected") throw accessError.reason;
  const warnings = settled
    .filter((item) => item.status === "rejected")
    .map(
      () => "A configured DayTradingPost source was temporarily unavailable.",
    );
  const documents = rankAndDeduplicateDocuments(
    settled.flatMap((item) => (item.status === "fulfilled" ? item.value : [])),
    getAssistantConfig().maximumContextCharacters,
  );
  return { documents, warnings, generatedAt: new Date().toISOString() };
}
