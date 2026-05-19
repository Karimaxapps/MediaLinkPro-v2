import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf8"));

// Fix TLS certificate verification failures on corporate networks (MITM proxy).
// The system trust-store flag only helps Turbopack; server-side fetch still uses
// Node's built-in TLS verifier which rejects re-signed certs.  Safe for local dev.
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
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

export default withNextIntl(nextConfig);
