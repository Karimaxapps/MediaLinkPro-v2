"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { deleteReviewAsAdmin } from "@/features/admin/server/actions";

type Review = {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string | null;
};

export function AdminReviewRow({ review }: { review: Review }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Delete this review?")) return;
        startTransition(async () => {
            const result = await deleteReviewAsAdmin(review.id);
            if (!result.success) toast.error(result.error ?? "Failed");
            else {
                toast.success("Review deleted");
                router.refresh();
            }
        });
    };

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < review.rating ? "fill-[#C6A85E] text-[#C6A85E]" : "text-gray-600"
                                }`}
                            />
                        ))}
                        {review.title && (
                            <span className="text-sm font-medium text-white ml-2">{review.title}</span>
                        )}
                    </div>
                    {review.body && (
                        <p className="text-sm text-gray-300 line-clamp-3">{review.body}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                        Product {review.product_id.slice(0, 8)} • User {review.user_id.slice(0, 8)}
                        {review.created_at && (
                            <> • {new Date(review.created_at).toLocaleDateString()}</>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                    disabled={isPending}
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
