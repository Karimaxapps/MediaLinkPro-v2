
import { PageHeader } from "@/components/ui/page-header";
import { ProductWizard } from "@/components/products/product-wizard";
import { getOrganizations } from "@/features/organizations/server/actions";
import { getProductById } from "@/features/products/server/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface PageProps {
    searchParams: Promise<{ id?: string }>;
}

export default async function NewProductPage({ searchParams }: PageProps) {
    const { id } = await searchParams;
    const [organizations, cookieStore] = await Promise.all([
        getOrganizations(),
        cookies()
    ]);

    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    let initialData = null;
    if (id) {
        initialData = await getProductById(id);
    }

    return (
        <div className="space-y-6">
            <PageHeader
                heading={id ? "Edit Product" : "Add New Product"}
                text={id ? "Update your product details." : "Launch a new product into the marketplace."}
            />
            <ProductWizard
                organizations={organizations}
                userId={user?.id || ''}
                initialData={initialData}
            />
        </div>
    );
}
