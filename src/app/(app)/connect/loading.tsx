import { Skeleton } from "@/components/ui/skeleton";

export default function ConnectLoading() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-4 w-72 bg-white/5" />
            </div>

            {/* Search */}
            <Skeleton className="h-10 w-full max-w-md rounded-lg bg-white/5" />

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-14 w-14 rounded-full bg-white/10" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4 bg-white/10" />
                                <Skeleton className="h-3 w-1/2 bg-white/10" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full bg-white/10" />
                        <Skeleton className="h-9 w-full rounded-lg bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}
