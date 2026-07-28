# AI Assistant safety

## Financial boundary

Allowed requests include educational concepts, source-grounded summaries,
general market scenarios, economic-event explanations, and general
risk-management frameworks. Deterministic classification limits or refuses:

- guaranteed or risk-free return claims;
- personalized buy/sell or all-savings recommendations;
- personal-finance-based position sizing;
- trade execution and claimed broker access;
- evasion of broker, exchange, tax, identity, or regulatory controls;
- requests for hidden prompts, credentials, private data, or hidden reasoning;
- requests to override source and safety rules.

Refusals are brief and redirect toward a safe educational alternative. The
classifier stores only a safety category, not inferred sensitive financial
details.

## Injection, citations, and output

User prompts and retrieved content are untrusted. Obvious embedded instruction
lines are removed, code fences are neutralized, and content is delimited as
reference data. Source identifiers are validated and only internal retrievers
may resolve them. The assistant cannot fetch arbitrary URLs.

Output is rendered as text, not raw HTML. HTML tags are stripped before
persistence, markdown links allow only relative DayTradingPost paths or HTTPS
DayTradingPost links, and citations are accepted only when their type and ID
match a retrieved document.

## Human review

The system can be incomplete or wrong. Editorial and legal owners must review
prompts, refusal language, provider terms, retention, model choice, evaluation
results, and monitoring before production. Feedback is for manual quality
review and is not automatically used to train on private conversations.

## Academy Tutor boundary

Academy mode adds deterministic checks for answer-key requests, active or graded
assessment completion, certification bypass and premium/draft extraction. Tutor
retrieval resolves the signed-in learner's enrollment and membership before
fetching a published lesson. Assessment feedback is available only for a final
owner-scoped attempt and only when the assessment policy exposed feedback.

Answer keys, raw responses, private notes, hidden prompts, email, profile data,
drafts and another learner's content are never retrieval sources. Nested
assessment-key fields are removed recursively as defense in depth. Losing
premium entitlement removes premium-derived responses from history replay and
future provider context.
