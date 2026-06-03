'use client';

import { useRef, RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye, PenSquare } from "lucide-react";
import { format } from "date-fns";
import { ProductCard } from "@/features/products/components/product-card";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { FeedCompanyCard } from "@/features/organizations/components/feed-company-card";
import type { ReactNode } from "react";
import type { Event } from "@/features/events/types";
import type { BlogPost } from "@/features/blog/server/actions";
import type { Product } from "@/features/products/types";
import type { AiTool } from "@/features/ai-tools/types";
import type { PlanId } from "@/lib/stripe/plans";
import { FeaturedAiTools } from "@/features/ai-tools/components/featured-ai-tools";
import { DailyGreeting } from "@/components/dashboard/daily-greeting";

type FeedCompany = {
    id: string;
    name: string;
    tagline?: string | null;
    logo_url?: string | null;
    slug: string;
    main_activity?: string | null;
    plan?: string | null;
    country?: string | null;
    followers_count?: number | null;
    products_count?: number | null;
    is_following?: boolean;
};

type FeedUser = {
    id: string;
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
    job_title?: string | null;
};

export function DashboardClient({
    userFirstName,
    userPlan,
    initialProducts,
    featuredProducts = [],
    latestServices = [],
    featuredCompanies = [],
    latestCompanies,
    latestUsers,
    upcomingEvent,
    eventIsGoing,
    eventAttendees,
    latestBlogPosts = [],
    featuredAiTools = [],
    heroBanner,
    sidebarAd,
    sidebarExtras,
    recommendedConnections,
}: {
    userFirstName?: string,
    userPlan?: PlanId,
    initialProducts: Product[],
    featuredProducts?: Product[],
    latestServices?: Product[],
    featuredCompanies?: FeedCompany[],
    latestCompanies: FeedCompany[],
    latestUsers: FeedUser[],
    upcomingEvent?: Event | null,
    eventIsGoing?: boolean,
    eventAttendees?: { avatar_url: string | null; full_name: string | null }[],
    latestBlogPosts?: BlogPost[],
    featuredAiTools?: AiTool[],
    heroBanner?: ReactNode,
    sidebarAd?: ReactNode,
    sidebarExtras?: ReactNode,
    recommendedConnections?: ReactNode,
}) {
    const productsScrollRef = useRef<HTMLDivElement>(null);
    const featuredProductsScrollRef = useRef<HTMLDivElement>(null);
    const servicesScrollRef = useRef<HTMLDivElement>(null);
    const companiesScrollRef = useRef<HTMLDivElement>(null);
    const blogScrollRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 400;
            ref.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Middle Column: Main Feed */}
            <div className="lg:col-span-8 space-y-8">
                <DailyGreeting firstName={userFirstName} />

                {/* Latest Products Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Latest Products</h2>
                        <Link href="/marketplace/products" className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">
                            View all
                        </Link>
                    </div>
                    {initialProducts.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-400">
                            No products found. Be the first to add one!
                        </div>
                    ) : (
                        <div className="relative group/section">
                            <div
                                ref={productsScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {initialProducts.map((product) => (
                                    <div key={product.id} className="w-[200px] snap-start shrink-0">
                                        <ProductCard product={product} compact />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scroll(productsScrollRef, 'left')}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll(productsScrollRef, 'right')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Featured Products Section — admin-curated, only shown when at least one is featured */}
                {featuredProducts.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Featured Products</h2>
                            <Link href="/marketplace/products" className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="relative group/section">
                            <div
                                ref={featuredProductsScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {featuredProducts.map((product) => (
                                    <div key={product.id} className="w-[200px] snap-start shrink-0">
                                        <ProductCard product={product} compact />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scroll(featuredProductsScrollRef, 'left')}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll(featuredProductsScrollRef, 'right')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Featured Companies Section — only shown when admin has featured at least one */}
                {featuredCompanies.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">Featured Companies</h2>
                            <Link href="/companies" className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">
                                View all
                            </Link>
                        </div>
                        <div className="relative group/section">
                            <div
                                ref={companiesScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {featuredCompanies.map((company) => (
                                    <div key={company.id} className="w-[300px] snap-start shrink-0">
                                        <FeedCompanyCard
                                            id={company.id}
                                            name={company.name}
                                            tagline={company.tagline}
                                            logo_url={company.logo_url}
                                            slug={company.slug}
                                            main_activity={company.main_activity}
                                            plan={company.plan}
                                            country={company.country}
                                            followers_count={company.followers_count}
                                            products_count={company.products_count}
                                            is_following={company.is_following}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scroll(companiesScrollRef, 'left')}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll(companiesScrollRef, 'right')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Hero Banner — admin-managed via /admin/ads (placement: dashboard_hero_banner) */}
                {heroBanner}

                {/* Media Services Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Media Services</h2>
                        <Link
                            href="/marketplace/services"
                            className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                    {latestServices.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                            No services listed yet.
                        </div>
                    ) : (
                        <div className="relative group/section">
                            <div
                                ref={servicesScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {latestServices.map((service) => (
                                    <div key={service.id} className="w-[200px] snap-start shrink-0">
                                        <ProductCard product={service} compact />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scroll(servicesScrollRef, 'left')}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll(servicesScrollRef, 'right')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Featured AI Tools Section */}
                <FeaturedAiTools tools={featuredAiTools} />

                {/* Latest Blog Posts Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Latest Blog Posts</h2>
                        <Link
                            href="/blog"
                            className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            View all
                        </Link>
                    </div>
                    {latestBlogPosts.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                            No posts published yet.
                        </div>
                    ) : (
                        <div className="relative group/section">
                            <div
                                ref={blogScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {latestBlogPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="w-[240px] sm:w-[260px] snap-start shrink-0 group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-300 flex flex-col"
                                    >
                                        {post.cover_image_url ? (
                                            <div className="relative h-32 w-full bg-gray-900 overflow-hidden">
                                                <Image
                                                    src={post.cover_image_url}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 w-full bg-gradient-to-br from-[var(--brand)]/10 to-white/5 flex items-center justify-center">
                                                <PenSquare className="h-8 w-8 text-[var(--brand)]/30" />
                                            </div>
                                        )}
                                        <div className="p-4 space-y-1.5 flex-1 flex flex-col">
                                            {post.category && (
                                                <div className="text-[10px] uppercase tracking-wider text-[var(--brand)] font-medium">
                                                    {post.category}
                                                </div>
                                            )}
                                            <h3 className="text-sm font-semibold text-white group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-xs text-gray-400 line-clamp-2">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center gap-2 pt-1 mt-auto text-[11px] text-gray-500">
                                                <span className="truncate">
                                                    {post.author?.full_name ?? post.author?.username ?? "Author"}
                                                </span>
                                                {post.published_at && (
                                                    <span className="whitespace-nowrap">· {format(new Date(post.published_at), "MMM d")}</span>
                                                )}
                                                <span className="ml-auto flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.views_count}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={() => scroll(blogScrollRef, 'left')}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll(blogScrollRef, 'right')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity z-10 hover:bg-black/70 backdrop-blur-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Placeholder for more items to come */}
                <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm">You&apos;ve reached the end for now. Check back later for more updates!</p>
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="lg:col-span-4 sticky top-0 space-y-6">
                {sidebarExtras}
                <DashboardSidebar
                    latestCompanies={latestCompanies}
                    latestUsers={latestUsers}
                    upcomingEvent={upcomingEvent}
                    eventIsGoing={eventIsGoing}
                    eventAttendees={eventAttendees}
                    adSlot={sidebarAd}
                    userPlan={userPlan}
                    recommendedConnections={recommendedConnections}
                />
            </div>
        </div>
    );
}
