"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Building2, User, Award, SearchX } from "lucide-react";
import type { SearchResults } from "@/features/search/server/actions";

type Tab = "all" | "products" | "companies" | "people" | "experts";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All", icon: SearchX },
    { key: "products", label: "Products", icon: Package },
    { key: "companies", label: "Companies", icon: Building2 },
    { key: "people", label: "People", icon: User },
    { key: "experts", label: "Experts", icon: Award },
];

export function SearchResultsClient({
    initialQuery,
    initialResults,
}: {
    initialQuery: string;
    initialResults: SearchResults | null;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const results = initialResults;

    if (!initialQuery || initialQuery.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <SearchX className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">Start searching</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                    Type at least 2 characters to search across products, companies, people, and experts.
                </p>
            </div>
        );
    }

    if (!results) return null;

    const totalCount =
        results.products.length +
        results.organizations.length +
        results.profiles.length +
        results.experts.length;

    if (totalCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <SearchX className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No results found</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                    Try different keywords or broaden your search.
                </p>
            </div>
        );
    }

    const showProducts = activeTab === "all" || activeTab === "products";
    const showCompanies = activeTab === "all" || activeTab === "companies";
    const showPeople = activeTab === "all" || activeTab === "people";
    const showExperts = activeTab === "all" || activeTab === "experts";

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
                {tabs.map((tab) => {
                    const count =
                        tab.key === "all"
                            ? totalCount
                            : tab.key === "products"
                              ? results.products.length
                              : tab.key === "companies"
                                ? results.organizations.length
                                : tab.key === "people"
                                  ? results.profiles.length
                                  : results.experts.length;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === tab.key
                                    ? "bg-[#C6A85E] text-black"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        activeTab === tab.key ? "bg-black/20" : "bg-white/10"
                                    }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Products */}
            {showProducts && results.products.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#C6A85E]" />
                        Products
                        <span className="text-sm text-gray-400 font-normal">({results.products.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {product.logo_url ? (
                                        <Image src={product.logo_url} alt={product.name} width={48} height={48} className="object-cover" />
                                    ) : (
                                        <Package className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                                    {product.organization && (
                                        <p className="text-sm text-gray-400">by {product.organization.name}</p>
                                    )}
                                    <div className="flex gap-2 mt-1">
                                        {product.main_category && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                                                {product.main_category}
                                            </span>
                                        )}
                                        {product.product_type && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#C6A85E]/10 text-[#C6A85E]">
                                                {product.product_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Companies */}
            {showCompanies && results.organizations.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#C6A85E]" />
                        Companies
                        <span className="text-sm text-gray-400 font-normal">({results.organizations.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.organizations.map((org) => (
                            <Link
                                key={org.id}
                                href={`/companies/${org.slug}`}
                                className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {org.logo_url ? (
                                        <Image src={org.logo_url} alt={org.name} width={48} height={48} className="object-cover" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-white truncate">{org.name}</h3>
                                    {org.tagline && <p className="text-sm text-gray-400 truncate">{org.tagline}</p>}
                                    {org.organization_type && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 mt-1 inline-block">
                                            {org.organization_type}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* People */}
            {showPeople && results.profiles.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-[#C6A85E]" />
                        People
                        <span className="text-sm text-gray-400 font-normal">({results.profiles.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.profiles.map((profile) => (
                            <Link
                                key={profile.id}
                                href={`/profiles/${profile.username}`}
                                className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {profile.avatar_url ? (
                                        <Image src={profile.avatar_url} alt={profile.full_name || ""} width={48} height={48} className="object-cover rounded-full" />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-white truncate">{profile.full_name}</h3>
                                    {profile.job_title && (
                                        <p className="text-sm text-gray-400 truncate">
                                            {profile.job_title}
                                            {profile.company && ` at ${profile.company}`}
                                        </p>
                                    )}
                                    {profile.bio && (
                                        <p className="text-xs text-gray-500 truncate mt-1">{profile.bio}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Experts */}
            {showExperts && results.experts.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#C6A85E]" />
                        Experts
                        <span className="text-sm text-gray-400 font-normal">({results.experts.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.experts.map((expert) => (
                            <Link
                                key={expert.id}
                                href={`/experts/${expert.profile?.username || expert.id}`}
                                className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {expert.profile?.avatar_url ? (
                                        <Image src={expert.profile.avatar_url} alt={expert.profile.full_name || ""} width={48} height={48} className="object-cover rounded-full" />
                                    ) : (
                                        <Award className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-white truncate">{expert.profile?.full_name || "Expert"}</h3>
                                    {expert.headline && <p className="text-sm text-gray-400 truncate">{expert.headline}</p>}
                                    {expert.skills && expert.skills.length > 0 && (
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {expert.skills.slice(0, 3).map((skill) => (
                                                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-[#C6A85E]/10 text-[#C6A85E]">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
