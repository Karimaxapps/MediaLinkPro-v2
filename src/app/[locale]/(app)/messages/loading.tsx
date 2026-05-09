import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
    return (
        <div className="flex h-[calc(100vh-120px)] rounded-xl border border-white/10 overflow-hidden bg-white/5">
            {/* Conversation list */}
            <div className="w-80 border-r border-white/10 p-4 space-y-3">
                <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 bg-white/10" />
                            <Skeleton className="h-3 w-full bg-white/10" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Message area */}
            <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                        <Skeleton className="h-5 w-32 bg-white/10" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                            <Skeleton className={`h-12 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl bg-white/10`} />
                        </div>
                    ))}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-white/10">
                    <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
                </div>
            </div>
        </div>
    );
}
