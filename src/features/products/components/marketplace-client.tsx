"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/features/products/components/product-card";
import type { Product } from "@/features/products/types";
import { PRODUCT_TYPES, MAIN_CATEGORIES } from "@/features/products/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    ShoppingBag,
    Filter,
    X,
    ArrowUpDown,
    ChevronDown,
} from "lucide-react";

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
];

const ITEMS_PER_PAGE = 12;

export function MarketplaceClient({
    products,
    title = "Marketplace",
    description = "Discover cutting-edge media technology and solutions.",
    itemNoun = "product",
}: {
    products: Product[];
    title?: string;
    description?: string;
    itemNoun?: string;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [showCategories, setShowCategories] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedTypes([]);
        setSelectedCategories([]);
        setSortBy("newest");
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const hasActiveFilters = searchQuery || selectedTypes.length > 0 || selectedCategories.length > 0;

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.main_category?.toLowerCase().includes(q) ||
                    p.organizations?.name?.toLowerCase().includes(q)
            );
        }

        // Type filter
        if (selectedTypes.length > 0) {
            result = result.filter((p) => selectedTypes.includes(p.product_type));
        }

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter((p) => selectedCategories.includes(p.main_category));
        }

        // Sort
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
    }, [products, searchQuery, selectedTypes, selectedCategories, sortBy]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h1>
                    <p className="text-sm text-gray-400">
                        {description}
                        <span className="text-gray-500 ml-2">
                            {filteredProducts.length} {itemNoun}{filteredProducts.length !== 1 ? "s" : ""}
                        </span>
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleCount(ITEMS_PER_PAGE);
                        }}
                        className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[300px]"
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Type:</span>
                </div>

                {/* Product type filters */}
                <div className="flex flex-wrap gap-2">
                    {PRODUCT_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                selectedTypes.includes(type)
                                    ? "bg-[#C6A85E] text-black border-[#C6A85E] font-medium"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-white/10" />

                {/* Category dropdown toggle */}
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        selectedCategories.length > 0
                            ? "bg-[#C6A85E] text-black border-[#C6A85E] font-medium"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                >
                    Category
                    {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCategories ? "rotate-180" : ""}`} />
                </button>

                {/* Sort dropdown */}
                <div className="relative ml-auto">
                    <button
                        onClick={() => setShowSort(!showSort)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        {sortOptions.find((o) => o.value === sortBy)?.label}
                    </button>
                    {showSort && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setShowSort(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                        sortBy === option.value
                                            ? "bg-[#C6A85E]/10 text-[#C6A85E]"
                                            : "text-gray-300 hover:bg-white/5"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Category expansion panel */}
            {showCategories && (
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Categories</span>
                        {selectedCategories.length > 0 && (
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="text-xs text-gray-400 hover:text-white"
                            >
                                Clear categories
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {MAIN_CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => toggleCategory(category)}
                                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                    selectedCategories.includes(category)
                                        ? "bg-[#C6A85E] text-black border-[#C6A85E] font-medium"
                                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Active filter pills */}
            {(selectedTypes.length > 0 || selectedCategories.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {selectedTypes.map((type) => (
                        <span
                            key={type}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-[#C6A85E]/10 text-[#C6A85E] border border-[#C6A85E]/20"
                        >
                            {type}
                            <button onClick={() => toggleType(type)} className="hover:text-white">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {selectedCategories.map((cat) => (
                        <span
                            key={cat}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        >
                            {cat}
                            <button onClick={() => toggleCategory(cat)} className="hover:text-white">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Results Grid */}
            {visibleProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                                variant="outline"
                                className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                Load More ({filteredProducts.length - visibleCount} remaining)
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    icon={ShoppingBag}
                    title="No products found"
                    description={
                        hasActiveFilters
                            ? "Try adjusting your filters or search terms."
                            : "No products have been published yet. Check back later."
                    }
                    actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                    onAction={hasActiveFilters ? clearFilters : undefined}
                />
            )}
        </div>
    );
}
