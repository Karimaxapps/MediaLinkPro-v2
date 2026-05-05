import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Eye, Package } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPostBySlug } from "@/features/blog/server/actions";
import { ShareButtons } from "@/components/blog/share-buttons";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://medialinkpro.com";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const description = (post.excerpt ?? stripHtml(post.content)).slice(0, 200);
  const authorName = post.author?.full_name ?? post.author?.username ?? "MediaLinkPro";
  const url = `${SITE_URL}/blog/${post.slug}`;
  const images = post.cover_image_url
    ? [
        {
          url: post.cover_image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ]
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
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      creator: post.author?.username ? `@${post.author.username}` : undefined,
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
          <ShareButtons
            url={`${SITE_URL}/blog/${post.slug}`}
            title={post.title}
            excerpt={post.excerpt ?? undefined}
          />
        </div>
      </div>

      {post.cover_image_url && (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div
        className="text-gray-200 leading-relaxed
                  [&_p]:my-3
                  [&_strong]:text-white [&_strong]:font-semibold
                  [&_em]:italic
                  [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1
                  [&_li]:marker:text-[#C6A85E]
                  [&_blockquote]:border-l-2 [&_blockquote]:border-[#C6A85E] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3
                  [&_a]:text-[#C6A85E] [&_a]:underline [&_a]:underline-offset-2
                  [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.linked_product && (
        <Link
          href={`/products/${post.linked_product.slug}`}
          className="block rounded-xl border border-[#C6A85E]/30 bg-gradient-to-br from-[#C6A85E]/10 to-white/5 p-5 hover:from-[#C6A85E]/20 transition-colors"
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
                <Package className="h-6 w-6 text-[#C6A85E]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#C6A85E] font-medium mb-1">
                Featured product / service
              </div>
              <div className="text-base font-semibold text-white">{post.linked_product.name}</div>
              {post.linked_product.short_description && (
                <div className="text-sm text-gray-400 mt-0.5 line-clamp-2">
                  {post.linked_product.short_description}
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

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
