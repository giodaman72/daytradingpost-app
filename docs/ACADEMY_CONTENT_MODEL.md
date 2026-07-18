# Academy content model

Sanity owns editorial LMS content. Supabase references the generated Sanity
`_id` and version; IDs are not slug-derived. Reusable entities are documents and
relationships are Sanity references.

## Documents

- `academyInstructor`: verified biography, expertise and attribution.
- `academyCertificateTemplate`: educational completion wording and version.
- `academyAssessment`: versioned rules and graded questions.
- `academyLesson`: typed text/video/mixed/quiz/resource lesson.
- `academyModule`: ordered lesson references and prerequisites.
- `academyCourse`: ordered modules, prerequisites, access and completion rules.
- `academyLearningPath`: ordered required/optional course sequence.

## Objects

- `academyVideo`: provider-neutral ID/URL, duration, captions, chapters and
  transcript. Embed HTML and provider secrets are not accepted.
- `academyResource`: allowlisted file/link metadata, access and copyright.
- `academyQuestion` and `academyAnswerOption`: stable identifiers, points,
  answer keys and explanation.
- `academyPassingRequirements`: required content and final assessment.

Only HTTPS playback/resource URLs are accepted. Video hosts are allowlisted.
Uploaded resources are limited to common educational document, image, data, and
practice-bundle formats with a 25 MB schema limit. This is validation, not DRM.

## Publication and versioning

New ordinary documents use generated Sanity IDs. Editorial corrections may
increment a version without invalidating completed progress. Structural or
assessment-breaking changes require a new version and manual impact review.
Never edit answer keys for an active assessment version. Archived content is
not returned by public queries, while historical Supabase state is retained.

Legacy slugs remain explicit fields for future redirect mapping. No migration
was run because the audit found no structured legacy course documents.
