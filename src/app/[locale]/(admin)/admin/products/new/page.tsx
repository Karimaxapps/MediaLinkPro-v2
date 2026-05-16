import { redirect } from "next/navigation";
import { requireSiteAdmin, createProductAsAdmin, updateProductAsAdmin } from "@/features/admin/server/actions";
import { createAdminClient } from "@/lib/supabase/server";
import { ProductWizard } from "@/components/products/product-wizard";

export default async function AdminAddProductPage() {
    const { userId } = await requireSiteAdmin();

    const admin = createAdminClient();
    const [{ data: platformOrg }, { data: stubOrgs }] = await Promise.all([
        admin
            .from("organizations")
            .select("id, name, slug")
            .eq("is_platform_org" as never, true)
            .maybeSingle(),
        admin
            .from("organizations")
            .select("id, name, slug")
            .eq("is_stub" as never, true)
            .is("claimed_at" as never, null)
            .is("merged_into_id" as never, null)
            .order("name"),
    ]);

    if (!platformOrg) {
        redirect("/admin/products?error=platform-org-missing");
    }

    const org = platformOrg as { id: string; name: string; slug: string };
    const stubs = (stubOrgs ?? []) as { id: string; name: string; slug: string }[];

    const organizations = [
        org,
        ...stubs.filter((s) => s.id !== org.id),
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add Platform Product</h1>
                <p className="text-sm text-gray-400 mt-1">
                    This product will be owned by <span className="text-[#C6A85E]">MediaLinkPro</span> or attached to an unclaimed company stub.
                </p>
            </div>

            <ProductWizard
                organizations={organizations}
                userId={userId}
                createAction={createProductAsAdmin}
                updateAction={updateProductAsAdmin}
                cancelHref="/admin/products"
                afterSaveHref="/admin/products"
            />
        </div>
    );
}
