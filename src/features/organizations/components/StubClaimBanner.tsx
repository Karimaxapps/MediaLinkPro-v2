import Link from "next/link";
import { ShieldCheck, Clock } from "lucide-react";

interface StubClaimBannerProps {
  slug: string;
  alreadyClaimed?: boolean;
}

export function StubClaimBanner({ slug, alreadyClaimed = false }: StubClaimBannerProps) {
  return (
    <div className="rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start sm:items-center gap-3 flex-1">
        <div className="rounded-lg bg-[var(--brand)]/20 p-2 text-[var(--brand)] shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            This company profile is unclaimed.
          </p>
          <p className="text-sm text-gray-300 mt-0.5">
            {alreadyClaimed
              ? "Your claim request is pending review by our team."
              : "Are you the owner? Claim it to manage the page, add products, and connect with media pros."}
          </p>
        </div>
      </div>
      {alreadyClaimed ? (
        <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-gray-400 whitespace-nowrap cursor-not-allowed">
          <Clock className="h-4 w-4" />
          Request Pending
        </div>
      ) : (
        <Link
          href={`/companies/${slug}/claim`}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B5964A] transition-colors whitespace-nowrap"
        >
          Claim this company
        </Link>
      )}
    </div>
  );
}
