"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, ArrowUpDown, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AiToolCard } from "./ai-tool-card";
import type { AiTool, AiToolCategory } from "../types";

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
];

const ITEMS_PER_PAGE = 12;

export function AiToolsClient({
    tools,
    categories,
}: {
    tools: AiTool[];
    categories: AiToolCategory[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [showSort, setShowSort] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const toggleCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategories([]);
        setSortBy("newest");
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const hasActiveFilters = !!searchQuery || selectedCategories.length > 0;

    const filteredTools = useMemo(() => {
        let result = [...tools];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name?.toLowerCase().includes(q) ||
                    t.tagline?.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q) ||
                    t.tags?.some((tag) => tag.toLowerCase().includes(q))
            );
        }

        if (selectedCategories.length > 0) {
            result = result.filter(
                (t) => t.category_id && selectedCategories.includes(t.category_id)
            );
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case "oldest":
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case "name_asc":
                    return (a.name || "").localeCompare(b.name || "");
                case "name_desc":
                    return (b.name || "").localeCompare(a.name || "");
                default:
                    return 0;
            }
        });

        return result;
    }, [tools, searchQuery, selectedCategories, sortBy]);

    const visibleTools = filteredTools.slice(0, visibleCount);
    const hasMore = visibleCount < filteredTools.length;
    const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row">
                <div>
                    <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
                        <Sparkles className="h-6 w-6 text-[var(--brand)]" />
                        AI Production Tools
                    </h1>
                    <p className="text-sm text-gray-400">
                        Discover AI tools and platforms for media production.
                        <span className="ml-2 text-gray-500">
                            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
                        </span>
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search AI tools..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleCount(ITEMS_PER_PAGE);
                        }}
                        className="w-full border-white/10 bg-black/20 pl-8 text-white focus:border-[var(--brand)]/50 md:w-[300px]"
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Category:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.length === 0 && (
                        <span className="text-sm text-gray-500">No categories yet</span>
                    )}
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                selectedCategories.includes(cat.id)
                                    ? "border-[var(--brand)] bg-[var(--brand)] font-medium text-black"
                                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <div className="relative ml-auto">
                    <button
                        onClick={() => setShowSort(!showSort)}
                        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        {sortOptions.find((o) => o.value === sortBy)?.label}
                    </button>
                    {showSort && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-white/10 bg-[#1F1F1F] shadow-xl">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setShowSort(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                        sortBy === option.value
                                            ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                                            : "text-gray-300 hover:bg-white/5"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Active filter pills */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((id) => (
                        <span
                            key={id}
                            className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400"
                        >
                            {categoryName(id)}
                            <button onClick={() => toggleCategory(id)} className="hover:text-white">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Results Grid */}
            {visibleTools.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleTools.map((tool) => (
                            <AiToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                                variant="outline"
                                className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                Load More ({filteredTools.length - visibleCount} remaining)
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    icon={Sparkles}
                    title="No AI tools found"
                    description={
                        hasActiveFilters
                            ? "Try adjusting your filters or search terms."
                            : "No AI tools have been published yet. Check back later."
                    }
                    actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                    onAction={hasActiveFilters ? clearFilters : undefined}
                />
            )}
        </div>
    );
}
