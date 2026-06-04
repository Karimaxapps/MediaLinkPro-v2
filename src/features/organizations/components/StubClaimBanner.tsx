import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Clock } from "lucide-react";

interface StubClaimBannerProps {
  slug: string;
  alreadyClaimed?: boolean;
}

export async function StubClaimBanner({ slug, alreadyClaimed = false }: StubClaimBannerProps) {
  const t = await getTranslations("companies");
  return (
    <div className="rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start sm:items-center gap-3 flex-1">
        <div className="rounded-lg bg-[var(--brand)]/20 p-2 text-[var(--brand)] shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t("unclaimed")}</p>
          <p className="text-sm text-gray-300 mt-0.5">
            {alreadyClaimed ? t("claimPending") : t("claimPrompt")}
          </p>
        </div>
      </div>
      {alreadyClaimed ? (
        <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-gray-400 whitespace-nowrap cursor-not-allowed">
          <Clock className="h-4 w-4" />
          {t("requestPending")}
        </div>
      ) : (
        <Link
          href={`/companies/${slug}/claim`}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-black hover:bg-[#B5964A] transition-colors whitespace-nowrap"
        >
          {t("claimCompany")}
        </Link>
      )}
    </div>
  );
}
