# Privacy notes

The AI Assistant stores the authenticated user ID, conversation title, visible
messages, structured citations, model/provider labels, token counts, feedback,
and minimal aggregate request telemetry. It does not store passwords, payment
details, authentication tokens, provider keys, hidden prompts, chain-of-thought,
raw provider traces, or raw retrieved source context.

Prompts needed to answer a question are sent to the configured AI provider with
bounded DayTradingPost context. Email addresses and complete profiles are not
sent. Obvious credential-shaped values are redacted before submission.

Members can archive or permanently delete conversations. Deleting a conversation
cascades its messages and feedback. Aggregate daily usage and privacy-conscious
operational telemetry may remain until account erasure or the reviewed retention
job removes it. The documented default conversation retention is 180 days.

This engineering note is not a final legal privacy policy. Provider processing,
international transfers, retention, user notices, deletion SLAs, and feedback
review require legal and privacy review before launch.
