"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { deleteProductAsAdmin } from "@/features/admin/server/actions";

type Product = {
    id: string;
    name: string;
    slug: string;
    created_at: string | null;
    status: string | null;
    organization_id: string | null;
    views_count: number | null;
    bookmarks_count: number | null;
};

export function AdminProductRow({ product }: { product: Product }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        startTransition(async () => {
            const result = await deleteProductAsAdmin(product.id);
            if (!result.success) toast.error(result.error ?? "Failed to delete");
            else {
                toast.success("Product deleted");
                router.refresh();
            }
        });
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="p-4">
                <div className="text-sm font-medium text-white">{product.name}</div>
                <div className="text-xs text-gray-500">
                    {product.created_at && new Date(product.created_at).toLocaleDateString()}
                </div>
            </td>
            <td className="p-4 text-sm text-gray-400">{product.status ?? "—"}</td>
            <td className="p-4 text-right text-sm text-gray-300">
                {(product.views_count ?? 0).toLocaleString()}
            </td>
            <td className="p-4 text-right text-sm text-gray-300">
                {(product.bookmarks_count ?? 0).toLocaleString()}
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/products/${product.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
