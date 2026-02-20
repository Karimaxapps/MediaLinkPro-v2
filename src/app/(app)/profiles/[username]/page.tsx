import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/features/profiles/server/actions";
import { PublicProfileHeader } from "./_components/PublicProfileHeader";
import { ProfileTabs } from "@/app/(app)/profile/_components/ProfileTabs";
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

    return {
        title: `${profile.full_name || profile.username} | MediaLinkPro`,
        description: profile.bio || `View ${profile.full_name || profile.username}'s profile on MediaLinkPro`,
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
