"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Eye, Heart, Trash2, ExternalLink, PenSquare, Archive, CheckCircle, FileText } from "lucide-react";
import type { AdminBlogPost } from "@/features/admin/server/actions";
import {
  deleteBlogPostAsAdmin,
  updateBlogPostStatusAsAdmin,
} from "@/features/admin/server/actions";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  published: { label: "Published", className: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
  draft: { label: "Draft", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: FileText },
  archived: { label: "Archived", className: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Archive },
};

export function BlogClient({ posts: initial }: { posts: AdminBlogPost[] }) {
  const [posts, setPosts] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = posts.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.author_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteBlogPostAsAdmin(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
      setConfirm(null);
    });
  }

  function handleStatusChange(id: string, status: "draft" | "published" | "archived") {
    startTransition(async () => {
      const res = await updateBlogPostStatusAsAdmin(id, status);
      if (res.success) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      }
    });
  }

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    archived: posts.filter((p) => p.status === "archived").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["all", "published", "draft", "archived"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              statusFilter === s
                ? "border-[var(--brand)]/50 bg-[var(--brand)]/10"
                : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
            }`}
          >
            <p className="text-2xl font-bold text-white">{counts[s]}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">
              {s === "all" ? "Total posts" : `${s} posts`}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <PenSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand)]/50"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <PenSquare className="h-10 w-10 mx-auto mb-3 text-gray-700" />
            <p>No blog posts found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Stats
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((post) => {
                const cfg = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 max-w-xs">
                        <p className="text-white font-medium line-clamp-1">{post.title}</p>
                        {post.category && (
                          <p className="text-xs text-[var(--brand)]">{post.category}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-300">{post.author_name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium ${cfg.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-3 text-gray-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {post.views_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likes_count.toLocaleString()}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-gray-400 text-xs">
                        {post.published_at
                          ? format(new Date(post.published_at), "MMM d, yyyy")
                          : post.created_at
                          ? format(new Date(post.created_at), "MMM d, yyyy")
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Status change dropdown */}
                        <select
                          value={post.status}
                          disabled={isPending}
                          onChange={(e) =>
                            handleStatusChange(
                              post.id,
                              e.target.value as "draft" | "published" | "archived"
                            )
                          }
                          className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-[var(--brand)]/50 disabled:opacity-50"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>

                        {/* View link */}
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="View post"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* Delete */}
                        {confirm === post.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={isPending}
                              className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirm(null)}
                              className="px-2 py-1 text-xs rounded bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirm(post.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
