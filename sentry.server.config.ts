import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://89b64a7b24803bc2d81b6a2946a47f96@o4511432219688960.ingest.de.sentry.io/4511437825572944",

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Server connects directly to Sentry — no tunnel needed (tunnel is browser-only for ad-blockers)
  includeLocalVariables: true,

  enableLogs: true,

  sendDefaultPii: false,
});
