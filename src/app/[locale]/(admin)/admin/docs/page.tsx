import Link from "next/link";
import { Plus, Pencil, Globe, Lock } from "lucide-react";
import { getDocArticles } from "@/features/docs/server/actions";
import { CATEGORY_LABELS } from "@/features/docs/types";
import type { DocCategory } from "@/features/docs/schema";
import { DeleteDocButton } from "./delete-doc-button";

const CATEGORY_COLORS: Record<DocCategory, string> = {
  changelog:     "bg-[var(--brand)]/20 text-[var(--brand)] border-[var(--brand)]/30",
  "admin-guide": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  feature:       "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "user-guide":  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  faq:           "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default async function AdminDocsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const validCategories = ["changelog", "admin-guide", "feature", "user-guide", "faq"] as const;
  const activeCategory = validCategories.includes(category as DocCategory)
    ? (category as DocCategory)
    : undefined;

  const articles = await getDocArticles({ category: activeCategory });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage internal docs, changelogs, and user-facing help articles.
          </p>
        </div>
        <Link
          href="/admin/docs/new"
          className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[#b5975a] text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/docs"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            !activeCategory
              ? "bg-white/10 text-white border-white/20"
              : "text-gray-400 border-white/10 hover:bg-white/5 hover:text-white"
          }`}
        >
          All
        </Link>
        {(Object.entries(CATEGORY_LABELS) as [DocCategory, string][]).map(([cat, label]) => (
          <Link
            key={cat}
            href={`/admin/docs?category=${cat}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeCategory === cat
                ? CATEGORY_COLORS[cat]
                : "text-gray-400 border-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-gray-400 text-sm">No articles yet.</p>
          <Link
            href="/admin/docs/new"
            className="mt-4 inline-flex items-center gap-2 text-[var(--brand)] text-sm hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Create your first article
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Category</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium">Visibility</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium hidden lg:table-cell">Version</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium hidden lg:table-cell">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{article.title}</div>
                    {article.excerpt && (
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{article.excerpt}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[article.category]}`}>
                      {CATEGORY_LABELS[article.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {article.is_public ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Globe className="h-3 w-3" /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Lock className="h-3 w-3" /> Internal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">{article.version_tag ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/docs/${article.id}/edit`}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteDocButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
