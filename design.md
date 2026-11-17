# Aroosetna — editorial wedding organizer

Reference: supplied wedding editorial layout. Borrow photography-led scale, restrained ivory/charcoal palette, fine rules and generous white space; never copy reference text.

Typography: self-hosted Amiri 400/700 for Arabic display; Noto Sans Arabic 400–700 for body, labels and controls. Display 56–86 px desktop, 42–54 mobile; body 14–16 px with 1.9 line height. Small bilingual editorial labels use wide tracking.

Colors: ivory #faf9f6, ink #282b25, sage #717b65, soft olive #e9ece3, blush #d6afa4, warm gray #85877e. Photography gets a dark natural overlay, no purple gradients. Accent used only on primary actions and progress.

Layout: RTL. Landing full-bleed wedding hero, restrained navigation, centered title and alternating image/text stories, full-width photographic subscription band. Dashboard 238px sidebar, large heading, photographic countdown banner, ruled metric row, airy working panels. Mobile sidebar becomes a horizontal scrollable nav; no horizontal page overflow.

Components: fine borders, minimal shadows, 2–8 px corner radius except pills. Large calm buttons, icon + label actions, explicit accessible names, visible focus. State tags distinguish paid/pending/confirmed, not just color. Forms use visible labels, numerical constraints and pending/error/success feedback.

UX: typed oRPC and server-owned data. No client-stored passwords or role flags. Demo is labeled and isolated in memory. Dates derive from actual wedding date. Unit price × quantity; cash remaining and remaining after commitments are separate. Nutrition is an optional estimate, not a prescription.
# <App Name> — Design

> Starter design brief. Replace this content with the app you're building before writing any UI.
> Keep it short and concrete — it's the single source of truth for palette, typography, pages,
> screens, and flows across web, mobile, and desktop.

One-line description of the app, the platforms it ships on, the visual direction (style, feel), and the core job it does for the user.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows
### Approved revision: section-first navigation
- Keep ivory/sage Arabic editorial identity. Each section gets a relevant real photograph, its own URL, a concise introduction and primary add/edit action.
- Home shows photographic entry cards; mobile has an explicit page selector, not only horizontally scrolling navigation.
- Administrator sees a clear payment-review shortcut, independently editable content pages and a separate live bride editor with persistent target identifier.
- Payment gets a dedicated /payment route, a three-step explanation and no repeat payment prompt for activated accounts.

1. Describe the primary flow end to end (open → action → result).
2. ...

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
