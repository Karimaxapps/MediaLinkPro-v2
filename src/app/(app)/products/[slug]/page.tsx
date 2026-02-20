import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getProductBySlug } from "@/features/products/server/actions";
import { ProductDetailsClient } from "@/components/products/product-details-client";

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

    const images = [];
    if (product.logo_url) images.push(product.logo_url);
    if (product.gallery_urls && product.gallery_urls.length > 0) images.push(product.gallery_urls[0]);
    if (product.organizations?.logo_url) images.push(product.organizations.logo_url);

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
            images,
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

    return <ProductDetailsClient product={product} user={user} userProfile={userProfile} isOwner={isOwner} />;
}
