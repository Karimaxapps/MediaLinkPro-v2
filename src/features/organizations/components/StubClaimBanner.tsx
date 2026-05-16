import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function StubClaimBanner({ slug }: { slug: string }) {
  return (
    <div className="rounded-xl border border-[#C6A85E]/40 bg-[#C6A85E]/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start sm:items-center gap-3 flex-1">
        <div className="rounded-lg bg-[#C6A85E]/20 p-2 text-[#C6A85E] shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            This company profile is unclaimed.
          </p>
          <p className="text-sm text-gray-300 mt-0.5">
            Are you the owner? Claim it to manage the page, add products, and
            connect with media pros.
          </p>
        </div>
      </div>
      <Link
        href={`/companies/${slug}/claim`}
        className="inline-flex items-center justify-center rounded-lg bg-[#C6A85E] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B5964A] transition-colors whitespace-nowrap"
      >
        Claim this company
      </Link>
    </div>
  );
}
