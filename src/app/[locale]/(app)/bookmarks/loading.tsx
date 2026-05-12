import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksLoading() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-40 bg-white/5" />
                <Skeleton className="h-4 w-64 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <Skeleton className="h-40 w-full rounded-lg bg-white/10" />
                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                        <Skeleton className="h-4 w-1/2 bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}
