import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-4 w-72 bg-white/5" />
            </div>

            {/* Promo banner skeleton */}
            <Skeleton className="h-40 w-full rounded-xl bg-white/5" />

            {/* Products section */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-36 bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                            <Skeleton className="h-40 w-full rounded-lg bg-white/10" />
                            <Skeleton className="h-5 w-3/4 bg-white/10" />
                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                                <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Companies section */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40 bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
