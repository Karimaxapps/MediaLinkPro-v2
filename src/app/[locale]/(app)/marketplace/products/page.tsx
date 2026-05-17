import { getPublicProducts } from "@/features/products/server/actions";
import { MarketplaceClient } from "@/features/products/components/marketplace-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketplace",
    description: "Discover cutting-edge media technology — hardware, software, cloud and hybrid solutions.",
};

// Services are excluded from this listing (they have a dedicated page at
// /marketplace/services), so the "Service" chip is omitted from the filter.
const PRODUCT_TYPE_CHIPS = ["Hardware", "Software", "Cloud", "Hybrid"] as const;

export default async function MarketplaceProductsPage() {
    const products = await getPublicProducts();

    return (
        <MarketplaceClient
            products={products || []}
            title="Marketplace"
            description="Discover cutting-edge media technology — hardware, software, cloud and hybrid solutions."
            itemNoun="product"
            availableTypes={PRODUCT_TYPE_CHIPS}
            adSlot={<SponsoredCard placement="marketplace" />}
        />
    );
}
