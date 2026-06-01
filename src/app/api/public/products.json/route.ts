import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, absoluteImage } from "@/lib/seo";

// Revalidate the cached response at most once per hour.
export const revalidate = 3600;

const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

/**
 * Read-only, cacheable feed of public products for answer engines / external consumers.
 * Exposes only public-facing fields — no internal IDs, pricing, ownership, or status.
 */
export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("products")
        .select("slug, name, short_description, description, logo_url, gallery_urls, updated_at")
        .eq("is_public", true)
        .order("updated_at", { ascending: false })
        .limit(500);

    if (error) {
        return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
    }

    const items = (data ?? []).map((p) => ({
        title: p.name,
        description: p.short_description || p.description || null,
        image: absoluteImage(p.logo_url) || absoluteImage(p.gallery_urls?.[0]) || null,
        url: absoluteUrl(`/products/${p.slug}`),
    }));

    return NextResponse.json(
        { type: "products", count: items.length, items },
        { headers: { "Cache-Control": CACHE_HEADER } },
    );
}
