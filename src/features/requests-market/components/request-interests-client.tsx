"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Building2, Inbox, MessageSquare } from "lucide-react";
import { INTEREST_STATUS_COLORS, type MarketRequest, type MarketRequestInterest } from "../types";
import { declineInterest, startConversationForInterest } from "../server/actions";

type Props = {
  request: MarketRequest;
  interests: MarketRequestInterest[];
};

export function RequestInterestsClient({ request, interests }: Props) {
  const t = useTranslations("requestsMarket");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/requests/manage"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("manageTitle")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          {t("interestsFor", { title: request.title })}
        </h1>
        <p className="text-sm text-gray-400">
          {t("interestCount", { count: interests.length })}
        </p>
      </div>

      {interests.length === 0 ? (
        <EmptyState icon={Inbox} title={t("noInterestsYet")} description={t("noInterestsHint")} />
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <InterestCard key={interest.id} interest={interest} />
          ))}
        </div>
      )}
    </div>
  );
}

function InterestCard({ interest }: { interest: MarketRequestInterest }) {
  const t = useTranslations("requestsMarket");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const senderName = interest.organizations
    ? interest.organizations.name
    : (interest.profiles?.full_name ?? interest.profiles?.username ?? t("unknown"));
  const senderUrl = interest.organizations
    ? `/companies/${interest.organizations.slug}`
    : interest.profiles?.username
      ? `/profiles/${interest.profiles.username}`
      : null;
  const senderAvatar = interest.organizations?.logo_url ?? interest.profiles?.avatar_url ?? null;
  const statusColor = INTEREST_STATUS_COLORS[interest.status];

  const handleStartConversation = () => {
    startTransition(async () => {
      const result = await startConversationForInterest(interest.id);
      if (result.success && result.conversationId) {
        toast.success(t("toastConversationStarted"));
        router.push(`/messages?id=${result.conversationId}`);
      } else {
        toast.error(result.error ?? t("toastConversationFailed"));
      }
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      const result = await declineInterest(interest.id);
      if (result.success) {
        toast.success(t("toastDeclined"));
        router.refresh();
      } else {
        toast.error(result.error ?? t("toastUpdateFailed"));
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
          <AvatarImage src={senderAvatar ?? undefined} alt={senderName} />
          <AvatarFallback className="bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] text-xs">
            {senderName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {senderUrl ? (
              <Link
                href={senderUrl}
                className="font-medium text-white hover:text-[var(--brand)] transition-colors"
              >
                {senderName}
              </Link>
            ) : (
              <span className="font-medium text-white">{senderName}</span>
            )}
            {interest.organizations && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Building2 className="h-3 w-3" />
                {t("company")}
              </span>
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
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDistanceToNow(new Date(interest.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed border-l-2 border-white/10 pl-3">
        {interest.pitch}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {interest.conversation_id ? (
          <Link href={`/messages?id=${interest.conversation_id}`}>
            <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-xs h-8">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {t("openConversation")}
            </Button>
          </Link>
        ) : (
          <>
            <Button
              disabled={isPending}
              onClick={handleStartConversation}
              className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-xs h-8"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {isPending ? t("starting") : t("startConversation")}
            </Button>
            {interest.status === "pending" && (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={handleDecline}
                className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
              >
                {t("decline")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
