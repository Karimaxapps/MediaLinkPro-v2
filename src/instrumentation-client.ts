// Sentry initialization for the browser. Next.js loads this automatically.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  // Performance tracing for page loads / navigations.
  tracesSampleRate: 0.1,

  debug: false,
});

// Required for Sentry to instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
