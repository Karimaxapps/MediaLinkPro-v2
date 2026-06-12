"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Inbox, MessageSquare, User } from "lucide-react";
import { INTEREST_STATUS_COLORS, type MarketRequestInterest } from "../types";
import { withdrawInterest } from "../server/actions";

type Props = {
  interests: MarketRequestInterest[];
};

export function MyInterestsClient({ interests }: Props) {
  const t = useTranslations("requestsMarket");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            {t("myInterestsTitle")}
          </h1>
          <p className="text-sm text-gray-400">{t("myInterestsSubtitle")}</p>
        </div>
        <Link href="/requests">
          <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
            {t("browseRequests")}
          </Button>
        </Link>
      </div>

      {interests.length === 0 ? (
        <EmptyState icon={Inbox} title={t("noInterestsSent")} description={t("listSubtitle")} />
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <MyInterestRow key={interest.id} interest={interest} />
          ))}
        </div>
      )}
    </div>
  );
}

function MyInterestRow({ interest }: { interest: MarketRequestInterest }) {
  const t = useTranslations("requestsMarket");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const request = interest.market_requests;
  const statusColor = INTEREST_STATUS_COLORS[interest.status];

  const handleWithdraw = () => {
    startTransition(async () => {
      const result = await withdrawInterest(interest.id);
      if (result.success) {
        toast.success(t("toastWithdrawn"));
        router.refresh();
      } else {
        toast.error(result.error ?? t("toastUpdateFailed"));
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {request ? (
            <Link
              href={`/requests/${request.slug}`}
              className="font-semibold text-white hover:text-[var(--brand)] transition-colors"
            >
              {request.title}
            </Link>
          ) : (
            <span className="font-semibold text-white">—</span>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border"
            style={{
              color: statusColor,
              borderColor: `${statusColor}40`,
              backgroundColor: `${statusColor}1a`,
            }}
          >
            {t(`interestStatuses.${interest.status}`)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
          {interest.organizations ? (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {t("respondedAs", { name: interest.organizations.name })}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {t("respondedAs", { name: t("myself") })}
            </span>
          )}
          <span>{formatDistanceToNow(new Date(interest.created_at), { addSuffix: true })}</span>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mt-2">{interest.pitch}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {interest.conversation_id && (
          <Link href={`/messages?id=${interest.conversation_id}`}>
            <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-xs h-8">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {t("openConversation")}
            </Button>
          </Link>
        )}
        {interest.status === "pending" && (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={handleWithdraw}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
          >
            {t("withdraw")}
          </Button>
        )}
      </div>
    </div>
  );
}
