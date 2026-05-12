import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Fix TLS certificate verification failures on corporate networks (MITM proxy).
// The system trust-store flag only helps Turbopack; server-side fetch still uses
// Node's built-in TLS verifier which rejects re-signed certs.  Safe for local dev.
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ejuqifpwfrtiwyzeytax.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
  // Fix TLS certificate verification in dev (corporate networks / self-signed certs)
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default withNextIntl(nextConfig);
