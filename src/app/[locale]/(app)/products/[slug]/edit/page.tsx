
import { PageHeader } from "@/components/ui/page-header";
import { ProductWizard } from "@/components/products/product-wizard";
import { getOrganizations } from "@/features/organizations/server/actions";
import { getProductBySlug } from "@/features/products/server/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch product by slug
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const [organizations, cookieStore] = await Promise.all([
        getOrganizations(),
        cookies()
    ]);

    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Edit Product"
                text={`Update details for ${product.name}`}
            />
            <ProductWizard
                organizations={organizations}
                userId={user?.id || ''}
                initialData={product}
            />
        </div>
    );
}
