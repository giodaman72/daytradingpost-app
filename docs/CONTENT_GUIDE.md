# Market analysis content guide

This guide defines how DayTradingPost articles are prepared in Sanity. Content
is educational and informational. It must not present personalized investment
advice, guaranteed outcomes, or live prices when the values are illustrative.

## Alert copy

Alert names and notifications must describe the configured condition without promising an outcome or recommending a trade. Always distinguish price data from editorial bias, disclose delayed data, label educational context, and never describe fixtures as real triggers. Email and dashboard messages must link to preferences and include the educational-risk disclaimer.

## Editorial workflow

1. Confirm the instrument, session, source material, and publication time.
2. Create or select the author and category.
3. Draft the technical thesis and its invalidation conditions.
4. Enter support, resistance, scenarios, and risk factors.
5. Add the educational disclaimer and verify all price labels.
6. Complete SEO fields and image alternative text.
7. Preview desktop and mobile layouts.
8. Publish only after a second-person accuracy review.

## Required article fields

### Title

- 8–120 characters.
- Name the instrument and useful decision context.
- Avoid sensational language, promises, and unexplained abbreviations.

Example: `Gold holds above weekly support ahead of US inflation data`.

### Slug

- Generate from the title, then shorten if needed.
- Lowercase words separated by hyphens.
- Stable after publication unless a redirect is added.
- Maximum 96 characters.

### Excerpt

- Required, 40–260 characters.
- Summarize the market condition, key driver, and what the article examines.
- Do not repeat the title verbatim.
- Do not place member-only levels in a public premium excerpt.

### Author

Select a published author with a clear role and biography. The named author owns
the analysis and update decision.

### Category

Choose the narrowest accurate category. Reuse existing categories rather than
creating capitalization or singular/plural variants.

### Featured image

- Required.
- Use a high-resolution image with a useful crop at 16:9 and card ratios.
- Provide descriptive alt text, maximum 160 characters.
- Alt text explains content, not visual styling or `image of`.
- Confirm usage rights and source documentation.

### Instrument symbol

Use the canonical uppercase symbol, such as `XAU/USD`, `NAS100`, `WTI`, or
`BTC/USD`. Do not alternate symbols for the same instrument without updating
the shared market registry.

### Market bias

Choose Bullish, Neutral, or Bearish. Bias describes the published scenario, not
a promise or direct instruction. Explain the timeframe and the condition that
would invalidate the bias in the body.

### Support levels

- Required, one to eight unique values.
- Include units/currency where ambiguity is possible.
- Order consistently from nearest to furthest or document the chosen order.
- Clearly label illustrative or delayed values.

### Resistance levels

Use the same formatting and ordering rules as support. Confirm that support and
resistance are not accidentally reversed after a market move.

### Body content

Recommended structure:

1. Market context and timeframe
2. Technical overview
3. Momentum, structure, and relevant catalysts
4. Bullish scenario and confirmation conditions
5. Bearish scenario and invalidation conditions
6. Trade-planning considerations without personalized instructions
7. Educational risk disclaimer

Use H2 and H3 headings, short paragraphs, and lists. Avoid unsupported precision
and explain acronyms on first use.

### Risk factors

- Required, one to ten unique entries.
- Include scheduled macro events, liquidity, gaps, correlated assets, volatility,
  and thesis-specific invalidation risks where relevant.
- State what could change the outlook, not merely that markets are risky.

### Published date

Use the intended release timestamp. Future timestamps remain unpublished on the
website. When materially updating analysis, decide whether to update the date or
publish a new article; do not silently rewrite historical calls.

### Premium/free status

- `free`: full article is available publicly.
- `premium`: only metadata, excerpt, and preview are public; the body, levels,
  and risk factors require verified server-side membership.

Never place premium-only detail in the title, excerpt, image alt text, SEO fields,
or other public summary fields.

## SEO

### SEO title

- Optional override, maximum 60 characters.
- Put the instrument and decision context early.
- Avoid duplicated titles across published articles.

### SEO description

- Optional override, maximum 160 characters.
- Describe the educational value and current context.
- Do not promise profit or include inaccessible premium details.

### Internal links

Link to relevant academy content, prior context, and the analysis archive. Use
descriptive link text rather than `click here`.

## Educational disclaimer

Every analysis page displays the shared application disclaimer. Authors should
also make limitations clear within the article when prices are illustrative,
data is delayed, or a scenario depends on a scheduled event.

Required meaning:

- educational and informational content only;
- not personalized investment advice;
- trading involves risk and losses are possible;
- readers independently verify current prices and suitability.

## Quality checklist

- [ ] Required fields pass Sanity validation
- [ ] Slug is stable and descriptive
- [ ] Instrument symbol matches the shared registry
- [ ] Bias and invalidation are consistent
- [ ] Support and resistance are correctly ordered
- [ ] Prices and timestamps identify whether they are illustrative or current
- [ ] Risk factors are specific
- [ ] Premium data does not leak through summary fields
- [ ] Featured image has rights and useful alt text
- [ ] SEO title/description fit limits
- [ ] Educational language avoids guarantees and personalized direction
- [ ] Mobile preview and links have been checked

## Structured daily outlooks

Create daily fields in `/admin/market-intelligence`; keep article narrative in
Sanity. Use the registry symbol, select an explicit valid date, treat every level
as an editorial snapshot, and write both bullish and bearish conditions. Link
the Sanity slug rather than copying article body text. Never use “live,”
“guaranteed,” or signal language for an editorial bias.
