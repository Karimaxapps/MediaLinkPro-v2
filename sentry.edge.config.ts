// Sentry initialization for the Edge runtime (middleware, edge routes).
// Loaded from src/instrumentation.ts → register().
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  debug: false,
});
