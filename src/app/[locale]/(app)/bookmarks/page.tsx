import { getBookmarkedProducts } from "@/features/products/server/actions";
import { getBookmarkedAiTools } from "@/features/ai-tools/server/actions";
import { ProductCard } from "@/features/products/components/product-card";
import { AiToolCard } from "@/features/ai-tools/components/ai-tool-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Bookmark, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
    title: "My Bookmarks | MediaLinkPro",
    description: "Manage your bookmarked products, solutions, and AI tools.",
};

export default async function BookmarkedPage() {
    const [products, aiTools] = await Promise.all([
        getBookmarkedProducts(),
        getBookmarkedAiTools(),
    ]);

    async function handleBrowse() {
        'use server';
        redirect("/marketplace/products");
    }

    const hasAny = (products && products.length > 0) || (aiTools && aiTools.length > 0);

    return (
        <div className="container mx-auto py-8 space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Bookmark className="h-8 w-8 text-[var(--brand)]" />
                    My Bookmarks
                </h1>
                <p className="text-gray-400">
                    Quickly access the products, solutions, and AI tools you&apos;ve saved.
                </p>
            </div>

            {!hasAny ? (
                <EmptyState
                    icon={Bookmark}
                    title="No bookmarks yet"
                    description="Explore the marketplace and save products you're interested in to see them here."
                    actionLabel="Browse Marketplace"
                    onAction={handleBrowse}
                />
            ) : (
                <>
                    {products && products.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">Products</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    )}

                    {aiTools && aiTools.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[var(--brand)]" />
                                AI Production Tools
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {aiTools.map((tool) => (
                                    <AiToolCard key={tool.id} tool={tool} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
