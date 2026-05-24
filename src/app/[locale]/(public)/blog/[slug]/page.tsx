import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Eye, Lock, Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicNav } from "@/components/layout/public-nav";
import { getPostBySlug } from "@/features/blog/server/actions";
import { ShareButtons } from "@/components/blog/share-buttons";
import { LikeButton } from "@/features/blog/components/like-button";
import { ViewTracker } from "@/features/blog/components/view-tracker";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { sanitizeHtml } from "@/lib/sanitize";

type Props = { params: Promise<{ slug: string; locale: string }> };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://medialinkpro.net";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const description = (post.excerpt ?? stripHtml(post.content)).slice(0, 200);
  const authorName = post.author?.full_name ?? post.author?.username ?? "MediaLinkPro";
  const url = `${SITE_URL}/blog/${post.slug}`;

  const coverUrl = post.cover_image_url
    ? post.cover_image_url.startsWith("http")
      ? post.cover_image_url
      : `${SITE_URL}${post.cover_image_url}`
    : null;

  const images = coverUrl
    ? [{ url: coverUrl, width: 1200, height: 630, alt: post.title }]
    : undefined;

  return {
    title: post.title,
    description,
    authors: [{ name: authorName }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: "MediaLinkPro",
      images,
      publishedTime: post.published_at ?? undefined,
      authors: [authorName],
      tags: post.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: coverUrl ? [coverUrl] : undefined,
      creator: post.author?.username ? `@${post.author.username}` : undefined,
    },
  };
}

export default async function PublicBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isLiked = false;
  if (user) {
    const { data } = await supabase
      .from("blog_post_likes" as never)
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isLiked = !!data;
  }

  const articleClasses = `text-gray-200 leading-relaxed
    [&_p]:my-3
    [&_strong]:text-white [&_strong]:font-semibold
    [&_em]:italic
    [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3
    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1
    [&_li]:marker:text-[var(--brand)]
    [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3
    [&_a]:text-[var(--brand)] [&_a]:underline [&_a]:underline-offset-2
    [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs`;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <PublicNav activePath="/blog" />
      <ViewTracker postId={post.id} />

      <article className="max-w-3xl mx-auto px-6 md:px-8 py-12 space-y-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {t("backToBlog")}
        </Link>

        {/* Post header */}
        <div className="space-y-4">
          {post.category && (
            <div className="text-xs uppercase tracking-wider text-[var(--brand)] font-medium">
              {post.category}
            </div>
          )}
          <h1 className="text-4xl font-bold text-white leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-gray-400">{post.excerpt}</p>}

          {/* Author row */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[var(--brand)] text-black">
                {(post.author?.full_name ?? post.author?.username ?? "A")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {post.author?.full_name ?? post.author?.username ?? t("author")}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {post.published_at && format(new Date(post.published_at), "MMMM d, yyyy")}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.views_count}
                </span>
              </div>
            </div>
            <ShareButtons
              url={`${SITE_URL}/blog/${post.slug}`}
              title={post.title}
              excerpt={post.excerpt ?? undefined}
            />
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
          </div>
        )}

        {/* Article content — full for signed-in users, gated for guests */}
        {user ? (
          <>
            <div className={articleClasses} dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />

            {/* Linked product */}
            {post.linked_product && (
              <Link
                href={`/products/${post.linked_product.slug}`}
                className="block rounded-xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/10 to-white/5 p-5 hover:from-[var(--brand)]/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-lg border border-white/10 bg-black/20 overflow-hidden flex items-center justify-center">
                    {post.linked_product.logo_url ? (
                      <Image
                        src={post.linked_product.logo_url}
                        alt={post.linked_product.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-[var(--brand)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--brand)] font-medium mb-1">
                      {t("featuredProduct")}
                    </div>
                    <div className="text-base font-semibold text-white">
                      {post.linked_product.name}
                    </div>
                    {post.linked_product.short_description && (
                      <div className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                        {post.linked_product.short_description}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Like CTA */}
            <div className="flex flex-col items-center gap-3 py-8 border-t border-white/10">
              <p className="text-sm text-gray-400">{t("foundUseful")}</p>
              <LikeButton
                postId={post.id}
                initialLiked={isLiked}
                initialCount={post.likes_count}
                isAuthenticated={true}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
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
          </>
        ) : (
          <>
            {/* Partial preview */}
            <div className="relative">
              <div
                className={`${articleClasses} max-h-[320px] overflow-hidden`}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
              />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent pointer-events-none" />
            </div>

            {/* Paywall CTA */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-10 text-center space-y-5">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/20 mx-auto">
                <Lock className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{t("signInTitle")}</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">{t("signInDesc")}</p>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={`/auth?redirect=/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[#B5964A] text-black text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
                >
                  {t("signInContinue")}
                </Link>
                <Link
                  href={`/auth?redirect=/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm px-6 py-2.5 rounded-full transition-colors"
                >
                  {t("createAccount")}
                </Link>
              </div>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
