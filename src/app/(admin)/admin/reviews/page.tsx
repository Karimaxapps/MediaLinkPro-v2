import { listAdminReviews } from "@/features/admin/server/actions";
import { AdminReviewRow } from "./review-row";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
    const reviews = await listAdminReviews();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Reviews Moderation</h1>
                <p className="text-sm text-gray-400 mt-1">{reviews.length} most recent</p>
            </div>

            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-500">
                        No reviews yet.
                    </div>
                ) : (
                    reviews.map((r) => <AdminReviewRow key={r.id} review={r} />)
                )}
            </div>
        </div>
    );
}
