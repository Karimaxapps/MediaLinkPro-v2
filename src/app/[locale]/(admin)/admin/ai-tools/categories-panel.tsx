"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    createAiToolCategory,
    deleteAiToolCategory,
} from "@/features/admin/server/actions";

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
};

export function AiToolCategoriesPanel({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");

    const inputClass = "border-white/10 bg-black/20 text-white focus:border-[#C6A85E]/50";

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("description", description);
        startTransition(async () => {
            const result = await createAiToolCategory({}, formData);
            if (result.success) {
                toast.success("Category created");
                setName("");
                setSlug("");
                setDescription("");
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to create category");
            }
        });
    };

    const handleDelete = (id: string, catName: string) => {
        if (!confirm(`Delete category "${catName}"? Tools in it will become uncategorized.`)) return;
        startTransition(async () => {
            const result = await deleteAiToolCategory(id);
            if (result.success) {
                toast.success("Category deleted");
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to delete category");
            }
        });
    };

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <p className="mt-1 text-sm text-gray-400">
                Categories appear in the AI tool form and the public listing filter.
            </p>

            <form onSubmit={handleAdd} className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                />
                <Input
                    placeholder="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    required
                    className={inputClass}
                />
                <Input
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                />
                <Button
                    type="submit"
                    disabled={isPending}
                    className="gap-1 bg-[#C6A85E] font-semibold text-black hover:bg-[#B5964A]"
                >
                    <Plus className="h-4 w-4" /> Add
                </Button>
            </form>

            <div className="mt-4 space-y-2">
                {categories.length === 0 && (
                    <p className="text-sm text-gray-500">No categories yet.</p>
                )}
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-2.5"
                    >
                        <div>
                            <span className="text-sm font-medium text-white">{cat.name}</span>
                            <span className="ml-2 text-xs text-gray-500">/{cat.slug}</span>
                            {cat.description && (
                                <p className="text-xs text-gray-500">{cat.description}</p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
