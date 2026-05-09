import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32 bg-white/5" />
                    <Skeleton className="h-4 w-72 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-72 rounded-lg bg-white/5" />
            </div>

            {/* Filters skeleton */}
            <Skeleton className="h-14 w-full rounded-lg bg-white/5" />

            {/* Event cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                        <Skeleton className="h-32 w-full bg-white/10" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4 bg-white/10" />
                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                            <Skeleton className="h-4 w-2/3 bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
