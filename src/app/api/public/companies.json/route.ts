import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, absoluteImage } from "@/lib/seo";

// Revalidate the cached response at most once per hour.
export const revalidate = 3600;

const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

/**
 * Read-only, cacheable feed of public companies / organizations for answer engines.
 * Exposes only public-facing fields — no internal IDs, contact details, or status.
 */
export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("organizations")
        .select("slug, name, tagline, description, logo_url, updated_at")
        .order("updated_at", { ascending: false })
        .limit(500);

    if (error) {
        return NextResponse.json({ error: "Unable to load companies" }, { status: 500 });
    }

    const items = (data ?? []).map((o) => ({
        title: o.name,
        description: o.tagline || o.description || null,
        image: absoluteImage(o.logo_url),
        url: absoluteUrl(`/companies/${o.slug}`),
    }));

    return NextResponse.json(
        { type: "companies", count: items.length, items },
        { headers: { "Cache-Control": CACHE_HEADER } },
    );
}
