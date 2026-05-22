import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://bc5e413c062ba0108be336fac5267c2a@o4511432219688960.ingest.de.sentry.io/4511432379400272",

  // Sample 100% of traces in dev, 10% in production to control costs.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  enableLogs: true,

  // Don't send PII — we handle identity separately via setUser().
  sendDefaultPii: false,
});
