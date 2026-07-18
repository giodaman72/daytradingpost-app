# DayTradingPost AI Assistant

## Purpose and boundaries

The assistant is an authenticated, source-grounded educational interface. It
explains DayTradingPost articles, structured Market Intelligence, configured
Market Data, normalized economic events, the Academy preview, and an authorized
member watchlist. It does not execute trades, access brokerage accounts, promise
profits, or determine what is suitable for an individual.

## Architecture and provider

`lib/ai/` owns configuration, authorization, persistence, usage controls,
retrieval, prompt templates, safety, provider adapters, logging, and evaluation.
The browser calls only DayTradingPost Route Handlers. The OpenAI SDK, API key,
system instructions, Supabase service role, Sanity token, raw retrieval context,
and raw provider responses remain in server modules.

`POST /api/assistant/chat` streams `start`, visible `delta`, normalized
`complete`, or stable public `error` events. Conversation, feedback, and usage
routes enforce the verified Supabase user. Idempotency uses
`(user_id, request_id, role)`.

The OpenAI adapter uses the Responses API and a model selected only through
`OPENAI_ASSISTANT_MODEL`. `OPENAI_CLASSIFIER_MODEL` is reserved for future
provider-backed classification; deterministic local classification keeps the
safety boundary independent of provider availability.

For local deterministic work, set `AI_PROVIDER=development`. That provider never
calls an external service, refuses to activate in production, and labels every
answer as a development fixture. Missing production configuration produces a
clean unavailable state.

### Pre-implementation audit

- Supabase authentication, membership access, server/admin clients, published
  Sanity queries, Market Intelligence, Market Data, Economic Intelligence, and
  owner-scoped watchlist services were suitable for reuse.
- No AI provider, assistant persistence, or OpenAI integration existed.
- Existing short-window rate limiters are process-local; they are useful for
  abuse friction but not a distributed production quota.
- Existing analytics creates typed event objects but does not persist or
  transport them. Assistant operations therefore use a separate minimal,
  privacy-conscious request log rather than pretending that helper is durable.
- The Academy currently exposes a static curriculum preview, not structured
  long-form lessons. No authorized webinar transcript repository exists.
- Published free articles and market/economic records are public source
  candidates; premium article bodies require membership; watchlists and
  conversations are private to their owner; operational aggregates are
  administrator-only. Unpublished Sanity drafts and administrative database
  metadata are never retrieval candidates.

## Retrieval and citations

Structured retrieval runs before generation. Exact article, instrument, event,
and watchlist identifiers take priority, followed by recent published records.
Documents are ranked by relevance then timestamp, deduplicated by source type
and ID, sanitized as untrusted content, and bounded by
`AI_MAX_CONTEXT_CHARACTERS`.

Published Sanity content only is queried. Premium bodies require active premium
access. Watchlists are fetched with the authenticated owner ID. Market snapshots
include provider timestamps and delayed/simulated disclosures. Returned
citations must match a document retrieved for that request.

Embeddings were intentionally deferred. The current Academy is a curriculum
preview and no webinar transcript collection exists, so structured filters are
clearer, cheaper, and easier to secure. Revisit after a substantial published
long-form corpus exists.

## Context modes

| Mode                  | Primary sources                             | Special access   |
| --------------------- | ------------------------------------------- | ---------------- |
| `general_education`   | Academy, public articles                    | Authenticated    |
| `market_analysis`     | intelligence, data, articles, events        | Authenticated    |
| `economic_event`      | normalized events, Academy, articles        | Authenticated    |
| `article_explanation` | selected article, intelligence, data        | Premium filtered |
| `academy_tutor`       | Academy, educational articles               | Premium filtered |
| `watchlist_summary`   | owned watchlist, intelligence, data, events | Premium          |
| `risk_management`     | Academy, articles, intelligence             | Authenticated    |

## Limits, cost, and caching

Defaults are five requests/day for free accounts and 50 for premium accounts.
The server also applies 12 requests/minute, per-user concurrency, maximum input,
context and output sizes, a timeout, one transient retry, and no automatic
page-render calls. Cost is recorded only when reviewed per-million token prices
are configured; otherwise usage is tracked without claiming cost.

The in-process short-window limiter is best effort per runtime instance. Daily
limits and idempotency are database-backed. A shared distributed limiter is
recommended before unusually high traffic.

Existing source caches remain in their owning services. Private responses,
watchlist context, history, usage, and premium outputs are never shared across
users. Sprint 13 does not cache generated answers or label cached market claims
as newly generated.

## Conversations and privacy

Visible messages, structured citations, model/provider labels, token counts,
feedback, and safety categories are stored. Hidden prompts, raw traces,
credentials, raw retrieval context, chain-of-thought, email addresses, and
payment details are not stored in assistant tables. Archive preserves messages;
delete cascades conversation messages and feedback. Daily aggregate usage
remains until account erasure or a reviewed retention process removes it.

The documented default retention is 180 days. Automated purging is not included;
operations must schedule a reviewed retention job before production. Provider
processing terms require legal/privacy review.

## Production checklist

1. Run `docs/supabase-ai-assistant.sql` in the intended Supabase project.
2. Verify RLS and confirm browser roles cannot mutate provider metadata.
3. Configure server-only OpenAI values in Vercel for each environment.
4. Select and review a supported model; never use development fixtures.
5. Review usage, retention, provider processing, and optional pricing inputs.
6. Test login, public/premium sources, watchlist ownership, deletion, refusals,
   citations, timeout behavior, and `/admin/ai`.
7. Monitor aggregate error, refusal, token, feedback, and citation metrics.

## Troubleshooting and limitations

- “Not configured”: set `AI_PROVIDER=openai`, the API key, and the model.
- “No sources”: publish or select the relevant authorized source.
- No history or usage rows: apply the Supabase migration.
- Watchlist blocked: verify ownership and active premium status.
- Fixture visible in a deployment: remove `AI_PROVIDER=development`.

There is no arbitrary web browsing, upload, autonomous trading tool, broker
access, embedding index, multilingual prompt pack, webinar transcript corpus, or
Academy progress mutation. Future work may add reviewed read-only tools, richer
Academy content, multilingual content, and transcript ingestion.

## Academy Tutor foundation

Sprint 15 replaces the hard-coded Academy source foundation with published,
authorized course/lesson projections. Tutor context must check course and lesson
access, omit assessment keys, cite canonical course/lesson URLs, and exclude
private notes. It reuses the existing AI provider and is never called
automatically during rendering. The learner Tutor experience remains Part 2.
