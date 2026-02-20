'use client';

import { ProductCard } from "@/features/products/components/product-card";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export function DashboardClient({
    initialProducts,
    latestCompanies,
    latestUsers
}: {
    initialProducts: any[],
    latestCompanies: any[],
    latestUsers: any[]
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Middle Column: Main Feed */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Feed</h1>
                </div>

                <div className="space-y-6">
                    {initialProducts.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-gray-400">
                            No products found. Be the first to add one!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {initialProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Placeholder for more items to come */}
                    <div className="py-8 text-center">
                        <p className="text-gray-500 text-sm">You&apos;ve reached the end for now. Check back later for more updates!</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="lg:col-span-4 sticky top-24">
                <DashboardSidebar
                    latestCompanies={latestCompanies}
                    latestUsers={latestUsers}
                />
            </div>
        </div>
    );
}
