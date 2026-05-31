import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest, props: { params: Promise<{ productId: string }> }) {
  const { productId } = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Get User Agent and IP (best effort)
  const userAgent = request.headers.get("user-agent") || null;
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (ip && ip.includes(",")) ip = ip.split(",")[0].trim();

  // 2. Fetch Product Slug for Redirect
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single();

  if (fetchError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // 3. Track the scan, rate-limited per IP + product to avoid inflated counts.
  //    On limit hit we skip tracking but still redirect (this is a user-facing fallback).
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

  // 4. Redirect to product page with query param
  const baseUrl = new URL(request.url).origin;
  const redirectUrl = `${baseUrl}/products/${product.slug}?scanned=true`;
  return NextResponse.redirect(redirectUrl, { status: 302 });
}
