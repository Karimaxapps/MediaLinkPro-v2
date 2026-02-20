import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Calendar, MapPin, Mail, Globe, Link as LinkIcon, Linkedin, Youtube, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { formatDate, formatNumber } from "@/lib/formatters";

type Profile = Database['public']['Tables']['profiles']['Row'];

import { getConnectionsCount } from "@/features/connections/server/actions";

interface OverviewTabContentProps {
    profile: Profile;
}

export async function OverviewTabContent({ profile }: OverviewTabContentProps) {
    const connectionCount = await getConnectionsCount(profile.id);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: About */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/5 border-white/10 h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#C6A85E]/10 rounded-lg">
                                <FileText className="h-4 w-4 text-[#C6A85E]" />
                            </div>
                            <CardTitle className="text-lg text-white font-bold">Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 leading-relaxed">
                            {profile.about || profile.bio || "Passionate media professional with over 10 years of experience in high-end production and creative storytelling. I've worked with global broadcasters and independent studios to bring compelling visual narratives to life."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Profile Information */}
            <div className="lg:col-span-1">
                <Card className="bg-white/5 border-white/10 h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#C6A85E]/10 rounded-lg">
                                <Users className="h-4 w-4 text-[#C6A85E]" />
                            </div>
                            <CardTitle className="text-lg text-white font-bold">Profile Info</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3 pb-4 border-b border-white/5">
                            <div className="text-gray-300 font-medium flex items-center gap-2 pb-1">
                                <MapPin className="h-4 w-4 text-[#C6A85E]" />
                                {profile.country || "Country not set"}
                            </div>
                            <div className="text-gray-300 font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#C6A85E]" />
                                <span className="text-white font-bold">{formatNumber(connectionCount)}</span> Connections
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Calendar className="h-4 w-4 text-[#C6A85E]" />
                                <span>Joined {formatDate(profile.created_at)}</span>
                            </div>
                            {profile.city && (
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <MapPin className="h-4 w-4 text-[#C6A85E]" />
                                    <span>{profile.city}</span>
                                </div>
                            )}

                            {profile.portfolio_url && (
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <LinkIcon className="h-4 w-4 text-[#C6A85E]" />
                                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate max-w-[200px]">
                                        Portfolio
                                    </a>
                                </div>
                            )}
                            {profile.contact_email_public && (
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Mail className="h-4 w-4 text-[#C6A85E]" />
                                    <span className="truncate">{profile.contact_email_public}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Globe className="h-4 w-4 text-[#C6A85E]" />
                                {profile.website ? (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate max-w-[200px]">
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                ) : (
                                    <span className="text-gray-500 italic">Website not set</span>
                                )}
                            </div>
                        </div>

                        {/* Social Accounts */}
                        <div className="pt-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Social Accounts</p>
                            <div className="flex gap-2 flex-wrap">
                                {profile.linkedin_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-[#0077b5] hover:text-[#0077b5]">
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.youtube_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-[#FF0000] hover:text-[#FF0000]">
                                        <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer">
                                            <Youtube className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.instagram_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-[#E4405F] hover:text-[#E4405F]">
                                        <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.x_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-white hover:text-white">
                                        <a href={profile.x_url} target="_blank" rel="noopener noreferrer">
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.facebook_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-[#1877F2] hover:text-[#1877F2]">
                                        <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                {profile.tiktok_url && (
                                    <Button asChild size="icon" variant="secondary" className="bg-white/5 hover:bg-white/10 h-8 w-8 rounded-full border border-white/10 text-white hover:text-white group">
                                        <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4 fill-current group-hover:fill-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                            </svg>
                                        </a>
                                    </Button>
                                )}
                                {!profile.linkedin_url && !profile.youtube_url && !profile.instagram_url && !profile.x_url && !profile.facebook_url && !profile.tiktok_url && (
                                    <span className="text-xs text-gray-500 italic">No social accounts linked</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}



import { cn } from "@/lib/utils";

export function ProfileTabs({ profile }: { profile: Profile }) {
    return (
        <div className="w-full">
            <OverviewTabContent profile={profile} />
        </div>
    );
}
