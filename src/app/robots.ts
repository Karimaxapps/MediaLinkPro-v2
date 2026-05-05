import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medialinkpro.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/dashboard/", "/profile/", "/settings/", "/messages/", "/bookmarks/", "/onboarding/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
