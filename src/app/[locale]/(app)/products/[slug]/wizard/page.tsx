import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * The standalone wizard route was a non-functional design mockup that was
 * never wired up (dead buttons, hardcoded placeholders, no data fetch).
 * The real product setup flow lives in the ProductWizard component rendered
 * by /products/[slug]/edit. Permanently redirect any stale links/bookmarks
 * there so they land on a working page (with proper auth + ownership checks)
 * instead of a dead form.
 */
export default async function ProductWizardRedirect({ params }: PageProps) {
    const { slug } = await params;
    redirect(`/products/${slug}/edit`);
}
