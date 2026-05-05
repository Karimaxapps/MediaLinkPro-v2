"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createPost, type LinkableProduct } from "@/features/blog/server/actions";

export function NewBlogPostClient({ linkableProducts }: { linkableProducts: LinkableProduct[] }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [linkedProductId, setLinkedProductId] = useState("");
    const [isPending, startTransition] = useTransition();

    const submit = (status: "draft" | "published") => {
        startTransition(async () => {
            const result = await createPost({
                title,
                excerpt: excerpt || undefined,
                content,
                category: category || undefined,
                tags: tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                cover_image_url: coverUrl || undefined,
                linked_product_id: linkedProductId || undefined,
                status,
            });
            if (!result.success) {
                toast.error(result.error ?? "Failed to save");
                return;
            }
            toast.success(status === "published" ? "Post published" : "Draft saved");
            router.push(status === "published" ? `/blog/${result.slug}` : "/blog/my-posts");
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link
                href="/blog"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to blog
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-white">Write a post</h1>
                <p className="text-sm text-gray-400 mt-1">Share insights with the community.</p>
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="A compelling title..."
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-white">Excerpt (optional)</Label>
                    <Input
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="One-line summary shown in the feed"
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <Input
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Industry News"
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="broadcast, ai, workflow"
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cover" className="text-white">Cover image URL (optional)</Label>
                    <Input
                        id="cover"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://..."
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="linked-product" className="text-white">
                        Link to a service or product (optional)
                    </Label>
                    <select
                        id="linked-product"
                        value={linkedProductId}
                        onChange={(e) => setLinkedProductId(e.target.value)}
                        disabled={linkableProducts.length === 0}
                        className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[#C6A85E]/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#1F1F1F] [&>option]:text-white"
                    >
                        <option value="" className="bg-[#1F1F1F] text-white">— None —</option>
                        {linkableProducts.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[#1F1F1F] text-white">
                                {p.name} {p.organization_name ? `· ${p.organization_name}` : ""}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">
                        {linkableProducts.length === 0
                            ? "You don't have any products yet. Create one first to link it here."
                            : "If selected, this post will appear on the product page and the product will be highlighted on the post."}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content" className="text-white">Content</Label>
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Write your article here..."
                    />
                    <p className="text-xs text-gray-500">
                        Use the toolbar to format with headings, bold, italics, lists, and quotes.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="bg-transparent border-white/10 text-white hover:bg-white/10"
                        disabled={isPending || !title.trim() || !content.trim()}
                        onClick={() => submit("draft")}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save as draft
                    </Button>
                    <Button
                        className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                        disabled={isPending || !title.trim() || !content.trim()}
                        onClick={() => submit("published")}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Publish
                    </Button>
                </div>
            </div>
        </div>
    );
}
