import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-4 w-72 bg-white/5" />
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1 rounded-lg bg-white/5" />
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-lg bg-white/5" />
                    ))}
                </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <Skeleton className="h-40 w-full rounded-lg bg-white/10" />
                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                        <Skeleton className="h-4 w-1/2 bg-white/10" />
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-24 rounded-lg bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
