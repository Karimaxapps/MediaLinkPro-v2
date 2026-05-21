import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getProductBySlug } from "@/features/products/server/actions";
import { listPostsForProduct } from "@/features/blog/server/actions";
import { ProductDetailsClient } from "@/components/products/product-details-client";
import { getOwnershipRequestStatus } from "@/features/ownership-requests/server/actions";

import { Metadata } from "next";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const title = `${product.name} | MediaLinkPro`;
    const description = product.short_description || product.description?.substring(0, 160) || 'View this product on MediaLinkPro';

    // Use the product's main image (the hero shown on the product page) as the post image.
    // Fall back to the first gallery image, then the company logo.
    const imageUrl =
        product.logo_url ||
        (product.gallery_urls && product.gallery_urls.length > 0 ? product.gallery_urls[0] : null) ||
        product.organizations?.logo_url ||
        null;

    type OGImage = { url: string; width: number; height: number; alt: string };
    const images: OGImage[] = imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }]
        : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
            siteName: 'MediaLinkPro',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is owner/admin of the organization
    let isOwner = false;
    if (user && product.organization_id) {
        const { data: membership } = await supabase
            .from('organization_members')
            .select('role')
            .eq('organization_id', product.organization_id)
            .eq('user_id', user.id)
            .single();

        isOwner = ['owner', 'admin'].includes(membership?.role || '');
    }

    // Fetch user profile if authenticated
    let userProfile = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        userProfile = profile;
    }

    // Platform product claim detection
    const productOrganization = product.organizations as { is_platform_org?: boolean } | null;
    const isPlatformProduct = !!productOrganization?.is_platform_org;
    let claimRequest = null;
    let userOrgId: string | null = null;

    if (user && isPlatformProduct && !isOwner) {
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id, role, organizations(is_platform_org)')
            .eq('user_id', user.id)
            .in('role', ['owner', 'admin'])
            .maybeSingle();

        const memberOrg = membership?.organizations as { is_platform_org?: boolean } | null;
        if (membership && !memberOrg?.is_platform_org) {
            userOrgId = membership.organization_id;
            claimRequest = await getOwnershipRequestStatus(product.id, membership.organization_id);
        }
    }

    const relatedPosts = await listPostsForProduct(product.id, 6);

    return (
        <div className="space-y-8">
            <ProductDetailsClient
                product={product}
                user={user}
                userProfile={userProfile}
                isOwner={isOwner}
                isPlatformProduct={isPlatformProduct}
                userOrgId={userOrgId}
                claimRequest={claimRequest}
                relatedPosts={relatedPosts}
            />
        </div>
    );
}
