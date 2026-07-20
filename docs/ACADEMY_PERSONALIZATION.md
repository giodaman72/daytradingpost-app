# Academy Personalization

Volume 5 adds deterministic, explainable learning recommendations at
`/dashboard/learning/recommendations`. The service evaluates only verified
Academy state: an active timed assessment, current required lesson, most
recently accessed active course, next course in an active learning path, and
published course candidates.

## Priority

1. Active timed assessment
2. Current required lesson
3. Most recently accessed active course
4. Next course in an active learning path
5. Recommended published course

Published course recommendations may use completed prerequisites,
learner-selected interests, related tags/categories and beginner progression.
Every result includes a plain-language reason. The system does not use financial
suitability, demographics, private notes, review text or AI-generated profiling.

Preferences are private and owner-scoped through the server API. Run
`supabase-academy-personalization.sql` before enabling the feature.
