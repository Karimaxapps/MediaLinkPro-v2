import { getPublicServices } from "@/features/products/server/actions";
import { MarketplaceClient } from "@/features/products/components/marketplace-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Production Services",
    description:
        "Browse production, post-production, and media support services from agencies, vendors, and freelancers across the industry.",
};

export default async function ProductionServicesPage() {
    const services = await getPublicServices();
    return (
        <MarketplaceClient
            products={services || []}
            title="Production Services"
            description="Production, post-production, and media support services from agencies, vendors, and freelancers."
            itemNoun="service"
        />
    );
}
