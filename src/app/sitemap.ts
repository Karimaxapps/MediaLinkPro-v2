import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medialinkpro.com";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/auth`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/marketplace/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ];

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Fetch public products
        const { data: products } = await supabase
            .from("products")
            .select("slug, updated_at")
            .eq("is_public", true)
            .order("updated_at", { ascending: false })
            .limit(500);

        const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: new Date(product.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        // Fetch public profiles
        const { data: profiles } = await supabase
            .from("profiles")
            .select("username, updated_at")
            .not("username", "is", null)
            .order("updated_at", { ascending: false })
            .limit(500);

        const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
            url: `${baseUrl}/profiles/${profile.username}`,
            lastModified: new Date(profile.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));

        // Fetch organizations
        const { data: organizations } = await supabase
            .from("organizations")
            .select("slug, updated_at")
            .order("updated_at", { ascending: false })
            .limit(500);

        const orgPages: MetadataRoute.Sitemap = (organizations ?? []).map((org) => ({
            url: `${baseUrl}/companies/${org.slug}`,
            lastModified: new Date(org.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        return [...staticPages, ...productPages, ...profilePages, ...orgPages];
    } catch {
        // If DB is unavailable, return static pages only
        return staticPages;
    }
}
