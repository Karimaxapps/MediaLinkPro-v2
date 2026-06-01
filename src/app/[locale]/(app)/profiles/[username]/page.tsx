import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/features/profiles/server/actions";
import { PublicProfileHeader } from "./_components/PublicProfileHeader";
import { ProfileTabs } from "@/app/[locale]/(app)/profile/_components/ProfileTabs";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/seo";
import { Metadata } from "next";

interface PublicProfilePageProps {
    params: Promise<{
        username: string;
    }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        return {
            title: "Profile Not Found",
        };
    }

    const name = profile.full_name || profile.username;
    const location = [profile.city, profile.country].filter(Boolean).join(", ");
    const title = `${name}${profile.company ? ` · ${profile.company}` : ""} | MediaLinkPro`;
    const description =
        profile.bio ||
        profile.about ||
        [
            `${name} is a media professional on MediaLinkPro`,
            profile.company ? `at ${profile.company}` : null,
            location ? `based in ${location}` : null,
            profile.skills && profile.skills.length > 0
                ? `specializing in ${profile.skills.slice(0, 5).join(", ")}`
                : null,
        ]
            .filter(Boolean)
            .join(" ") + ".";

    const ogImage = profile.avatar_url
        ? [{ url: profile.avatar_url, width: 400, height: 400, alt: name }]
        : undefined;

    return {
        title,
        description,
        keywords: profile.skills && profile.skills.length > 0 ? profile.skills : undefined,
        alternates: { canonical: `/profiles/${profile.username}` },
        openGraph: {
            title,
            description,
            type: "profile",
            siteName: "MediaLinkPro",
            url: `/profiles/${profile.username}`,
            images: ogImage,
        },
        twitter: {
            card: profile.avatar_url ? "summary_large_image" : "summary",
            title,
            description,
            images: profile.avatar_url ? [profile.avatar_url] : undefined,
        },
    };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const sameAs = [
        profile.website,
        profile.linkedin_url,
        profile.x_url,
        profile.instagram_url,
        profile.facebook_url,
        profile.tiktok_url,
        profile.portfolio_url,
    ].filter(Boolean);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
            "@type": "Person",
            name: profile.full_name || profile.username,
            url: absoluteUrl(`/profiles/${profile.username}`),
            ...(profile.bio || profile.about ? { description: profile.bio || profile.about } : {}),
            ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
            ...(profile.company ? { worksFor: { "@type": "Organization", name: profile.company } } : {}),
            ...(profile.skills && profile.skills.length > 0 ? { knowsAbout: profile.skills } : {}),
            ...(profile.city || profile.country
                ? {
                      address: {
                          "@type": "PostalAddress",
                          ...(profile.city ? { addressLocality: profile.city } : {}),
                          ...(profile.country ? { addressCountry: profile.country } : {}),
                      },
                  }
                : {}),
            ...(sameAs.length > 0 ? { sameAs } : {}),
        },
    };

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto container px-4 py-8">
            <JsonLd data={jsonLd} />
            <PublicProfileHeader profile={profile} />
            <ProfileTabs profile={profile} />
        </div>
    );
}
