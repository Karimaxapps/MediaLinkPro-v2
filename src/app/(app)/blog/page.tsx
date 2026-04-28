import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { listPublishedPosts } from "@/features/blog/server/actions";
import { Button } from "@/components/ui/button";
import { PenSquare, Eye, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog | MediaLinkPro",
    description: "Industry insights, product news, and thought leadership from the media professional community.",
};

export default async function BlogPage() {
    const posts = await listPublishedPosts(30);

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blog</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Industry insights, product news, and thought leadership.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/blog/my-posts">
                        <Button variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/10">
                            My Posts
                        </Button>
                    </Link>
                    <Link href="/blog/new">
                        <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black">
                            <PenSquare className="mr-2 h-4 w-4" />
                            Write a post
                        </Button>
                    </Link>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <PenSquare className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No posts published yet. Be the first to write one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/[0.07] transition-colors"
                        >
                            {post.cover_image_url ? (
                                <div className="relative aspect-video bg-white/5">
                                    <Image
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-gradient-to-br from-[#C6A85E]/10 to-white/5 flex items-center justify-center">
                                    <PenSquare className="h-10 w-10 text-[#C6A85E]/30" />
                                </div>
                            )}
                            <div className="p-5 space-y-2">
                                {post.category && (
                                    <div className="text-xs uppercase tracking-wider text-[#C6A85E] font-medium">
                                        {post.category}
                                    </div>
                                )}
                                <h2 className="text-lg font-semibold text-white group-hover:text-[#C6A85E] transition-colors line-clamp-2">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
                                )}
                                {post.linked_product && (
                                    <div className="inline-flex items-center gap-1.5 text-[10px] text-[#C6A85E] bg-[#C6A85E]/10 border border-[#C6A85E]/20 px-2 py-0.5 rounded-full">
                                        <Package className="h-3 w-3" />
                                        <span className="truncate max-w-[140px]">{post.linked_product.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 pt-2 text-xs text-gray-500">
                                    <span>{post.author?.full_name ?? post.author?.username ?? "Author"}</span>
                                    {post.published_at && (
                                        <span>• {format(new Date(post.published_at), "MMM d, yyyy")}</span>
                                    )}
                                    <span className="ml-auto flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {post.views_count}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
