# DayTradingPost design system

## Assistant patterns

Assistant surfaces reuse the dark navy, gold accent, restrained borders, Geist
type, and existing controls. Answer status is conveyed by text as well as color.
Chat, composer, stop/copy/feedback controls, history, citations, errors, and
usage require keyboard and screen-reader labels, with reduced motion respected.

The existing dark fintech appearance is the source of truth. This document
describes it; it does not authorize visual redesign during infrastructure work.

## Principles

- Dark, restrained, information-dense surfaces
- Gold for primary brand emphasis
- Green and red only for meaningful directional/status signals
- Clear distinction between illustrative data and live data
- Compact monospace labels for symbols, metrics, dates, and identifiers
- Responsive layouts that preserve reading order and keyboard access

## Typography

| Role                         | Font                        | Guidance                                      |
| ---------------------------- | --------------------------- | --------------------------------------------- |
| Interface and editorial      | Geist Sans                  | Default body, headings, buttons, navigation   |
| Symbols and operational data | Geist Mono                  | Instrument symbols, prices, IDs, timestamps   |
| Fallback                     | Arial/Helvetica/system sans | Used if generated font assets are unavailable |

Headings use tight negative letter spacing and responsive `clamp()` sizes.
Body copy uses relaxed line height, with muted colors for secondary context.

## Color tokens

Runtime CSS variables live in `app/globals.css`; TypeScript references live in
`constants/colors.ts`.

| Token               | Value     | Use                           |
| ------------------- | --------- | ----------------------------- |
| `--background`      | `#070b12` | Page background               |
| `--background-soft` | `#0b111c` | Elevated page regions         |
| `--surface`         | `#101826` | Cards and panels              |
| `--surface-light`   | `#162131` | Hover/elevated surfaces       |
| `--text`            | `#f8fafc` | Primary text                  |
| `--text-soft`       | `#a5b1c2` | Supporting text               |
| `--text-muted`      | `#748095` | Metadata and quiet labels     |
| `--gold`            | `#f5b942` | Brand and primary action      |
| `--gold-light`      | `#ffd978` | High-emphasis gold text       |
| `--green`           | `#27d497` | Positive/active/bullish state |
| `--red`             | `#ff647c` | Error/risk/bearish state      |
| `--blue`            | `#5c8dff` | Informational accents         |
| `--purple`          | `#9c7cff` | Educational/live accents      |

Never use green or red as decoration when they could be interpreted as a trade
signal. Text or icons must accompany color-only state.

## Spacing

The UI uses a flexible 4 px-based rhythm:

- 4–8 px: icon and inline-label gaps
- 10–16 px: control and compact-card spacing
- 18–28 px: panel spacing
- 32–48 px: card padding and section subgroups
- 64–120 px: page-section spacing

The standard content container is `min(calc(100% - 40px), 1180px)`.
Dashboard layouts may expand to 1480 px while maintaining safe side gutters.

## Buttons

Primary buttons:

- gold background and high-contrast dark text;
- clear hover/focus state;
- disabled state reduces opacity and prevents repeat actions;
- concise action-oriented label.

Secondary buttons use transparent/dark surfaces with borders. Text links are
reserved for lower-priority navigation. Use semantic `<button>` for actions and
`<a>`/Next `Link` for navigation.

## Cards and panels

- 1 px translucent border
- 12–24 px radius depending on visual hierarchy
- dark surface or subtle gradient
- restrained shadow for depth
- heading, metadata, body, and action order remains consistent

Reusable examples include analysis cards, `DashboardPanel`, membership cards,
account stat cards, and result cards.

## Tables and lists

The current application favors responsive definition lists and structured
lists. Future tables should:

- use semantic `<table>` markup for true tabular relationships;
- provide column headers and captions;
- preserve keyboard and screen-reader order;
- switch to horizontal scrolling or stacked summaries on narrow screens;
- never hide essential status information solely to fit a viewport.

## Forms

- Every control has a visible or accessible label.
- Required consent is explicit and unchecked by default.
- Server validation is authoritative; client validation improves feedback only.
- Loading states prevent duplicate submission.
- Errors use `role="alert"` or an appropriate live region.
- Success messages explain the resulting state and next action.
- Honeypot controls are removed from the accessibility tree and tab order.

## Icons

Lucide is the default icon family. Icons are decorative when adjacent text
already names the action and therefore use `aria-hidden="true"`. Icon-only
links and buttons require an accessible label.

## Shadows and borders

Shadows use low-opacity black with large blur radii. Borders are the primary
separation method. Avoid strong glow effects except for small live/connected
status indicators.

## Animation

- Transitions are generally 140–200 ms.
- Hover movement is limited to a few pixels.
- Loading skeletons may shimmer.
- `prefers-reduced-motion: reduce` disables nonessential animation.
- Smooth scrolling is declared on `<html>` and identified to Next.js through
  `data-scroll-behavior="smooth"`.

## Responsive breakpoints

The stylesheet uses content-specific breakpoints rather than a single framework
scale. Common thresholds are:

| Breakpoint | Typical change                                          |
| ---------- | ------------------------------------------------------- |
| 1100 px    | Dashboard sidebar becomes horizontal section navigation |
| 1040 px    | Wide grids reduce columns                               |
| 820/800 px | Two-column content stacks                               |
| 760/700 px | Dashboard and analysis details become single column     |
| 640/620 px | Compact cards and typography                            |
| 560/520 px | Full-width actions and simplified list columns          |

Test at 320, 375, 768, 1024, and 1440 px, plus zoom at 200%.

## Accessibility baseline

- WCAG AA color contrast target
- visible keyboard focus
- semantic landmark and heading order
- no color-only meaning
- touch targets appropriate for mobile
- decorative elements hidden from assistive technology
- meaningful loading and error announcements
