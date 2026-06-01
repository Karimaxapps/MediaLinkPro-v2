import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Authenticated / non-public areas — kept out of all crawlers.
const PRIVATE_PATHS = [
    "/api/",
    "/dashboard/",
    "/profile/",
    "/settings/",
    "/messages/",
    "/bookmarks/",
    "/onboarding/",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Default: all crawlers may index public content. The /api/public/ feeds are
            // explicitly allowed (a longer-match Allow overrides the broad /api/ Disallow).
            {
                userAgent: "*",
                allow: ["/", "/api/public/"],
                disallow: PRIVATE_PATHS,
            },
            // Answer engine — allowed on public content (cites and links back to the site).
            {
                userAgent: "PerplexityBot",
                allow: ["/", "/api/public/"],
                disallow: PRIVATE_PATHS,
            },
            // Training crawlers — blocked entirely to keep content out of model training.
            // ClaudeBot is Anthropic's current training crawler (anthropic-ai is the legacy token);
            // Google-Extended blocks Gemini/Vertex training without affecting Google Search indexing.
            {
                userAgent: ["GPTBot", "anthropic-ai", "ClaudeBot", "CCBot", "Google-Extended"],
                disallow: "/",
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
