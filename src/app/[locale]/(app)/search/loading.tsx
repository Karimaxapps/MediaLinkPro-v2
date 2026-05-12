import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-4 w-64 bg-white/5" />
            </div>

            {/* Tabs skeleton */}
            <Skeleton className="h-10 w-96 rounded-lg bg-white/5" />

            {/* Results skeleton */}
            {Array.from({ length: 3 }).map((_, sectionIdx) => (
                <div key={sectionIdx} className="space-y-3">
                    <Skeleton className="h-6 w-32 bg-white/5" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                                <Skeleton className="h-12 w-12 rounded-lg bg-white/10 flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
