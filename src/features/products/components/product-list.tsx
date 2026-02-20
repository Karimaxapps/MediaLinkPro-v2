import { getProductsByOrg } from "../server/actions";
import { ProductCard } from "./product-card";
import { CompanyProductCard } from "./company-product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Globe } from "lucide-react";

interface ProductListProps {
    orgId: string;
    isOwner?: boolean;
}

export async function ProductList({ orgId, isOwner = false }: ProductListProps) {
    const products = await getProductsByOrg(orgId);

    if (!products || products.length === 0) {
        return (
            <EmptyState
                icon={Globe}
                title="No Products Yet"
                description="This company hasn't listed any products yet."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product: any) => (
                isOwner ? (
                    <CompanyProductCard key={product.id} product={product} />
                ) : (
                    <ProductCard key={product.id} product={product} />
                )
            ))}
        </div>
    );
}
