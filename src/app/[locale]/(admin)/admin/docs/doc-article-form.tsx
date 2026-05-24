"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DOC_CATEGORIES, type DocCategory } from "@/features/docs/schema";
import { CATEGORY_LABELS } from "@/features/docs/types";
import { createDocArticle, updateDocArticle } from "@/features/docs/server/actions";
import type { DocArticle } from "@/features/docs/types";

type Props = {
  article?: DocArticle;
};

export function DocArticleForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;
  const [isPending, startTransition] = useTransition();

  const [title,      setTitle]      = useState(article?.title ?? "");
  const [slug,       setSlug]       = useState(article?.slug ?? "");
  const [excerpt,    setExcerpt]    = useState(article?.excerpt ?? "");
  const [content,    setContent]    = useState(article?.content ?? "");
  const [category,   setCategory]   = useState<DocCategory>(article?.category ?? "user-guide");
  const [isPublic,   setIsPublic]   = useState(article?.is_public ?? false);
  const [sortOrder,  setSortOrder]  = useState(article?.sort_order ?? 0);
  const [versionTag, setVersionTag] = useState(article?.version_tag ?? "");

  const submit = () => {
    startTransition(async () => {
      const payload = {
        title,
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        category,
        is_public: isPublic,
        sort_order: sortOrder,
        version_tag: versionTag.trim() || undefined,
      };

      const result = isEdit
        ? await updateDocArticle(article.id, payload)
        : await createDocArticle(payload);

      if (!result.success) {
        toast.error(result.error ?? "Failed to save");
        return;
      }
      toast.success(isEdit ? "Article updated" : "Article created");
      router.push("/admin/docs");
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/docs"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Documentation
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? "Edit Article" : "New Article"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEdit ? "Update the article content and settings." : "Create a new documentation article."}
        </p>
      </div>

      <div className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-white">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title…"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label className="text-white">
            Slug <span className="text-gray-500 font-normal">(auto-generated if blank)</span>
          </Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="my-article-slug"
            className="bg-white/5 border-white/10 text-white font-mono text-sm"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label className="text-white">
            Excerpt <span className="text-gray-500 font-normal">(optional — shown in lists)</span>
          </Label>
          <Input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A one-line summary…"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Category + Version Tag */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none [&>option]:bg-[#1F1F1F]"
            >
              {DOC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">
              Version Tag <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Input
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              placeholder="e.g. v1.4.0"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Sort Order + Public toggle */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Sort Order</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Visibility</Label>
            <label className="flex items-center gap-3 h-10 cursor-pointer">
              <div
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-[var(--brand)]" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-300">
                {isPublic ? "Public (visible in Support)" : "Internal only"}
              </span>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label className="text-white">Content</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article here…"
          />
          <p className="text-xs text-gray-500">
            Use the toolbar for headings, bold, lists, and blockquotes.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            className="bg-[var(--brand)] hover:bg-[#b5975a] text-black"
            disabled={isPending || !title.trim() || !content.trim()}
            onClick={submit}
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Article"}
          </Button>
        </div>
      </div>
    </div>
  );
}
