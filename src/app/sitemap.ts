import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

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

    // Expert profiles share the profiles table but live on a separate route
    const expertPages: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
      url: `${SITE_URL}/experts/${profile.username}`,
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

    // Open job postings (route: /jobs/[orgSlug]/[slug])
    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, updated_at, organizations(slug)")
      .eq("status", "open")
      .order("updated_at", { ascending: false })
      .limit(500);

    const jobPages: MetadataRoute.Sitemap = (jobs ?? [])
      .map((job) => {
        const org = job.organizations as { slug?: string } | null;
        if (!org?.slug || !job.slug) return null;
        return {
          url: `${SITE_URL}/jobs/${org.slug}/${job.slug}`,
          lastModified: new Date(job.updated_at),
          changeFrequency: "daily" as const,
          priority: 0.6,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    // Published public events
    const { data: events } = await supabase
      .from("events")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(500);

    const eventPages: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Published AI tools
    const { data: aiTools } = await supabase
      .from("ai_tools")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(500);

    const aiToolPages: MetadataRoute.Sitemap = (aiTools ?? []).map((tool) => ({
      url: `${SITE_URL}/ai-tools/${tool.slug}`,
      lastModified: new Date(tool.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...productPages,
      ...profilePages,
      ...expertPages,
      ...orgPages,
      ...blogPages,
      ...jobPages,
      ...eventPages,
      ...aiToolPages,
    ];
  } catch {
    // If DB is unavailable, return static pages only
    return staticPages;
  }
}
