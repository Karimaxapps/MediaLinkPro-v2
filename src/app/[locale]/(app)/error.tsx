"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("App error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
                <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 max-w-md mb-8">
                An unexpected error occurred. Please try again or return to the dashboard.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-medium rounded-lg transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/10"
                >
                    <Home className="h-4 w-4" />
                    Dashboard
                </Link>
            </div>
        </div>
    );
}
