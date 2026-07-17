import "server-only";
import { getInstrument } from "@/constants/instruments";
import { getLatestArticles } from "@/lib/cms";
import { getEconomicEventById } from "@/lib/economic/economicService";
import { getMarketQuote } from "@/lib/market-data/marketDataService";
import { getMarketIntelligenceByInstrument } from "@/lib/market/marketIntelligenceService";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { dashboardNotificationChannel } from "@/lib/notifications/channels/dashboardNotificationChannel";
import { deliverAlertEmailWithRetry } from "@/lib/notifications/alertEmail";
import { emailNotificationChannel } from "@/lib/notifications/channels/emailNotificationChannel";
import type { Alert, AlertEvaluationInput } from "@/types/alert";
import { evaluateAlert } from "./alertEvaluator";
import { formatAlertNotification } from "./alertFormatter";
import { insertHistory, listActiveAlerts, patchAlert } from "./alertRepository";

async function sourceFor(
  alert: Alert,
  now: Date,
): Promise<AlertEvaluationInput | null> {
  if (
    alert.alertType.startsWith("price_") ||
    alert.alertType.startsWith("percentage_") ||
    alert.alertType.endsWith("level_reached")
  ) {
    const instrument = alert.instrumentSlug
      ? getInstrument(alert.instrumentSlug)
      : null;
    if (!instrument) return null;
    const quote = await getMarketQuote(instrument);
    const timestamp = quote.providerTimestamp ?? quote.receivedAt;
    const maxAge = Number(process.env.ALERT_DATA_MAX_AGE_SECONDS || 900) * 1000;
    return {
      sourceId: `${quote.provider}:${instrument.slug}`,
      sourceTimestamp: timestamp,
      value: alert.alertType.startsWith("percentage_")
        ? quote.changePercent
        : quote.price,
      delayed: quote.delayed,
      simulated: quote.simulated,
      stale:
        quote.freshness === "stale" ||
        quote.freshness === "unavailable" ||
        now.getTime() - Date.parse(timestamp) > maxAge,
    };
  }
  if (
    alert.alertType === "market_bias_changed" ||
    alert.alertType === "new_market_intelligence"
  ) {
    const record = alert.instrumentSlug
      ? await getMarketIntelligenceByInstrument(alert.instrumentSlug)
      : null;
    if (!record) return null;
    return {
      sourceId: record.id,
      sourceTimestamp: record.updatedAt,
      value: record.bias,
      previousValue: alert.comparisonReference,
      eventStatus: "published",
    };
  }
  if (alert.alertType.startsWith("economic_event_") && alert.economicEventId) {
    const event = await getEconomicEventById(alert.economicEventId);
    if (!event) return null;
    return {
      sourceId: event.id,
      sourceTimestamp: event.updatedAt,
      eventStatus: event.status,
      scheduledTime: event.scheduledTime,
      simulated: event.isFixture,
    };
  }
  if (alert.alertType === "new_market_analysis") {
    const article = (await getLatestArticles(20)).find(
      (item) =>
        !alert.instrumentSlug ||
        getInstrument(item.instrumentSymbol)?.slug === alert.instrumentSlug,
    );
    if (!article) return null;
    return {
      sourceId: article._id,
      sourceTimestamp: article.publishedAt,
      eventStatus: "published",
      value: article.slug,
      previousValue: alert.comparisonReference,
    };
  }
  return null;
}

async function notify(
  alert: Alert,
  result: ReturnType<typeof evaluateAlert>,
  delayed: boolean,
) {
  const draft = {
    userId: alert.userId,
    ...formatAlertNotification(alert, result, delayed),
    metadata: { alertId: alert.id, sourceTimestamp: result.sourceTimestamp },
  };
  const statuses: string[] = [];
  if (alert.channels.includes("dashboard"))
    statuses.push((await dashboardNotificationChannel.deliver(draft)).status);
  if (alert.channels.includes("email")) {
    const { data } = await getSupabaseAdmin()
      .from("profiles")
      .select("email")
      .eq("id", alert.userId)
      .maybeSingle();
    const email = data?.email
      ? await deliverAlertEmailWithRetry(
          {
            to: data.email,
            alertName: alert.name,
            subject: "Smart alert triggered",
            condition: draft.message,
            triggerValue: result.triggerValue ?? "Event",
            timestamp: result.sourceTimestamp,
            delayed,
            link: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/alerts/${alert.id}`,
          },
          emailNotificationChannel.deliver,
        )
      : { status: "failed" as const };
    statuses.push(email.status);
  }
  if (statuses.every((status) => status === "delivered")) return "delivered";
  if (statuses.some((status) => status === "delivered")) return "partial";
  if (statuses.every((status) => status === "skipped")) return "skipped";
  return "failed";
}

export async function evaluateAlertBatch(limit: number, now = new Date()) {
  const alerts = await listActiveAlerts(limit);
  const statistics = { evaluated: 0, triggered: 0, skipped: 0, failed: 0 };
  for (const alert of alerts) {
    try {
      const input = await sourceFor(alert, now);
      statistics.evaluated += 1;
      if (!input) {
        statistics.skipped += 1;
        await patchAlert(alert.userId, alert.id, {
          last_evaluated_at: now.toISOString(),
        });
        continue;
      }
      const result = evaluateAlert(alert, input, now);
      await patchAlert(alert.userId, alert.id, {
        last_evaluated_at: now.toISOString(),
        ...(result.reason.includes("expired") ? { status: "expired" } : {}),
        ...(alert.conditionOperator === "changed" && input.value
          ? { comparison_reference: input.value }
          : {}),
        ...(result.triggered ? { last_triggered_at: now.toISOString() } : {}),
      });
      if (!result.triggered || !result.deduplicationKey) {
        statistics.skipped += 1;
        continue;
      }
      const history = await insertHistory(
        alert,
        { ...result, deduplicationKey: result.deduplicationKey },
        { reason: result.reason, delayed: input.delayed ?? false },
      );
      if (!history) {
        statistics.skipped += 1;
        continue;
      }
      const notificationStatus = await notify(
        alert,
        result,
        input.delayed ?? false,
      );
      await getSupabaseAdmin()
        .from("alert_history")
        .update({ notification_status: notificationStatus })
        .eq("id", history.id);
      statistics.triggered += 1;
    } catch (error) {
      statistics.failed += 1;
      console.error("Alert evaluation failed", {
        alertId: alert.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  return statistics;
}
