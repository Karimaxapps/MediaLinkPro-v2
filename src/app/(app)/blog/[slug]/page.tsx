import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPostBySlug } from "@/features/blog/server/actions";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };
    return {
        title: `${post.title} | MediaLinkPro Blog`,
        description: post.excerpt ?? post.content.slice(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt ?? undefined,
            images: post.cover_image_url ? [post.cover_image_url] : undefined,
            type: "article",
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    return (
        <article className="max-w-3xl mx-auto space-y-8">
            <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to blog
            </Link>

            <div className="space-y-4">
                {post.category && (
                    <div className="text-xs uppercase tracking-wider text-[#C6A85E] font-medium">
                        {post.category}
                    </div>
                )}
                <h1 className="text-4xl font-bold text-white">{post.title}</h1>
                {post.excerpt && <p className="text-lg text-gray-400">{post.excerpt}</p>}

                <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-[#C6A85E] text-black">
                            {(post.author?.full_name ?? post.author?.username ?? "A")[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                            {post.author?.full_name ?? post.author?.username ?? "Author"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            {post.published_at && format(new Date(post.published_at), "MMMM d, yyyy")}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views_count} views
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {post.cover_image_url && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                    <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="prose prose-invert max-w-none text-gray-200 whitespace-pre-wrap leading-relaxed">
                {post.content}
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
}
