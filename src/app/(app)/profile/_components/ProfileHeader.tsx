"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pencil, Users, Briefcase, Building2, Image as ImageIcon, Loader2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileEditSheet } from "@/components/profile/ProfileEditSheet";
import { Database } from "@/types/supabase";
import { useProfileUpload } from "@/hooks/use-profile-upload";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileHeaderProps {
    profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const { uploadImage, isUploading } = useProfileUpload({
        currentUserId: profile.id,
    });

    const primaryRole = profile.job_function || "Role not set";
    // Department is not in current schema
    const department = null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file, type);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 group/header">
            {/* Cover Image */}
            <div className="h-48 w-full bg-gradient-to-r from-[#0B0F14] via-[#1A1F26] to-[#0B0F14] relative group/cover [mask-image:linear-gradient(to_bottom,black_50%,transparent)]">
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

                {/* Cover Edit Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                    <label htmlFor="cover-upload" className="cursor-pointer">
                        <div className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2 px-3">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs font-medium">Change Cover</span>
                        </div>
                        <input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'cover')}
                            disabled={isUploading}
                        />
                    </label>
                </div>
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

                        {/* Avatar Edit Button - Persistent */}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-2 right-2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full cursor-pointer shadow-lg border-2 border-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 z-10 flex items-center justify-center"
                            title="Change profile photo"
                        >
                            <Camera className="h-4 w-4" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'avatar')}
                                disabled={isUploading}
                            />
                        </label>

                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-20 pointer-events-none">
                                <Loader2 className="h-8 w-8 text-[#C6A85E] animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2 mb-2">
                        <div className="flex flex-wrap items-center gap-3">
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
                            </div>

                            {department && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {department}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-400">
                                <Building2 className="h-4 w-4 text-[#C6A85E]" />
                                <span className="text-sm font-medium">
                                    {profile.company || "Company not set"}
                                </span>
                            </div>

                            {/* Display headline if valid */}

                        </div>


                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-2">
                        <ProfileEditSheet profile={profile}>
                            <Button variant="secondary" size="icon" className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-full w-10 h-10">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </ProfileEditSheet>
                    </div>
                </div>
            </div>
        </div>
    );
}
