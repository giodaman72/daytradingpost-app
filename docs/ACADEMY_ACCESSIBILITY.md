# Academy accessibility

The learner experience targets WCAG 2.2 AA where practical and follows the
existing DayTradingPost focus, contrast, and reduced-motion conventions.

## Implemented

- Semantic headings, landmarks, breadcrumbs, lists, and curriculum navigation
- Native labelled search, filter, sort, note, bookmark, and assessment controls
- Native disclosure controls for modules, mobile curriculum, and transcripts
- Text equivalents for progress, completion, locked, premium, and optional
  states
- Fieldsets and legends for assessment questions
- Radio, checkbox, number, textarea, and select semantics
- Keyboard ordering controls and matching selects
- Current-question, answered, unanswered, and flagged status text
- Polite mutation feedback and assertive timer/error announcements
- Confirmed destructive note and bookmark deletion
- Responsive layouts without pointer-only interactions
- Textual chart-practice alternative and historical-data notice

## Manual verification checklist

Test at 320, 375, 768, 1024, and 1440 pixels and at 200 percent zoom. Navigate
the catalog, mobile curriculum, lesson tools, every question type, confirmation,
and results with the keyboard only. Verify visible focus, heading order,
screen-reader names, timer warning frequency, no horizontal overflow, and
reduced-motion behavior.

Automated browser inspection confirms semantic public Academy and catalog
structure without console errors. No axe or dedicated accessibility-test script
exists in this repository, so this document does not claim a completed
automated WCAG audit.
