
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/features/products/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getPublicProducts } from "@/features/products/server/actions";

export default async function MarketplaceProductsPage() {
    const products = await getPublicProducts();

    return (
        <div className="space-y-8">
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Marketplace</h1>
                    <p className="text-sm text-gray-400">Discover cutting-edge media technology and solutions.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search products..."
                        className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[300px]"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Filter by:</span>
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <div className="flex flex-wrap gap-2">
                    {/* Placeholder for actual interactive filters - using buttons for better horizontal UX */}
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white h-8">
                        Software
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white h-8">
                        Hardware
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white h-8">
                        Services
                    </Button>
                </div>
                <div className="ml-auto">
                    <Button size="sm" className="bg-[#C6A85E] hover:bg-[#B59648] text-black font-medium h-8">Apply Filters</Button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-6">
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Render up to 6 products initially */}
                        {products.slice(0, 6).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={ShoppingBag} title="No products found" description="Try adjusting your filters or check back later." />
                )}
            </div>
        </div>
    );
}
