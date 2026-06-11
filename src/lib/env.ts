import { z } from "zod";

// Fail fast if auth-bypass shortcuts are left enabled in production. These flags
// disable the auth gate entirely and must only ever be used in local dev.
if (process.env.NODE_ENV === "production") {
  if (process.env.DEV_BYPASS_AUTH === "true") {
    throw new Error("DEV_BYPASS_AUTH must not be enabled in production.");
  }
  if (process.env.ALLOW_INSECURE_TLS === "true") {
    throw new Error("ALLOW_INSECURE_TLS must not be enabled in production.");
  }
}

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Optional AI provider config for the AI Setup Builder. Wire these in once a
  // provider is chosen; the feature reports a clear error until then.
  AI_PROVIDER: z.enum(["anthropic", "openai", "gemini"]).optional(),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).optional(),
  // Optional Upstash Redis for the durable rate limiter. When unset, the
  // limiter falls back to the Postgres `rate_limit_hit` RPC.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  // Salt for hashing scan IPs at rest (see /api/scan). Strongly recommended.
  SCAN_IP_SALT: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  SCAN_IP_SALT: process.env.SCAN_IP_SALT,
});
