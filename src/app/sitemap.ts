import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://medialinkpro.net";

/** Build hreflang alternates for a canonical path (e.g. "/" or "/pricing"). */
function localeAlternates(path: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of routing.locales) {
    const url =
      locale === routing.defaultLocale
        ? `${SITE_URL}${path}`
        : `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
    result[locale] = url;
  }
  // x-default points to the English (default) URL
  result["x-default"] = `${SITE_URL}${path}`;
  return result;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with locale alternates
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: localeAlternates("/") },
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/marketplace/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: { languages: localeAlternates("/marketplace/products") },
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: localeAlternates("/pricing") },
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
      alternates: { languages: localeAlternates("/blog") },
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
      url: `${SITE_URL}/products/${product.slug}`,
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
      url: `${SITE_URL}/profiles/${profile.username}`,
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
      url: `${SITE_URL}/companies/${org.slug}`,
      lastModified: new Date(org.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500);

    const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...profilePages, ...orgPages, ...blogPages];
  } catch {
    // If DB is unavailable, return static pages only
    return staticPages;
  }
}
