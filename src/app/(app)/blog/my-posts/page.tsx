import Link from "next/link";
import { format } from "date-fns";
import { listMyPosts } from "@/features/blog/server/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenSquare } from "lucide-react";
import { MyPostActions } from "./my-post-actions";

export default async function MyPostsPage() {
    const posts = await listMyPosts();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to blog
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Posts</h1>
                    <p className="text-sm text-gray-400 mt-1">{posts.length} total</p>
                </div>
                <Link href="/blog/new">
                    <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black">
                        <PenSquare className="mr-2 h-4 w-4" />
                        New post
                    </Button>
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center text-gray-400">
                    You haven&apos;t written any posts yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            post.status === "published"
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : post.status === "draft"
                                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                                : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                        }`}
                                    >
                                        {post.status}
                                    </span>
                                    {post.category && (
                                        <span className="text-xs text-[#C6A85E]">{post.category}</span>
                                    )}
                                </div>
                                <h3 className="text-base font-semibold text-white truncate">{post.title}</h3>
                                <div className="text-xs text-gray-500 mt-1">
                                    {post.updated_at && format(new Date(post.updated_at), "MMM d, yyyy")}
                                    {" • "}
                                    {post.views_count} views
                                </div>
                            </div>
                            <MyPostActions
                                postId={post.id}
                                slug={post.slug}
                                status={post.status}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
