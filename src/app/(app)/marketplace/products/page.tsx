import { getPublicProducts } from "@/features/products/server/actions";
import { MarketplaceClient } from "@/features/products/components/marketplace-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketplace",
    description: "Discover cutting-edge media technology, software, hardware, and professional services.",
};

export default async function MarketplaceProductsPage() {
    const products = await getPublicProducts();

    return <MarketplaceClient products={products || []} />;
}
