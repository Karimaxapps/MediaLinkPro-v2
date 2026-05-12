"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Globe, Archive, Trash2 } from "lucide-react";
import { updatePostStatus, deletePost } from "@/features/blog/server/actions";

export function MyPostActions({
    postId,
    slug,
    status,
}: {
    postId: string;
    slug: string;
    status: "draft" | "published" | "archived";
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleStatus = (next: "draft" | "published" | "archived") => {
        startTransition(async () => {
            const result = await updatePostStatus(postId, next);
            if (!result.success) toast.error(result.error ?? "Failed");
            else {
                toast.success("Updated");
                router.refresh();
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Delete this post permanently?")) return;
        startTransition(async () => {
            const result = await deletePost(postId);
            if (!result.success) toast.error(result.error ?? "Failed");
            else {
                toast.success("Deleted");
                router.refresh();
            }
        });
    };

    return (
        <div className="flex items-center gap-1 flex-shrink-0">
            {status === "published" && (
                <Link href={`/blog/${slug}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            )}
            {status === "draft" && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    disabled={isPending}
                    onClick={() => handleStatus("published")}
                    title="Publish"
                >
                    <Globe className="h-4 w-4" />
                </Button>
            )}
            {status !== "archived" && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    disabled={isPending}
                    onClick={() => handleStatus("archived")}
                    title="Archive"
                >
                    <Archive className="h-4 w-4" />
                </Button>
            )}
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
    );
}
