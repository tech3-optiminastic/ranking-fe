import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://bc5e413c062ba0108be336fac5267c2a@o4511432219688960.ingest.de.sentry.io/4511432379400272",

  // Sample 100% of traces in dev, 10% in production to control costs.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Replay 10% of sessions, 100% of sessions with errors.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],

  enableLogs: true,

  // Don't send PII — we handle identity separately via setUser().
  sendDefaultPii: false,

  // Ignore noise from browser extensions and third-party scripts.
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    /^Network Error$/,
    /^Load failed$/,
    /^Failed to fetch$/,
    // Sentry browser extension internal error — not from app code
    /has no method 'updateFrom'/,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
