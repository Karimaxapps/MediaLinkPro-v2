import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/features/profiles/server/actions";
import { PublicProfileHeader } from "./_components/PublicProfileHeader";
import { ProfileTabs } from "@/app/[locale]/(app)/profile/_components/ProfileTabs";
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
    const description = profile.bio || `View ${name}'s profile on MediaLinkPro`;
    const ogImage = profile.avatar_url
        ? [{ url: profile.avatar_url, width: 400, height: 400, alt: name }]
        : undefined;

    return {
        title: `${name} | MediaLinkPro`,
        description,
        openGraph: {
            title: `${name} | MediaLinkPro`,
            description,
            type: "profile",
            siteName: "MediaLinkPro",
            images: ogImage,
        },
        twitter: {
            card: "summary",
            title: `${name} | MediaLinkPro`,
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

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto container px-4 py-8">
            <PublicProfileHeader profile={profile} />
            <ProfileTabs profile={profile} />
        </div>
    );
}
