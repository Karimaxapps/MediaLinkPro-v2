import { createAdminClient } from "@/lib/supabase/server";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Durable, multi-instance rate limiter. Returns `true` when the call is allowed
 * (under the limit) and `false` when it should be rejected.
 *
 * Backed by Upstash Redis when configured (`UPSTASH_REDIS_REST_URL` +
 * `UPSTASH_REDIS_REST_TOKEN`), otherwise by a Postgres counter table via the
 * `rate_limit_hit` RPC. Either way the counter is shared across every server
 * instance — unlike the old per-process in-memory Maps, which reset per worker
 * and leaked memory.
 *
 * Fails OPEN (allows the request) if the backing store is unreachable, so a
 * limiter outage can't take the endpoint down.
 *
 * @param key        Caller-namespaced bucket, e.g. `autofill:1.2.3.4`.
 * @param max        Max requests permitted within the window.
 * @param windowMs   Window length in milliseconds.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      return await upstashHit(key, max, windowSeconds);
    }
    return await postgresHit(key, max, windowSeconds);
  } catch (err) {
    console.error("[rate-limit] limiter unavailable, failing open:", err);
    return true;
  }
}

async function upstashCmd(args: (string | number)[]): Promise<unknown> {
  const path = args.map((a) => encodeURIComponent(String(a))).join("/");
  const res = await fetch(`${UPSTASH_URL}/${path}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

async function upstashHit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const k = `rl:${key}`;
  const count = Number(await upstashCmd(["INCR", k]));
  if (count === 1) {
    // First hit in this window — attach the TTL so the bucket auto-resets.
    await upstashCmd(["EXPIRE", k, windowSeconds]);
  }
  return count <= max;
}

async function postgresHit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("rate_limit_hit" as never, {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  } as never);
  if (error) throw new Error(error.message);
  return data === true;
}
