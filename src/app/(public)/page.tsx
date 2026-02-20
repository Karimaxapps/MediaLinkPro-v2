
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F14] text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          MediaLinkPro
        </h1>
        <p className="text-lg text-gray-400">
          Connect with top media professionals. Build your network.
        </p>
        <div className="pt-4">
          <Link href="/auth">
            <Button
              className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(198,168,94,0.3)] hover:shadow-[0_0_30px_rgba(198,168,94,0.5)]"
            >
              Enter Platform
            </Button>
          </Link>
        </div>
      </div>

      {/* Visual Flair / Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C6A85E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#135bec]/5 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
