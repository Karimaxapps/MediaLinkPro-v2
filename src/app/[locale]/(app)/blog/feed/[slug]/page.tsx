import { notFound } from "next/navigation";
import { getPostBySlug } from "@/features/blog/server/actions";
import { ArticleView } from "@/features/blog/components/article-view";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    // The public route is the canonical, indexable home of the article.
    alternates: { canonical: `/blog/${post.slug}` },
    robots: { index: false },
  };
}

/**
 * In-app article reader — same content as the public /blog/[slug] page but
 * rendered inside the dashboard shell so signed-in users keep the sidebar
 * and app navigation while reading.
 */
export default async function AppBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return <ArticleView post={post} backHref="/blog/feed" />;
}
