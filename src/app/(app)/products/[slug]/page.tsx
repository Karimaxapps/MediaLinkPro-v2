import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getProductBySlug } from "@/features/products/server/actions";
import { listPostsForProduct } from "@/features/blog/server/actions";
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

    const relatedPosts = await listPostsForProduct(product.id, 6);

    return (
        <div className="space-y-8">
            <ProductDetailsClient product={product} user={user} userProfile={userProfile} isOwner={isOwner} />

            {relatedPosts.length > 0 && (
                <section className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">From the blog</h2>
                        <Link
                            href="/blog"
                            className="text-xs text-[#C6A85E] hover:underline"
                        >
                            View all posts
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group flex gap-3 p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors"
                            >
                                {post.cover_image_url ? (
                                    <div className="relative h-16 w-20 shrink-0 rounded overflow-hidden">
                                        <Image
                                            src={post.cover_image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-20 shrink-0 rounded bg-[#C6A85E]/10 border border-[#C6A85E]/20" />
                                )}
                                <div className="flex-1 min-w-0">
                                    {post.category && (
                                        <div className="text-[10px] uppercase tracking-wider text-[#C6A85E] font-medium">
                                            {post.category}
                                        </div>
                                    )}
                                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#C6A85E] transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                                        {post.author?.full_name ?? post.author?.username ?? "Author"}
                                        {post.published_at && (
                                            <>
                                                <span>·</span>
                                                <span>{format(new Date(post.published_at), "MMM d, yyyy")}</span>
                                            </>
                                        )}
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-2.5 w-2.5" />
                                            {post.views_count}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
