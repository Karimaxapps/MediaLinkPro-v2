import { NewBlogPostClient } from "./new-post-client";
import { listLinkableProductsForCurrentUser } from "@/features/blog/server/actions";

export default async function NewBlogPostPage() {
    const products = await listLinkableProductsForCurrentUser();
    return <NewBlogPostClient linkableProducts={products} />;
}
