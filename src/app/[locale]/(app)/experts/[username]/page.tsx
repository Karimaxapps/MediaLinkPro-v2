import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Linkedin, Twitter, Github, MapPin, Link as LinkIcon, User, Pencil, Building2, Instagram, Facebook } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProfileEditSheet } from "@/components/profile/ProfileEditSheet";
import { getExpertServices, getExpertReviews, getExpertReviewStats } from "@/features/profiles/server/expert-actions";
import { ExpertServicesSection } from "@/features/profiles/components/expert-services-section";
import { ExpertReviewsSection } from "@/features/profiles/components/expert-reviews-section";
import {
    getProfileExperiences,
    getProfileEducation,
    getProfilePortfolio,
} from "@/features/profiles/server/profile-details-actions";
import { computeProfileCompletion } from "@/features/profiles/completion";
import {
    ExperienceSection,
    EducationSection,
    PortfolioSection,
    ProfileCompletionCard,
} from "@/features/profiles/components/profile-sections";

async function getProfileByUsername(username: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // exact match for username
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !profile) return null;
    return profile;
}

async function getCurrentUserId() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export default async function ExpertProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const currentUserId = await getCurrentUserId();
    const isOwner = currentUserId === profile.id;

    const [services, reviews, reviewStats, experiences, education, portfolio] = await Promise.all([
        getExpertServices(profile.id),
        getExpertReviews(profile.id),
        getExpertReviewStats(profile.id),
        getProfileExperiences(profile.id),
        getProfileEducation(profile.id),
        getProfilePortfolio(profile.id),
    ]);

    const completion = computeProfileCompletion(profile, {
        experiences: experiences.length,
        education: education.length,
        portfolio: portfolio.length,
    });

    return (
        <div className="container max-w-5xl py-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <Avatar className="w-32 h-32 border-4 border-[#C6A85E]/20 bg-muted flex items-center justify-center">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || username} />
                    <AvatarFallback className="text-4xl bg-[#C6A85E] text-black flex items-center justify-center w-full h-full">
                        <User className="h-16 w-16" />
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">{profile.full_name}</h1>
                            <p className="text-xl text-[#C6A85E] font-medium mt-1">@{profile.username}</p>

                            {profile.company && (
                                <div className="flex items-center text-gray-400 mt-1">
                                    <Building2 className="w-4 h-4 mr-1.5 text-[#C6A85E]" />
                                    <span className="text-base">{profile.company}</span>
                                </div>
                            )}
                        </div>
                        {isOwner && (
                            <ProfileEditSheet profile={profile}>
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
                                    <Pencil className="w-5 h-5" />
                                </Button>
                            </ProfileEditSheet>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-[#C6A85E] transition-colors">
                                <LinkIcon className="w-4 h-4 mr-1.5" />
                                {new URL(profile.website).hostname}
                            </a>
                        )}
                        {(profile.city || profile.country) && (
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                {[profile.city, profile.country].filter(Boolean).join(', ')}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        {profile.linkedin_url && (
                            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#0077b5] hover:text-white transition-all text-gray-400">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        )}
                        {profile.x_url && (
                            <a href={profile.x_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#1DA1F2] hover:text-white transition-all text-gray-400">
                                <Twitter className="w-5 h-5" />
                            </a>
                        )}
                        {profile.instagram_url && (
                            <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#E1306C] hover:text-white transition-all text-gray-400">
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {profile.facebook_url && (
                            <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#1877F2] hover:text-white transition-all text-gray-400">
                                <Facebook className="w-5 h-5" />
                            </a>
                        )}
                        {profile.tiktok_url && (
                            <a href={profile.tiktok_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all text-gray-400 group">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-5 h-5 fill-current group-hover:fill-black"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                </svg>
                            </a>
                        )}

                        {profile.portfolio_url && (
                            <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[#C6A85E] hover:text-black transition-all text-gray-400">
                                <Globe className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">


                    {!isOwner && (
                        <Button className="w-full bg-[#C6A85E] text-black hover:bg-[#B5964A]" size="lg">
                            Contact Expert
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-8">
                    {isOwner && <ProfileCompletionCard score={completion.score} fields={completion.fields} />}

                    {profile.bio && (
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3">Bio</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                        </section>
                    )}

                    {profile.about && profile.about !== profile.bio && (
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3">Professional Background</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
                        </section>
                    )}

                    {profile.skills && profile.skills.length > 0 && (
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    <ExperienceSection items={experiences} isOwner={isOwner} />
                    <EducationSection items={education} isOwner={isOwner} />
                    <PortfolioSection items={portfolio} isOwner={isOwner} />
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                    <ExpertServicesSection
                        initialServices={services}
                        hourlyRate={profile.hourly_rate ?? null}
                        isOwner={isOwner}
                    />
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                    <ExpertReviewsSection
                        expertId={profile.id}
                        initialReviews={reviews}
                        averageRating={reviewStats.average}
                        reviewCount={reviewStats.count}
                        isOwner={isOwner}
                        isAuthenticated={!!currentUserId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
