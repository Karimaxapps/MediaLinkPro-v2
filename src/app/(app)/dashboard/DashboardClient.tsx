'use client';

import { useRef, RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/products/components/product-card";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { FeedCompanyCard } from "@/features/organizations/components/feed-company-card";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import type { Event } from "@/features/events/types";

export function DashboardClient({
    initialProducts,
    latestCompanies,
    latestUsers,
    upcomingEvent,
    sidebarExtras,
}: {
    initialProducts: any[],
    latestCompanies: any[],
    latestUsers: any[],
    upcomingEvent?: Event | null,
    sidebarExtras?: ReactNode,
}) {
    const productsScrollRef = useRef<HTMLDivElement>(null);
    const companiesScrollRef = useRef<HTMLDivElement>(null);

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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Feed</h1>
                </div>

                {/* Latest Products Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Latest Products</h2>
                        <Link href="/products" className="text-[#C6A85E] hover:text-[#C6A85E]/80 text-sm font-medium transition-colors">
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
                                    <div key={product.id} className="min-w-[300px] sm:min-w-[350px] snap-start shrink-0">
                                        <ProductCard product={product} />
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

                {/* Promo Banner */}
                <div className="relative w-full h-[200px] md:h-[250px] rounded-xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer">
                    <Image
                        src="/ads/promo_banner.png"
                        alt="Premium Tools Promo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white font-bold text-xl md:text-2xl mb-2 text-shadow">Unlock Premium Tools</h3>
                        <p className="text-white/80 text-sm">Upgrade your account for exclusive access to advanced features.</p>
                    </div>
                </div>

                {/* Featured Companies Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Featured Companies</h2>
                        <Link href="/companies" className="text-[#C6A85E] hover:text-[#C6A85E]/80 text-sm font-medium transition-colors">
                            View all
                        </Link>
                    </div>
                    {latestCompanies.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
                            No companies found yet.
                        </div>
                    ) : (
                        <div className="relative group/section">
                            <div
                                ref={companiesScrollRef}
                                className="flex overflow-x-auto gap-6 pb-4 snap-x [&::-webkit-scrollbar]:hidden"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {latestCompanies.map((company) => (
                                    <div key={company.id} className="w-[240px] snap-start shrink-0">
                                        <FeedCompanyCard
                                            id={company.id}
                                            name={company.name}
                                            tagline={company.tagline}
                                            logo_url={company.logo_url}
                                            slug={company.slug}
                                            main_activity={company.main_activity}
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
                    )}
                </div>

                {/* Placeholder for more items to come */}
                <div className="py-8 text-center">
                    <p className="text-gray-500 text-sm">You&apos;ve reached the end for now. Check back later for more updates!</p>
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
                {sidebarExtras}
                <DashboardSidebar
                    latestCompanies={latestCompanies}
                    latestUsers={latestUsers}
                    upcomingEvent={upcomingEvent}
                />
            </div>
        </div>
    );
}
