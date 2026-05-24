import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { getDocArticles } from "@/features/docs/server/actions";
import type { DocCategory } from "@/features/docs/schema";
import { PUBLIC_CATEGORY_LABELS } from "@/features/docs/types";

const VALID_CATEGORIES: DocCategory[] = ["user-guide", "feature", "faq"];

type Props = { params: Promise<{ category: string }> };

export default async function SupportCategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as DocCategory)) notFound();

  const cat = category as DocCategory;
  const t = await getTranslations("support");
  const articles = await getDocArticles({ category: cat, publicOnly: true });

  const categoryLabel = PUBLIC_CATEGORY_LABELS[cat] ?? cat;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center text-xs text-gray-500 hover:text-gray-300 transition-colors mb-3"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          {t("allArticles")}
        </Link>
        <h2 className="text-xl font-semibold text-white">{categoryLabel}</h2>
        <p className="text-sm text-gray-400 mt-1">
          {articles.length} {articles.length === 1 ? t("article") : t("articles")}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-gray-400 text-sm">{t("noArticlesInCategory")}</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/support/article/${article.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-sm font-medium text-white group-hover:text-[var(--brand)] transition-colors">
                  {article.title}
                </div>
                {article.excerpt && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(article.updated_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[var(--brand)] shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
