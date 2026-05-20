// Sentry initialization for the Node.js server runtime.
// Loaded from src/instrumentation.ts → register().
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send events in production. In dev the SDK stays inert so it never
  // fights the corporate-proxy TLS workaround in next.config.ts.
  enabled: process.env.NODE_ENV === "production",

  // Capture 10% of transactions for performance tracing. Tune as traffic grows.
  tracesSampleRate: 0.1,

  // Set to true temporarily if Sentry itself seems misconfigured.
  debug: false,
});
