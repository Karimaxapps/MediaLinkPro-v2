import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl, absoluteImage } from "@/lib/seo";

// Revalidate the cached response at most once per hour.
export const revalidate = 3600;

const CACHE_HEADER = "public, s-maxage=3600, stale-while-revalidate=86400";

/**
 * Read-only, cacheable feed of published blog posts for answer engines.
 * Exposes only public-facing fields — no draft content, author IDs, or status.
 */
export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, cover_image_url, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(500);

    if (error) {
        return NextResponse.json({ error: "Unable to load blog posts" }, { status: 500 });
    }

    const items = (data ?? []).map((post) => ({
        title: post.title,
        description: post.excerpt || null,
        image: absoluteImage(post.cover_image_url),
        url: absoluteUrl(`/blog/${post.slug}`),
    }));

    return NextResponse.json(
        { type: "blog", count: items.length, items },
        { headers: { "Cache-Control": CACHE_HEADER } },
    );
}
