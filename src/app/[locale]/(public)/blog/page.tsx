import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { PenSquare, Eye, Heart } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { listPublishedPosts } from "@/features/blog/server/actions";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Industry insights, product news, and thought leadership from the media professional community.",
};

export default async function PublicBlogPage() {
  const posts = await listPublishedPosts(30);
  const t = useTranslations("blog");

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <PublicNav activePath="/blog" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#C6A85E] font-semibold">
            {t("label")}
          </p>
          <h1 className="text-4xl font-bold text-white">{t("heading")}</h1>
          <p className="text-gray-400 max-w-xl">{t("description")}</p>
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
                href={`/blog/${post.slug}`}
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
                  <h2 className="text-base font-semibold text-white group-hover:text-[#C6A85E] transition-colors line-clamp-2 leading-snug">
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

        {/* Footer CTA */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{t("joinCTA")}</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-[#C6A85E] hover:bg-[#B5964A] text-black text-sm font-semibold px-5 py-2 rounded-full transition-colors"
          >
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </div>
  );
}
