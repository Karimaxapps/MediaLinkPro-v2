import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Module-level rate limit store: "ip:productId" -> [timestamps]
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return true;
}

/**
 * Shared scan tracking: validates the product exists, then (rate-limited per
 * IP + product) increments the aggregate counter and logs a scan row.
 * Returns the product's slug for callers that redirect, or null if not found.
 * Tracking write failures are swallowed — they must never block the caller.
 */
async function trackScan(
  supabase: SupabaseClient,
  request: NextRequest,
  productId: string
): Promise<{ slug: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userAgent = request.headers.get("user-agent") || null;
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  if (fetchError || !product) return null;

  // Rate-limit per IP + product so repeat opens don't inflate counts.
  if (checkRateLimit(`${ip ?? "unknown"}:${productId}`)) {
    try {
      const { error: rpcError } = await supabase.rpc("increment_product_qr_scans", {
        product_id: productId,
      });
      if (rpcError) console.error("RPC Error:", rpcError);

      const { error: logError } = await supabase.from("product_scans").insert({
        product_id: productId,
        scanner_id: user?.id || null, // Null for anonymous
        ip_address: ip,
        user_agent: userAgent,
      });
      if (logError) console.error("Failed to log scan:", logError);
    } catch (e) {
      console.error("Unexpected error logging scan:", e);
    }
  }

  return { slug: product.slug };
}

/**
 * POST — called by the Flutter app on deep-link open. Tracks the scan and
 * returns 204 No Content (no redirect; the app already has the destination).
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ productId: string }> }
) {
  const { productId } = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const product = await trackScan(supabase, request, productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * GET — back-compat alias for old printed QR codes that point at this API
 * route. Tracks the scan and redirects to the product page.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ productId: string }> }) {
  const { productId } = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const product = await trackScan(supabase, request, productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const baseUrl = new URL(request.url).origin;
  const redirectUrl = `${baseUrl}/products/${product.slug}?scanned=true`;
  return NextResponse.redirect(redirectUrl);
}
