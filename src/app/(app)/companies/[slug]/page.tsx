import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Mail, Phone, ExternalLink, Linkedin, Facebook, Youtube, Twitter, Instagram } from "lucide-react";
import { CardListItem } from "@/components/ui/card-list-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CompanyEditForm } from "@/features/organizations/components/company-edit-form";

import { ProductList } from "@/features/products/components/product-list";


export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !org) {
        notFound();
    }


    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is owner or admin of this org
    let canEdit = false;
    if (user) {
        const { data: membership } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', org.id)
            .eq('user_id', user.id)
            .single();

        if (membership && ['owner', 'admin'].includes(membership.role)) {
            canEdit = true;
        }
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                {/* Visual Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A85E]/10 rounded-full blur-3xl -z-10" />

                <Avatar className="h-24 w-24 border-2 border-[#C6A85E] rounded-xl">
                    <AvatarImage src={org.logo_url || ""} alt={org.name} />
                    <AvatarFallback className="bg-[#C6A85E] text-black text-2xl font-bold rounded-xl">
                        {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold text-white">{org.name}</h1>
                    {org.tagline && (
                        <p className="text-gray-400 max-w-2xl text-lg font-medium">
                            {org.tagline}
                        </p>
                    )}
                    <p className="text-gray-500 max-w-2xl text-sm">
                        {org.main_activity}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <Badge variant="secondary" className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">{org.type || "Company"}</Badge>
                    </div>


                </div>

                {canEdit && (
                    <div className="absolute bottom-4 right-4 z-10">
                        <CompanyEditForm org={org} currentUserId={user!.id} />
                    </div>
                )}
            </div>

            {/* Actions Bar */}


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-white/5 border border-white/10 w-full justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Overview</TabsTrigger>
                            <TabsTrigger value="products" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Products</TabsTrigger>
                            <TabsTrigger value="community" className="text-white data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Community</TabsTrigger>

                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            <Card className="bg-white/5 border-white/10 text-white">
                                <CardHeader>
                                    <CardTitle>About Us</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300 space-y-4 whitespace-pre-wrap">
                                    {org.description || "No description provided."}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="products" className="mt-6 space-y-4">
                            <ProductList orgId={org.id} isOwner={canEdit} />
                        </TabsContent>

                        <TabsContent value="community" className="mt-6">
                            <EmptyState
                                icon={Globe}
                                title="Community Hub"
                                description="Join the discussion and view updates."
                            />
                        </TabsContent>


                    </Tabs>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Company Information Card */}
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-sm">
                            {/* 1. Company Type */}
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Type</h4>
                                <p className="font-medium text-white">{org.type}</p>
                            </div>

                            {/* 2. Company Activity */}
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Activity</h4>
                                <p className="font-medium text-white">{org.main_activity}</p>
                            </div>

                            {/* 3. Founded */}
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Founded</h4>
                                <p className="font-medium text-white">{format(new Date(org.created_at), 'yyyy')}</p>
                            </div>

                            {/* 4. Headquarters & Address */}
                            {(org.country || org.address) && (
                                <div className="space-y-4">
                                    {org.country && (
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Headquarters</h4>
                                            <p className="font-medium text-white">{org.country}</p>
                                        </div>
                                    )}
                                    {org.address && (
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</h4>
                                            <p className="font-medium text-white break-words">{org.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Connect & Inquire Card */}
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Connect & Inquire</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {/* Official Website */}
                            {org.website && (
                                <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors">
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#C6A85E]/20 text-[#C6A85E] transition-colors">
                                        <Globe className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-[#C6A85E] group-hover:text-[#B5964A] transition-colors">Official Website</span>
                                </a>
                            )}

                            {/* Public Email */}
                            {org.contact_email && (
                                <a href={`mailto:${org.contact_email}`} className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors">
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#C6A85E]/20 text-[#C6A85E] transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium break-all">{org.contact_email}</span>
                                </a>
                            )}

                            {/* Public Phone */}
                            {org.phone && (
                                <a href={`tel:${org.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors">
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[#C6A85E]/20 text-[#C6A85E] transition-colors">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{org.phone}</span>
                                </a>
                            )}

                            {/* Social Accounts */}
                            <div className="pt-4 mt-2 border-t border-white/10">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Social Profiles</h4>
                                <div className="flex flex-wrap gap-2">
                                    {org.linkedin_url && (
                                        <a href={org.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#0A66C2] transition-colors">
                                            <Linkedin className="h-4 w-4" />
                                        </a>
                                    )}
                                    {org.x_url && (
                                        <a href={org.x_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    )}
                                    {org.facebook_url && (
                                        <a href={org.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#1877F2] transition-colors">
                                            <Facebook className="h-4 w-4" />
                                        </a>
                                    )}
                                    {org.instagram_url && (
                                        <a href={org.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#E4405F] transition-colors">
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    )}
                                    {org.youtube_url && (
                                        <a href={org.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#FF0000] transition-colors">
                                            <Youtube className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Members Card */}
                    <CompanyMembersCard orgId={org.id} />
                </div>
            </div>
        </div >

    );
}

async function CompanyMembersCard({ orgId }: { orgId: string }) {
    const supabase = await createClient(await cookies());

    const { data: members } = await supabase
        .from('organization_members')
        .select(`
            role,
            profiles (
                id,
                full_name,
                avatar_url,
                job_title
            )
        `)
        .eq('organization_id', orgId);

    if (!members || members.length === 0) return null;

    // Type guard/assertion for joined data
    type MemberWithProfile = {
        role: "owner" | "admin" | "editor" | "viewer";
        profiles: {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
            job_title: string | null;
        } | null;
    };

    const safeMembers = members as unknown as MemberWithProfile[];

    const owner = safeMembers.find(m => m.role === 'owner');
    const otherMembers = safeMembers.filter(m => m.role !== 'owner');

    if (!owner && otherMembers.length === 0) return null;

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Company Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Admin/Owner */}
                {owner && owner.profiles && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Page Admin</h4>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                            <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarImage src={owner.profiles.avatar_url || ""} />
                                <AvatarFallback className="bg-[#C6A85E] text-black font-bold">
                                    {owner.profiles.full_name?.substring(0, 2).toUpperCase() || "AD"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-white text-sm">{owner.profiles.full_name || "Unknown User"}</p>
                                <Badge variant="secondary" className="mt-1 text-[10px] h-5 bg-[#C6A85E]/20 text-[#C6A85E] hover:bg-[#C6A85E]/30 border-none">
                                    Owner
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Members List */}
                {otherMembers.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Members</h4>
                        <div className="space-y-2">
                            {otherMembers.map((member) => (
                                member.profiles && (
                                    <div key={member.profiles.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarImage src={member.profiles.avatar_url || ""} />
                                            <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
                                                {member.profiles.full_name?.substring(0, 2).toUpperCase() || "TM"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-white text-sm truncate">{member.profiles.full_name}</p>
                                            {member.profiles.job_title && (
                                                <p className="text-xs text-gray-500 truncate">{member.profiles.job_title}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
