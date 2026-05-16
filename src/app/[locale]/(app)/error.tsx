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
      <p className="text-gray-400 max-w-md mb-4">
        An unexpected error occurred. Please try again or return to the dashboard.
      </p>
      {/* TEMP DEBUG — remove once root cause is identified */}
      <details className="max-w-2xl w-full mb-6 text-left bg-red-500/5 border border-red-500/20 rounded-lg p-4">
        <summary className="cursor-pointer text-red-300 text-sm font-medium">
          Error details (temporary debug)
        </summary>
        <pre className="mt-3 text-xs text-red-200 whitespace-pre-wrap break-all">
          <strong>Message:</strong> {error.message}
          {error.digest && (
            <>
              {"\n"}
              <strong>Digest:</strong> {error.digest}
            </>
          )}
          {error.stack && (
            <>
              {"\n\n"}
              <strong>Stack:</strong>
              {"\n"}
              {error.stack}
            </>
          )}
        </pre>
      </details>
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
