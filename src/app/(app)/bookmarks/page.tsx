import { getBookmarkedProducts } from "@/features/products/server/actions";
import { ProductCard } from "@/features/products/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Bookmark } from "lucide-react";
import { Product } from "@/features/products/types";
import { redirect } from "next/navigation";

export const metadata = {
    title: "My Bookmarks | MediaLinkPro",
    description: "Manage your bookmarked products and solutions.",
};

export default async function BookmarkedPage() {
    const products = await getBookmarkedProducts();

    async function handleBrowse() {
        'use server';
        redirect("/marketplace/products");
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Bookmark className="h-8 w-8 text-[#C6A85E]" />
                    My Bookmarks
                </h1>
                <p className="text-gray-400">
                    Quickly access the products and solutions you've saved.
                </p>
            </div>

            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Bookmark}
                    title="No bookmarks yet"
                    description="Explore the marketplace and save products you're interested in to see them here."
                    actionLabel="Browse Marketplace"
                    onAction={handleBrowse}
                />
            )}
        </div>
    );
}
