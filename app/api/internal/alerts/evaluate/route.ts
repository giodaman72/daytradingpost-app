import { NextResponse } from "next/server";
import { ALERT_MAX_BATCH_SIZE } from "@/constants/smart-alerts";
import { evaluateAlertBatch } from "@/lib/alerts/alertScheduler";
import {
  isAlertSchedulerAuthorized,
  normalizeAlertBatchSize,
} from "@/lib/alerts/alertSchedulerAuth";
export const runtime = "nodejs";
let running = false;
export async function POST(request: Request) {
  if (
    !isAlertSchedulerAuthorized(
      request.headers.get("authorization"),
      process.env.ALERT_CRON_SECRET,
    )
  )
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid scheduler credentials.",
        },
      },
      { status: 401 },
    );
  if (running)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFLICT",
          message: "An evaluation batch is already running on this instance.",
        },
      },
      { status: 409 },
    );
  const limit = normalizeAlertBatchSize(
    process.env.ALERT_EVALUATION_BATCH_SIZE,
    ALERT_MAX_BATCH_SIZE,
  );
  running = true;
  const startedAt = new Date().toISOString();
  try {
    console.warn("Alert evaluation batch started", { limit, startedAt });
    const data = await Promise.race([
      evaluateAlertBatch(limit),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Evaluation timeout.")), 50_000),
      ),
    ]);
    console.warn("Alert evaluation batch completed", { ...data, startedAt });
    return NextResponse.json(
      {
        ok: true,
        data,
        meta: { startedAt, completedAt: new Date().toISOString(), limit },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Alert evaluation batch failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      startedAt,
    });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Evaluation batch failed safely.",
        },
      },
      { status: 500 },
    );
  } finally {
    running = false;
  }
}
