import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
    return (
        <div className="space-y-8">
            {/* Company header */}
            <div className="flex items-start gap-6">
                <Skeleton className="h-20 w-20 rounded-xl bg-white/5" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-56 bg-white/5" />
                    <Skeleton className="h-4 w-40 bg-white/5" />
                    <Skeleton className="h-4 w-72 bg-white/5" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 bg-white/5" />
                ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
                    <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
                </div>
            </div>
        </div>
    );
}
