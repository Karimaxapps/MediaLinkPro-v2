import { redirect } from "next/navigation";
import { NewBlogPostClient } from "./new-post-client";
import { listLinkableProductsForCurrentUser } from "@/features/blog/server/actions";
import { getMyPrimaryOrg } from "@/features/organizations/server/actions";

export default async function NewBlogPostPage() {
  const org = await getMyPrimaryOrg();
  if (!org) {
    // Blog posts are now an org-only feature. Send users without a company
    // profile to the create-company flow with a contextual hint.
    redirect("/companies/new?from=blog");
  }

  const products = await listLinkableProductsForCurrentUser();
  return (
    <NewBlogPostClient
      linkableProducts={products}
      organizationId={org.id}
      organizationName={org.name}
    />
  );
}
