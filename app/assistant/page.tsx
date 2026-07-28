import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AssistantShell } from "@/components/assistant/AssistantShell";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { requireAssistantAccess } from "@/lib/ai/assistantAuthorization";
import { listConversations, listMessages } from "@/lib/ai/assistantRepository";
import { getAssistantUsage } from "@/lib/ai/assistantUsage";
import {
  ASSISTANT_CONTEXT_MODES,
  type AssistantContextMode,
} from "@/types/ai-context";
import { getInstrument } from "@/constants/instruments";

export const metadata: Metadata = {
  title: "AI Trading Assistant",
  description:
    "Ask grounded questions about DayTradingPost analysis, market intelligence, economic events, and trading education.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const value = (input: string | string[] | undefined) =>
  typeof input === "string" ? input : null;

export default async function AssistantPage({ searchParams }: Props) {
  let access;
  try {
    access = await requireAssistantAccess();
  } catch {
    redirect("/login?next=/assistant");
  }
  const params = await searchParams;
  const conversationId = value(params.conversation);
  const conversations = await listConversations(access.userId, 1, 20).catch(
    () => [],
  );
  const active = conversationId
    ? (conversations.find((item) => item.id === conversationId) ?? null)
    : null;
  const messages = active
    ? await listMessages(access.userId, active.id, 50).catch(() => [])
    : [];
  const usage = await getAssistantUsage(access.userId, access.hasPremiumAccess);
  const requestedMode = value(params.mode) as AssistantContextMode | null;
  const mode =
    requestedMode && ASSISTANT_CONTEXT_MODES.includes(requestedMode)
      ? requestedMode
      : (active?.contextMode ?? "general_education");

  return (
    <main className="assistant-page">
      <Header />
      <section className="assistant-hero">
        <div className="container">
          <span className="section-kicker">Grounded market education</span>
          <h1>DayTradingPost AI Assistant</h1>
          <p>
            Ask questions against published DayTradingPost sources. Every market
            answer separates editorial analysis, data status, and educational
            explanation.
          </p>
        </div>
      </section>
      <div className="container">
        <AssistantShell
          initialConversations={conversations}
          initialMessages={messages}
          initialConversationId={active?.id ?? null}
          initialUsage={usage}
          premium={access.hasPremiumAccess}
          initialContext={{
            mode,
            instrumentSlug:
              getInstrument(value(params.instrument) ?? "")?.slug ?? null,
            articleSlug: value(params.article),
            economicEventId: value(params.event),
            watchlistId: value(params.watchlist),
            prompt: value(params.prompt),
          }}
        />
      </div>
      <Footer />
    </main>
  );
}
