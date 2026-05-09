import { PageHeader } from "@/components/ui/page-header";
import { ProductWizard } from "@/components/products/product-wizard";
import { getOrganizations } from "@/features/organizations/server/actions";
import { getProductById } from "@/features/products/server/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewProductPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const [organizations, cookieStore] = await Promise.all([getOrganizations(), cookies()]);

  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Products are an org-only feature — bounce users without a company to the
  // create-company flow with a contextual hint.
  if (!organizations || organizations.length === 0) {
    redirect("/companies/new?from=product");
  }

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
        userId={user?.id || ""}
        initialData={initialData}
      />
    </div>
  );
}
