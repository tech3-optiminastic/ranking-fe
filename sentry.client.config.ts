// Client-side Sentry is initialized via src/instrumentation-client.ts
// (Next.js 15 instrumentation hook). This file must exist to satisfy
// the @sentry/nextjs webpack plugin but intentionally does not call
// Sentry.init() to prevent duplicate Session Replay instances.
