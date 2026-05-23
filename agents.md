# Signalor AI — Frontend Agent Context

> **Project:** `ranking-fe` — Next.js 16 App Router frontend for [signalor.ai](https://signalor.ai)
> **Package manager:** pnpm (never npm or yarn)
> **Working directory:** `C:\Users\yasho\Desktop\opti-pro\ranking-fe`

---

## What this project is

Signalor is an **AI GEO (Generative Engine Optimization) platform**. It tracks how brands appear in AI search engines (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, Bing AI), analyzes citation quality, scores content against SEO/GEO pillars, and gives actionable recommendations to improve AI visibility.

**Core features:**

- AI visibility tracking across 6 engines (ChatGPT, Claude, Gemini, Perplexity, Google, Bing)
- Multi-pillar GEO score (technical, content, citations, sentiment, competitors)
- URL/content analysis with run-based job system (async, polled)
- Competitor benchmarking
- Backlink marketplace (curated static provider directory — no purchase API)
- Content optimization recommendations
- Gamification (points, badges, leaderboard)
- Creator/affiliate referral program
- Blog (Sanity CMS)
- WordPress & Shopify integrations
- Payments via Dodo Payments
- Error monitoring via Sentry (EU ingest)

---

## Tech stack

| Layer             | Choice                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| Framework         | Next.js 16.1.6 (App Router)                                                           |
| React             | 19.2.3 (server components by default)                                                 |
| Styling           | Tailwind CSS 4 + shadcn/ui + `tw-animate-css`                                         |
| Theme             | `next-themes` 0.4.6                                                                   |
| Auth              | `better-auth` 1.4.18 (email OTP + Google OAuth)                                       |
| Server state      | TanStack Query (`@tanstack/react-query` v5)                                           |
| Global state      | Zustand 5                                                                             |
| HTTP              | Axios 1.13.5 (custom instances in `src/lib/api/client.ts`)                            |
| Validation        | Zod 4                                                                                 |
| Forms             | React Hook Form 7 + `@hookform/resolvers`                                             |
| Rich text editor  | Tiptap 3                                                                              |
| CMS               | Sanity v5 (blog only, SSR disabled in Studio)                                         |
| Charts            | Recharts 3                                                                            |
| Animations        | Framer Motion 12 + `motion` + Rive                                                    |
| Animated numbers  | `@number-flow/react`                                                                  |
| Command menu      | `cmdk`                                                                                |
| Date picker       | `react-day-picker`                                                                    |
| OTP input         | `input-otp`                                                                           |
| PageSpeed audit   | `lighthouse` + `chrome-launcher` (server-side tools route)                            |
| Payments          | Dodo Payments                                                                         |
| Error monitoring  | Sentry (`@sentry/nextjs` v10, EU ingest)                                              |
| Analytics         | Amplitude, Google Analytics/GTM, Microsoft Clarity, Vercel Analytics + Speed Insights |
| Database (server) | PostgreSQL via `pg` (server-side only, never imported in client code)                 |

---

## Quick start

```bash
pnpm install
pnpm env:local          # copies env/local.env → .env.local
pnpm dev                # http://localhost:3000  (webpack)
pnpm dev:turbo          # http://localhost:3000  (turbopack, faster)
```

Backend (`ranking-be` Django) must run at `http://localhost:8000`.

---

## Scripts

| Script                | What it does                              |
| --------------------- | ----------------------------------------- |
| `pnpm dev`            | Start dev server (`next dev --webpack`)   |
| `pnpm dev:turbo`      | Start dev server (`next dev --turbopack`) |
| `pnpm build`          | Production build — run before every push  |
| `pnpm start`          | Start production server                   |
| `pnpm lint`           | ESLint check                              |
| `pnpm lint:fix`       | ESLint auto-fix                           |
| `pnpm format`         | Prettier format all files                 |
| `pnpm format:check`   | Prettier check (CI)                       |
| `pnpm typecheck`      | TypeScript check (`tsc --noEmit`)         |
| `pnpm env:local`      | Switch to local environment               |
| `pnpm env:staging`    | Switch to staging environment             |
| `pnpm env:production` | Switch to production environment          |

---

## Directory structure

```
ranking-fe/
├── src/
│   ├── app/                         # Next.js App Router routes
│   │   ├── layout.tsx               # Root layout (fonts, providers, analytics)
│   │   ├── page.tsx                 # Landing page
│   │   ├── globals.css              # Global styles
│   │   ├── manifest.ts              # PWA manifest
│   │   ├── robots.ts                # robots.txt generation
│   │   ├── sitemap.ts               # sitemap.xml generation
│   │   ├── error.tsx                # Root error boundary
│   │   ├── global-error.tsx         # Global error boundary
│   │   ├── not-found.tsx            # 404 page
│   │   │
│   │   ├── (auth)/                  # Unauthenticated auth routes (grouped layout)
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   │
│   │   ├── auth/callback/           # OAuth callback handler
│   │   │
│   │   ├── creator/                 # Creator-specific auth (separate from main auth)
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── new/                 # Create new org
│   │   │   └── [slug]/              # Main authenticated workspace
│   │   │       ├── _components/     # Dashboard shell (layout, breadcrumbs, top bar)
│   │   │       ├── analytics/
│   │   │       ├── backlinks/
│   │   │       ├── blog-agent/
│   │   │       ├── competitors/
│   │   │       ├── optimisation/content/
│   │   │       ├── prompts/         # Prompt tracking sub-sections
│   │   │       │   ├── actions/
│   │   │       │   ├── backlinks/
│   │   │       │   ├── engine/
│   │   │       │   ├── history/
│   │   │       │   └── ranking/
│   │   │       ├── recommendations/
│   │   │       ├── settings/
│   │   │       │   ├── billing/
│   │   │       │   ├── profile/
│   │   │       │   └── referrals/
│   │   │       ├── sitemap/
│   │   │       └── visibility/
│   │   │           └── explorer/
│   │   │
│   │   ├── analyzer/[runId]/        # Per-run analysis pages
│   │   │
│   │   ├── creator-dashboard/       # Creator program workspace
│   │   │   ├── _components/
│   │   │   └── settings/
│   │   │
│   │   ├── creators-program/        # Public creators program pages
│   │   │   ├── [code]/              # Referral/invite link
│   │   │   └── apply/
│   │   │
│   │   ├── settings/                # Top-level account settings (separate from dashboard)
│   │   │   ├── account/
│   │   │   └── billing/
│   │   │
│   │   ├── tools/                   # Free public tools
│   │   │   ├── competitors-analysis/
│   │   │   ├── llms-check/
│   │   │   ├── schema-validator/
│   │   │   └── url-analyzer/
│   │   │
│   │   ├── integration/
│   │   │   ├── shopify/
│   │   │   └── wordpress/
│   │   │
│   │   ├── prompt-tracking/         # Public prompt tracking feature pages
│   │   │   ├── ai-surfaces/
│   │   │   └── prompt-library/
│   │   │
│   │   ├── explorer/                # Public explorer tool
│   │   ├── recommendations/         # Public recommendations landing
│   │   │
│   │   ├── blog/                    # Blog (Sanity CMS)
│   │   │   ├── [blog_id]/
│   │   │   └── rss.xml/
│   │   │
│   │   ├── studio/[[...tool]]/      # Sanity Studio (ssr: false — must stay that way)
│   │   ├── payments/success/
│   │   ├── onboarding/company-info/
│   │   ├── pricing/
│   │   ├── about-us/
│   │   ├── ai-visibility/
│   │   ├── policy/
│   │   ├── terms/
│   │   └── terms-and-condition/
│   │
│   │   # API route handlers
│   │   └── api/
│   │       ├── auth/[...all]/       # better-auth handler (all auth operations)
│   │       ├── tunnel/              # Sentry tunnel proxy (POST)
│   │       ├── email/welcome/
│   │       ├── nav-posts/
│   │       ├── prompts/search-insights/
│   │       └── tools/
│   │           ├── competitors/
│   │           ├── llms-check/
│   │           └── schema-validator/
│   │
│   ├── components/
│   │   ├── analyzer/                # ~44 panel/card components for analyzer
│   │   │   ├── ActionDropdown.tsx
│   │   │   ├── agent-log-panel.tsx
│   │   │   ├── ai-chat.tsx
│   │   │   ├── ai-monitoring-tab.tsx
│   │   │   ├── backlink-marketplace-panel.tsx
│   │   │   ├── backlink-opportunities-panel.tsx
│   │   │   ├── brand-kit-card.tsx
│   │   │   ├── brand-visibility-tab.tsx
│   │   │   ├── citation-authority-panel.tsx
│   │   │   ├── citation-sources-panel.tsx
│   │   │   ├── citation-trend-chart.tsx
│   │   │   ├── competitor-table.tsx
│   │   │   ├── crawl-essentials-panel.tsx
│   │   │   ├── create-org-dialog.tsx
│   │   │   ├── domain-analytics-panel.tsx
│   │   │   ├── fix-cta-card.tsx / fix-preview-modal.tsx
│   │   │   ├── gamification-panel.tsx
│   │   │   ├── hero-analyzer-form.tsx
│   │   │   ├── org-switcher.tsx
│   │   │   ├── pdf-download-button.tsx
│   │   │   ├── pillar-breakdown.tsx / pillar-legend.tsx
│   │   │   ├── prompt-rank-plan-panel.tsx
│   │   │   ├── prompt-tracker.tsx
│   │   │   ├── rank-tracker-panel.tsx / rank-tracker-shell.tsx
│   │   │   ├── recommendations-panel.tsx
│   │   │   ├── report-header.tsx
│   │   │   ├── schedule-toggle.tsx
│   │   │   ├── score-card.tsx / score-gauge.tsx / score-history-chart.tsx
│   │   │   ├── sentiment-breakdown.tsx
│   │   │   ├── share-of-voice-panel.tsx
│   │   │   ├── site-backlink-marketplace-panel.tsx  ← backlink provider directory
│   │   │   ├── site-backlink-opportunities-panel.tsx
│   │   │   ├── sitemap-audit-panel.tsx / sitemap-audit-shell.tsx
│   │   │   ├── social-brand-reach-card.tsx
│   │   │   ├── summary-cards.tsx
│   │   │   ├── url-input-form.tsx
│   │   │   ├── visibility-summary.tsx
│   │   │   ├── world-presence-map.tsx
│   │   │   └── world-presence-map-libre.tsx
│   │   │
│   │   ├── dashboard/               # Dashboard card components
│   │   │   ├── ai-engine-probes-card.tsx
│   │   │   ├── ai-recommendation-card.tsx  ← canonical TanStack Query pattern
│   │   │   ├── competitors-card.tsx
│   │   │   ├── geo-score-card.tsx
│   │   │   ├── geo-score-history-card.tsx
│   │   │   ├── pillar-breakdown-card.tsx
│   │   │   ├── prediction-sentiment-row.tsx
│   │   │   ├── score-prediction-card.tsx
│   │   │   ├── sentiment-analysis-card.tsx
│   │   │   ├── top-issues-card.tsx
│   │   │   ├── visibility-by-platform-card.tsx
│   │   │   ├── weekly-performance-section.tsx
│   │   │   ├── constants.ts / types.ts
│   │   │   └── skeletons/           # Loading skeleton variants
│   │   │
│   │   ├── landing/                 # Marketing page components (~25 files)
│   │   │   ├── LandingMegaNav.tsx
│   │   │   ├── landing-hero.tsx / landing-hero-analyzer-form.tsx
│   │   │   ├── landing-footer.tsx
│   │   │   ├── landing-features-grid.tsx
│   │   │   ├── landing-how-it-works.tsx
│   │   │   ├── landing-integrations-strip.tsx
│   │   │   ├── landing-pricing-teaser.tsx
│   │   │   ├── landing-testimonials.tsx
│   │   │   ├── landing-faq.tsx
│   │   │   ├── landing-newsletter.tsx
│   │   │   ├── landing-creators-program.tsx
│   │   │   ├── landing-why-signalor.tsx
│   │   │   ├── landing-marketing-shell.tsx
│   │   │   ├── integration-hero.tsx / integration-platform-hero.tsx
│   │   │   ├── integration-mid-section.tsx / integration-detail-cta.tsx
│   │   │   ├── feature-detail-hero.tsx / hero-background-grid.tsx
│   │   │   ├── prompt-tracking-hero.tsx / prompt-tracking-features-grid.tsx
│   │   │   ├── prompt-tracking-why-section.tsx
│   │   │   ├── prompt-tracking-chat-answer-parts.tsx
│   │   │   ├── rotating-engine-icon.tsx
│   │   │   └── constants.ts
│   │   │
│   │   ├── ui/                      # shadcn primitives + custom Signalor UI
│   │   │   ├── button.tsx / input.tsx / label.tsx / select.tsx
│   │   │   ├── popover.tsx / command-palette.tsx / calendar.tsx
│   │   │   ├── table.tsx / tooltip.tsx / sheet.tsx / sidebar.tsx
│   │   │   ├── separator.tsx / input-otp.tsx / card.tsx / chart.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── background-beams.tsx / spotlight.tsx / sparkles.tsx
│   │   │   ├── moving-border.tsx / intersection-diamonds.tsx
│   │   │   ├── signalor-loader.tsx / signalor-rings.tsx
│   │   │   ├── analyzing-radar.tsx / rive-loader.tsx
│   │   │   ├── rotating-geo-fact.tsx
│   │   │   ├── ai-chip.tsx / engine-badge.tsx
│   │   │   ├── user-avatar.tsx / vis-charts.tsx
│   │   │   └── ...
│   │   │
│   │   ├── icons/                   # Custom icon set (never import from lucide-react)
│   │   │   ├── index.tsx            # All standard icons
│   │   │   └── nav.tsx              # Navigation icons
│   │   │
│   │   ├── analytics/               # Analytics init components
│   │   │   ├── clarity.tsx / google-analytics.tsx
│   │   │   ├── referral-capture.tsx / affiliate-capture.tsx
│   │   │   └── gitbook-widget.tsx
│   │   │
│   │   ├── visibility/              # AI visibility panel components
│   │   │   ├── google-details-panel.tsx
│   │   │   ├── platform-bar-chart.tsx / platform-score-card.tsx
│   │   │   ├── reddit-details-panel.tsx
│   │   │   └── web-mentions-panel.tsx
│   │   │
│   │   ├── optimisation/            # Content optimization UI
│   │   │   ├── browser-chrome.tsx / page-iframe.tsx
│   │   │   ├── element-editor.tsx
│   │   │   ├── raw-files-panel.tsx
│   │   │   ├── suggestion-card.tsx
│   │   │   └── suggestions-rail.tsx
│   │   │
│   │   ├── auth/                    # Auth UI (OTP input, forms)
│   │   ├── navigation/              # App sidebar (app-sidebar.tsx)
│   │   ├── providers/               # QueryProvider (TanStack Query)
│   │   ├── settings/                # Settings section components
│   │   ├── tools/                   # Free tool UI components
│   │   ├── integrations/            # Shopify/WordPress integration UI
│   │   ├── editor/                  # Tiptap rich text editor
│   │   ├── seo/                     # JSON-LD / structured data (json-ld.tsx)
│   │   ├── pricing/                 # Pricing page components
│   │   ├── onboarding/              # Onboarding flow components
│   │   ├── creator/                 # Creator program components
│   │   ├── blog/                    # Blog post cards/listing
│   │   └── cookies/                 # Cookie consent (cookie-consent.tsx)
│   │
│   ├── lib/
│   │   ├── api/                     # Axios API wrappers (one file per Django app)
│   │   │   ├── client.ts            # apiClient (30s) + apiClientLong (60s)
│   │   │   ├── analyzer.ts          # Run analysis, scoring, backlinks, orders
│   │   │   ├── organizations.ts     # Org CRUD, onboarding
│   │   │   ├── visibility.ts        # AI visibility data per platform
│   │   │   ├── payments.ts          # Billing/subscriptions
│   │   │   ├── profile.ts           # User profile
│   │   │   ├── referrals.ts         # Referral tracking & rewards
│   │   │   ├── gamification.ts      # Points/badges
│   │   │   ├── integrations.ts      # Shopify, WP, etc.
│   │   │   ├── actions.ts           # Prompt/action endpoints
│   │   │   ├── partners.ts          # Partner endpoints
│   │   │   ├── partners-program.ts  # Partner program
│   │   │   └── content-optimisation.ts
│   │   │
│   │   ├── stores/                  # Zustand stores
│   │   │   ├── org-store.ts         # useOrgStore (activeOrg persists to localStorage)
│   │   │   ├── analyzer-store.ts
│   │   │   ├── gamification-store.ts
│   │   │   ├── onboarding-store.ts
│   │   │   └── consent-store.ts
│   │   │
│   │   ├── services/email.ts
│   │   ├── hooks/use-currency.ts
│   │   │
│   │   ├── auth-client.ts           # better-auth client (OTP plugin)
│   │   ├── auth.ts                  # Auth utilities
│   │   ├── config.ts                # Routes config + feature flags
│   │   ├── env.ts                   # Zod-validated NEXT_PUBLIC_* env vars
│   │   ├── utils.ts                 # cn(), general helpers
│   │   ├── engines.ts               # AI engine/LLM engine metadata
│   │   ├── countries.ts             # Country list
│   │   ├── seo.ts                   # Metadata + JSON-LD builders
│   │   ├── internal-nav.ts          # Internal navigation route helpers
│   │   ├── confetti.ts              # Confetti animation utility
│   │   ├── geo-loading-facts.ts     # Loading tip copy
│   │   ├── recommendations-filters.ts
│   │   └── [landing-*-content.ts]   # Static content for landing page sections
│   │
│   ├── sanity/                      # Sanity CMS integration (blog only)
│   │   ├── env.ts
│   │   ├── lib/                     # client, image builder, GROQ queries, live preview
│   │   ├── schemaTypes/             # post, blockContent, category, author
│   │   └── structure.ts             # Studio structure config
│   │
│   ├── types/maplibre.d.ts
│   ├── amplitude.ts                 # Amplitude tracking setup
│   ├── instrumentation.ts           # Sentry server/edge init (Next.js hook)
│   ├── instrumentation-client.ts    # Sentry client init + Session Replay
│   └── proxy.ts                     # Proxy utility
│
├── env/
│   ├── example.env                  # Template for all environment variables
│   ├── local.env
│   ├── staging.env
│   └── production.env
│
├── public/                          # Static assets
├── next.config.ts                   # Next.js config (CSP headers, Sentry, images)
├── sentry.server.config.ts          # Sentry server-side init
├── sentry.edge.config.ts            # Sentry edge runtime init
├── sanity.config.ts                 # Sanity Studio config
├── sanity.cli.ts                    # Sanity CLI config
├── vercel.json                      # Vercel deployment config
├── tsconfig.json
├── components.json                  # shadcn/ui config
├── postcss.config.mjs
├── eslint.config.mjs
├── CLAUDE.md                        # Claude Code project instructions
├── agents.md                        # This file (Markdown)
└── agents.txt                       # This file (plain text)
```

---

## Coding conventions

### Package manager

Always use `pnpm`. Never `npm` or `yarn`.

### Icons

Import from `@/components/icons`, **not** `lucide-react`:

```tsx
// ✅ correct
import { AlertCircle, Loader2 } from "@/components/icons";

// ❌ wrong
import { AlertCircle } from "lucide-react";
```

### API calls

All backend calls go through `apiClient` or `apiClientLong` from `src/lib/api/client.ts`. Never use raw `fetch` or `axios` directly in components.

```ts
// src/lib/api/example.ts
import { apiClient } from "./client";

export async function getThings(id: string) {
  const { data } = await apiClient.get(`/things/${id}/`);
  return ThingSchema.parse(data);
}
```

### Data fetching pattern

**New components MUST use TanStack Query**, not `useState + useEffect`:

```tsx
// ✅ canonical pattern (see src/components/dashboard/ai-recommendation-card.tsx)
const { data, isLoading, error } = useQuery({
  queryKey: ["things", id],
  queryFn: () => getThings(id),
});

// ❌ avoid in new code
const [data, setData] = useState();
useEffect(() => {
  getThings(id).then(setData);
}, [id]);
```

### Client vs Server components

- Default to Server Components
- Add `"use client"` only when you need: `useState`, `useEffect`, `useQuery`, browser APIs, event handlers

### Comments

Write no comments by default. Only add one when the **why** is non-obvious (a hidden constraint, a workaround for a specific bug). Never describe what the code does.

### TypeScript

Strict mode is on. No `any` types. Validate all API responses with Zod schemas.

### Styling

- Tailwind utility classes only — no inline styles, no CSS modules
- Dark mode support via `next-themes`; the root `<html>` uses `className="light"` with next-themes toggling
- Use `cn()` from `@/lib/utils` for conditional class merging

### Environment variables

- Client-side vars **must** be prefixed `NEXT_PUBLIC_`
- Source of truth: `env/` folder — switch with `pnpm env:<target>`
- Validated via Zod in `src/lib/env.ts`

---

## Environment variables reference

| Variable                         | Purpose                          | Local value             |
| -------------------------------- | -------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`            | Django backend URL               | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL`           | Public site origin (share links) | `http://localhost:3000` |
| `DATABASE_URL`                   | PostgreSQL connection string     | `postgresql://...`      |
| `BETTER_AUTH_SECRET`             | Session signing key (32+ chars)  | random string           |
| `BETTER_AUTH_URL`                | Auth server origin               | `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL`    | Client-side auth URL             | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID`               | Google OAuth                     | —                       |
| `GOOGLE_CLIENT_SECRET`           | Google OAuth                     | —                       |
| `SENDGRID_API_KEY`               | Transactional email              | `SG.xxx`                |
| `FROM_EMAIL`                     | Sender address                   | `noreply@signalor.ai`   |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Sanity project ID                | `bf4vwhx5`              |
| `NEXT_PUBLIC_SANITY_DATASET`     | Sanity dataset                   | `blogs`                 |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version               | `2026-05-02`            |
| `NEXT_PUBLIC_SENTRY_DSN`         | Sentry DSN (client-side)         | EU DSN string           |
| `SENTRY_DSN`                     | Sentry DSN (server-side)         | same as above           |
| `NEXT_PUBLIC_SKIP_PAYMENT_GATE`  | Skip payment wall                | `true`                  |

### API base URLs per environment

| Environment | `NEXT_PUBLIC_API_URL`             | `NEXT_PUBLIC_SITE_URL`        |
| ----------- | --------------------------------- | ----------------------------- |
| Local       | `http://localhost:8000`           | `http://localhost:3000`       |
| Staging     | `https://staging-api.signalor.ai` | `https://staging.signalor.ai` |
| Production  | `https://api.signalor.ai`         | `https://signalor.ai`         |

---

## Authentication

- **Provider:** better-auth — email OTP (no passwords) + Google OAuth
- **Session:** Cookie-based, managed by the better-auth handler at `/api/auth/[...all]/`
- **Client hook:** `useSession()` from `@/lib/auth-client`
- **Protected routes:** Enforced in page components (redirect to `/sign-in` if no session). There is **no `middleware.ts`** — route protection is client-side.
- **Org context:** `useOrgStore()` provides `activeOrg`; the organization slug is the URL segment in `/dashboard/[slug]/`

---

## Sentry error monitoring

- **SDK:** `@sentry/nextjs` v10 — uses `instrumentation.ts` pattern (Next.js 15+ style, not `sentry.client.config.ts`)
- **Client init:** `src/instrumentation-client.ts` — Session Replay (`replayIntegration()`), tunnel to `/api/tunnel`, `sendDefaultPii: true`, `tracesSampleRate: 1`
- **Server init:** `sentry.server.config.ts` (loaded via `src/instrumentation.ts` when `NEXT_RUNTIME === "nodejs"`)
- **Edge init:** `sentry.edge.config.ts` (loaded via `src/instrumentation.ts` when `NEXT_RUNTIME === "edge"`)
- **Tunnel:** `src/app/api/tunnel/route.ts` — proxies browser Sentry envelopes through Next.js to bypass ad-blockers
- **DSN:** EU ingest — `https://89b64a7b24803bc2d81b6a2946a47f96@o4511432219688960.ingest.de.sentry.io/4511437825572944`
- **CSP:** `connect-src` must include `https://*.sentry.io https://*.de.sentry.io`

**Important:** The `tunnel` option (`"/api/tunnel"`) is valid **only in the browser** (client config). `sentry.server.config.ts` and `sentry.edge.config.ts` must **not** include a `tunnel` option — they connect directly to Sentry ingest.

---

## Content Security Policy (CSP)

Defined in `next.config.ts`. Applied to all routes via `headers()`.

| Directive     | Key allowed origins                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `script-src`  | `self`, `unsafe-inline`, `unsafe-eval`, GTM, GA, Amplitude, Clarity, Bing, GitBook                                                                                  |
| `connect-src` | `self`, signalor.ai API (all variants), Sanity CDN, Amplitude (incl. `sr-client-cfg` + `gs`), GA, Clarity, Bing, Sentry (`*.sentry.io` + `*.de.sentry.io`), GitBook |
| `frame-src`   | Dodo Payments checkout + app, GitBook guide                                                                                                                         |
| `img-src`     | `https:`, `data:`, `blob:` (broad, covers favicons/OG images)                                                                                                       |
| `font-src`    | `self`, Google Fonts (`fonts.gstatic.com`), `data:`                                                                                                                 |
| `style-src`   | `self`, `unsafe-inline`, Google Fonts                                                                                                                               |

Dev additionally allows: `http://localhost:*`, `ws://localhost:*`, `https://ipapi.co`, Vercel scripts, Clarity scripts.

---

## Branches & deployment

| Branch      | Environment             | URL                         |
| ----------- | ----------------------- | --------------------------- |
| `main`      | Production              | https://signalor.ai         |
| `staging`   | Staging                 | https://staging.signalor.ai |
| `tushar-05` | Personal feature branch | —                           |
| `arkit-01`  | Personal feature branch | —                           |
| `blog`      | Blog/Sanity work        | —                           |

**Workflow:** feature branch → `staging` → `main`

**CRITICAL: Never push to any branch without explicit user approval first.**

---

## Key components to know

### Dashboard cards (`src/components/dashboard/`)

- `ai-recommendation-card.tsx` — canonical TanStack Query data fetching pattern
- `geo-score-card.tsx` — main GEO score display
- `visibility-by-platform-card.tsx` — per-engine AI mention breakdown
- `competitors-card.tsx` — competitor benchmarking
- `weekly-performance-section.tsx` — weekly metrics summary
- `skeletons/` — loading skeleton variants for all major cards

### Analyzer panels (`src/components/analyzer/`)

- `site-backlink-marketplace-panel.tsx` — backlink provider directory (static curated list, no API)
- `site-backlink-opportunities-panel.tsx` — AI-discovered backlink opportunities
- `citation-authority-panel.tsx` — citation quality analysis
- `brand-visibility-tab.tsx` — AI mention tracking
- `ai-chat.tsx` — in-app AI assistant chat
- `world-presence-map.tsx` / `world-presence-map-libre.tsx` — geographic presence visualization
- `rank-tracker-panel.tsx` / `rank-tracker-shell.tsx` — rank tracking UI

### Landing (`src/components/landing/`)

- `LandingMegaNav.tsx` — main marketing navigation
- `landing-hero.tsx` — hero section
- `landing-pricing-teaser.tsx` — pricing preview
- `prompt-tracking-hero.tsx` + `prompt-tracking-features-grid.tsx` — prompt tracking feature pages

### Visibility components (`src/components/visibility/`)

- `platform-score-card.tsx` — per-engine score card
- `platform-bar-chart.tsx` — engine comparison chart
- `google-details-panel.tsx` / `reddit-details-panel.tsx` — platform-specific details

### Content optimisation (`src/components/optimisation/`)

- `suggestions-rail.tsx` — sidebar list of optimization suggestions
- `suggestion-card.tsx` — individual suggestion
- `element-editor.tsx` — inline HTML element editing
- `page-iframe.tsx` / `browser-chrome.tsx` — live page preview frame

### Navigation

- `src/components/navigation/app-sidebar.tsx` — main dashboard sidebar with all nav items

---

## Sanity CMS (blog)

- **Studio:** `/studio` route — always uses `next/dynamic({ ssr: false })`, never change this
- **Dataset:** `blogs`
- **Schemas:** `post`, `blockContent`, `category`, `author`
- **GROQ queries:** `src/sanity/lib/queries.ts`
- **Live preview:** `src/sanity/lib/live.ts`
- **Warning:** Author fields are intentionally removed from the schema — do **not** re-add `post.author` references in pages or feeds

---

## Pre-commit hooks

Husky + lint-staged run automatically on `git commit`:

- `eslint --fix` + `prettier --write` on staged `*.{ts,tsx,js,jsx,mjs,cjs}` files
- `prettier --write` on staged `*.{json,css,md}` files

Never use `--no-verify` to skip hooks.

---

## Common pitfalls

1. **Sanity Studio must use `next/dynamic({ ssr: false })`** — it references `window` at import time
2. **`Date.toLocaleString()` without a fixed locale** causes SSR hydration mismatch — always use `en-US` locale + UTC
3. **Vercel "Sensitive" env vars** are NOT inlined into `NEXT_PUBLIC_*` builds — uncheck "Sensitive" in Vercel dashboard for any `NEXT_PUBLIC_` variable
4. **`pg` and `better-sqlite3` are `serverExternalPackages`** — never import them in client components
5. **Turbopack dev vs webpack prod:** Dev server uses `pnpm dev:turbo`; production build always uses webpack via `pnpm build`
6. **Stale Next.js type cache:** After deleting a route file, stale TypeScript errors may remain — delete `.next/dev/types/app/<route>/` manually
7. **Amplitude CSP:** `sr-client-cfg.amplitude.com` and `gs.amplitude.com` must be in production `connect-src` (not inside `devConnectSrc`)
8. **Sentry EU DSN:** `*.sentry.io` matches only one subdomain level. The EU ingest `o4511432219688960.ingest.de.sentry.io` is 3 levels deep — always include `*.de.sentry.io` separately in CSP
9. **Sentry tunnel:** The `tunnel: "/api/tunnel"` option is valid only in `instrumentation-client.ts` (browser). Remove it from server and edge configs — they connect directly
10. **No middleware.ts:** There is no `middleware.ts` in this project. Route protection is handled client-side inside page components

---

## Before pushing — checklist

1. `pnpm typecheck` — must pass with 0 errors
2. `pnpm lint` — must pass
3. `pnpm build` — must compile successfully
4. Get **explicit user approval** before pushing to any branch
