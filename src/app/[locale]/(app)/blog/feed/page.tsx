import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { format } from "date-fns";
import { PenSquare, Eye, Heart } from "lucide-react";
import { listPublishedPosts } from "@/features/blog/server/actions";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function DashboardBlogFeedPage() {
  const posts = await listPublishedPosts(30);
  const t = await getTranslations("blog");

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[var(--brand)] font-semibold">
            {t("label")}
          </p>
          <h1 className="text-3xl font-bold text-white">{t("heading")}</h1>
          <p className="text-sm text-gray-400">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/blog/my-posts">
            <Button
              variant="outline"
              className="bg-transparent border-white/15 text-white hover:bg-white/5"
            >
              My posts
            </Button>
          </Link>
          <Link href="/blog/new">
            <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold">
              <PenSquare className="mr-2 h-4 w-4" />
              New post
            </Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-16 text-center">
          <PenSquare className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{t("noPosts")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/feed/${post.slug}`}
              className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
            >
              {post.cover_image_url ? (
                <div className="relative aspect-video bg-white/5 overflow-hidden">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-[var(--brand)]/10 to-white/5 flex items-center justify-center">
                  <PenSquare className="h-10 w-10 text-[var(--brand)]/30" />
                </div>
              )}

              <div className="p-5 space-y-2">
                {post.category && (
                  <div className="text-xs uppercase tracking-wider text-[var(--brand)] font-medium">
                    {post.category}
                  </div>
                )}
                <h2 className="text-base font-semibold text-white group-hover:text-[var(--brand)] transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 pt-2 text-xs text-gray-500">
                  <span>{post.author?.full_name ?? post.author?.username ?? t("author")}</span>
                  {post.published_at && (
                    <span>· {format(new Date(post.published_at), "MMM d, yyyy")}</span>
                  )}
                  <span className="ml-auto flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes_count}
                    </span>
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
