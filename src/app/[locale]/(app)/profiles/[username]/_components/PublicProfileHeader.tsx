

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Briefcase, Building2, Globe, MapPin } from "lucide-react";
import { Database } from "@/types/supabase";

type Profile = Database['public']['Tables']['profiles']['Row'];

import { ConnectButton } from "@/features/connections/components/connect-button";
import { getConnectionStatus, getConnectionsCount, ConnectionStatusData } from "@/features/connections/server/actions";
import { ContactButton } from "@/features/messaging/components/ContactButton";

interface PublicProfileHeaderProps {
    profile: Profile;
}

export async function PublicProfileHeader({ profile }: PublicProfileHeaderProps) {
    const primaryRole = profile.job_function || "Role not set";
    // Department is not in current schema
    const department = null;
    const connectionStatus = await getConnectionStatus(profile.id);
    const connectionCount = await getConnectionsCount(profile.id);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 group/header">
            {/* Cover Image */}
            <div className="h-48 w-full bg-gradient-to-r from-[#0B0F14] via-[#1A1F26] to-[#0B0F14] relative [mask-image:linear-gradient(to_bottom,black_50%,transparent)]">
                {profile.cover_url ? (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                )}
            </div>

            <div className="px-8 pb-8">
                <div className="relative flex flex-col md:flex-row md:items-end -mt-16 gap-6">
                    {/* Avatar */}
                    <div className="relative group/avatar">
                        <Avatar className="h-40 w-40 border-4 border-[#0B0F14] rounded-2xl shadow-2xl bg-muted flex items-center justify-center relative overflow-hidden">
                            <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                            <AvatarFallback className="bg-secondary text-4xl rounded-2xl flex items-center justify-center w-full h-full">
                                <Users className="h-20 w-20 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2 mb-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                {profile.full_name || "User Name"}
                                <CheckCircle2 className="h-5 w-5 text-[#C6A85E] fill-black" />
                            </h1>
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2 text-[#C6A85E]">
                                <Briefcase className="h-4 w-4" />
                                <span className="text-base font-medium">
                                    {primaryRole}
                                </span>
                                <span className="text-muted-foreground">@</span>
                                <span className="text-base font-medium text-gray-300">
                                    {profile.company || "Company not set"}
                                </span>
                            </div>

                            {department && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {department}
                                    </span>
                                </div>
                            )}

                            {profile.country && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {profile.country}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 mb-2 md:pb-2 gap-2">
                        <ContactButton targetProfileId={profile.id} variant="secondary" />
                        <ConnectButton
                            targetUserId={profile.id}
                            initialStatus={connectionStatus.status}
                            requestId={connectionStatus.requestId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
