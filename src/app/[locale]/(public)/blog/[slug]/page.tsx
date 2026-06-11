import { notFound } from "next/navigation";
import { PublicNav } from "@/components/layout/public-nav";
import { getPostBySlug } from "@/features/blog/server/actions";
import { ArticleView } from "@/features/blog/components/article-view";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string; locale: string }> };

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

  const coverUrl = post.cover_image_url
    ? post.cover_image_url.startsWith("http")
      ? post.cover_image_url
      : `${SITE_URL}${post.cover_image_url}`
    : null;
  const authorName = post.author?.full_name ?? post.author?.username ?? "MediaLinkPro";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(coverUrl ? { image: coverUrl } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.updated_at ? { dateModified: post.updated_at } : {}),
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "MediaLinkPro" },
    ...(post.tags && post.tags.length > 0 ? { keywords: post.tags.join(", ") } : {}),
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <JsonLd data={jsonLd} />
      <PublicNav activePath="/blog" />
      <ArticleView post={post} backHref="/blog" />
    </div>
  );
}
