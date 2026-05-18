
import { PageHeader } from "@/components/ui/page-header";
import { ProductWizard } from "@/components/products/product-wizard";
import { getOrganizations } from "@/features/organizations/server/actions";
import { getProductBySlug } from "@/features/products/server/actions";
import { createAdminClient, createClient } from "@/lib/supabase/server";
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

    // Site admins can edit any product, even orgs they don't belong to.
    // Ensure the product's owning org is in the dropdown so the wizard can
    // render (it gates on `organizations.length === 0`).
    let mergedOrgs = organizations;
    if (user) {
        const admin = createAdminClient();
        const { data: profile } = await admin
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle();

        const isSiteAdmin = (profile as { is_admin?: boolean } | null)?.is_admin === true;

        if (
            isSiteAdmin &&
            product.organization_id &&
            !organizations.some((o) => o.id === product.organization_id)
        ) {
            const { data: ownerOrg } = await admin
                .from("organizations")
                .select("id, name, slug")
                .eq("id", product.organization_id)
                .maybeSingle();
            if (ownerOrg) {
                mergedOrgs = [
                    ...organizations,
                    ownerOrg as { id: string; name: string; slug: string },
                ];
            }
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                heading="Edit Product"
                text={`Update details for ${product.name}`}
            />
            <ProductWizard
                organizations={mergedOrgs}
                userId={user?.id || ''}
                initialData={product}
            />
        </div>
    );
}
