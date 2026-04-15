import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white px-4">
            {/* Background visual flair */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C6A85E]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#135bec]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center">
                <h1 className="text-8xl font-bold text-[#C6A85E] mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-medium rounded-lg transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/10"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
