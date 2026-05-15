"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ExternalLink, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAiToolAsAdmin } from "@/features/admin/server/actions";

type Tool = {
    id: string;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    bookmarks_count: number | null;
    created_at: string | null;
};

export function AdminAiToolRow({
    tool,
    categoryName,
}: {
    tool: Tool;
    categoryName: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
        startTransition(async () => {
            const result = await deleteAiToolAsAdmin(tool.id);
            if (!result.success) toast.error(result.error ?? "Failed to delete");
            else {
                toast.success("AI tool deleted");
                router.refresh();
            }
        });
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="p-4">
                <div className="text-sm font-medium text-white">{tool.name}</div>
                <div className="text-xs text-gray-500">
                    {tool.created_at && new Date(tool.created_at).toLocaleDateString()}
                </div>
            </td>
            <td className="p-4 text-sm text-gray-400">{categoryName}</td>
            <td className="p-4 text-sm text-gray-400">{tool.status}</td>
            <td className="p-4 text-center">
                {tool.is_featured && (
                    <Star className="mx-auto h-4 w-4 fill-[#C6A85E] text-[#C6A85E]" />
                )}
            </td>
            <td className="p-4 text-right text-sm text-gray-300">
                {(tool.bookmarks_count ?? 0).toLocaleString()}
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/ai-tools/${tool.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/admin/ai-tools/${tool.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        disabled={isPending}
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
