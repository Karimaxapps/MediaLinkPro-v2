import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

// Fix TLS certificate verification failures on corporate networks (MITM proxy).
// The system trust-store flag only helps Turbopack; server-side fetch still uses
// Node's built-in TLS verifier which rejects re-signed certs.
//
// This globally disables TLS verification, so it's gated behind an EXPLICIT
// opt-in (ALLOW_INSECURE_TLS=true) in addition to dev mode. NEVER set
// ALLOW_INSECURE_TLS in production — it would make all outbound HTTPS insecure.
if (
  process.env.NODE_ENV === "development" &&
  process.env.ALLOW_INSECURE_TLS === "true"
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content-Security-Policy. Shipped as *Report-Only* first so it can't break the
// app: the browser reports violations without blocking. After confirming the
// reports are clean in production, rename the header below to
// "Content-Security-Policy" to enforce it. Inline script/style + 'unsafe-eval'
// are permitted because the App Router injects inline hydration scripts and the
// theme/JSON-LD use inline blocks; tighten with nonces when promoting.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://*.upstash.io https://accounts.google.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Force HTTPS for 2 years (ignored by browsers over http / on localhost).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: cspDirectives },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Only hosts we control are allowed through the Next.js image optimizer
    // (`/_next/image`). A wildcard here would turn the optimizer into an open
    // image proxy + CPU/bandwidth DoS amplifier (it fetches & re-encodes the
    // remote image server-side). User-submitted external images (e.g. free-text
    // blog cover URLs) are rendered via `@/components/ui/safe-image`, which
    // sets `unoptimized` for untrusted hosts so they bypass the optimizer.
    // Keep this list in sync with TRUSTED_IMAGE_HOSTS in safe-image.tsx.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ejuqifpwfrtiwyzeytax.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  // Fix TLS certificate verification in dev (corporate networks / self-signed certs)
  experimental: {
    turbopackUseSystemTlsCerts: true,
    // Default is 1 MB; raise to 8 MB so ad images / logos up to ~5 MB work end-to-end
    // (some headroom for multipart overhead).
    serverActions: {
      bodySizeLimit: "8mb",
      // Stable Server Action IDs across redeploys are configured via the
      // NEXT_SERVER_ACTIONS_ENCRYPTION_KEY env var (32-byte base64), which
      // Next.js reads automatically at build time. Without it, every
      // `next build` generates new IDs and stale browser tabs 500 with
      // "Failed to find Server Action <id>". Set it in Hostinger env vars.
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // Build-time options for source-map upload. These are only needed for
  // readable stack traces in Sentry; the build still succeeds without them.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print upload logs in CI.
  silent: !process.env.CI,

  // Upload a wider set of client bundles for better stack traces.
  widenClientFileUpload: true,

  // Tree-shake Sentry's debug logger out of the production bundle.
  disableLogger: true,
});
