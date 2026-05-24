import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock } from "lucide-react";
import { getDocArticleBySlug } from "@/features/docs/server/actions";
import { sanitizeHtml } from "@/lib/sanitize";
import { PUBLIC_CATEGORY_LABELS } from "@/features/docs/types";
import type { DocCategory } from "@/features/docs/schema";
import { ArticleToc } from "./article-toc";

const articleClasses = `text-gray-200 leading-relaxed
  [&_p]:my-3
  [&_strong]:text-white [&_strong]:font-semibold
  [&_em]:italic
  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:scroll-mt-4
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:scroll-mt-4
  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1
  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1
  [&_li]:marker:text-[var(--brand)]
  [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3
  [&_a]:text-[var(--brand)] [&_a]:underline [&_a]:underline-offset-2
  [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs`;

type Props = { params: Promise<{ slug: string }> };

export default async function SupportArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getDocArticleBySlug(slug);
  if (!article || !article.is_public) notFound();

  const t = await getTranslations("support");
  const categoryLabel = PUBLIC_CATEGORY_LABELS[article.category as DocCategory] ?? article.category;

  return (
    <div className="flex gap-8">
      {/* Article body */}
      <article className="flex-1 min-w-0 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/support" className="hover:text-gray-300 transition-colors">
            {t("title")}
          </Link>
          <span>/</span>
          <Link
            href={`/support/${article.category}`}
            className="hover:text-gray-300 transition-colors"
          >
            {categoryLabel}
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white leading-tight">{article.title}</h1>
          {article.excerpt && <p className="text-gray-400 text-sm">{article.excerpt}</p>}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {t("lastUpdated")}:{" "}
            {new Date(article.updated_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {article.version_tag && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-[var(--brand)]">{article.version_tag}</span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className={articleClasses}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* Back link */}
        <div className="pt-6 border-t border-white/10">
          <Link
            href={`/support/${article.category}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToCategory", { category: categoryLabel })}
          </Link>
        </div>
      </article>

      {/* Sticky in-page TOC (desktop only) */}
      <ArticleToc content={article.content} />
    </div>
  );
}
