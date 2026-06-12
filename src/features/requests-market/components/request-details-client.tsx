"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  MapPin,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import {
  INTEREST_STATUS_COLORS,
  REQUEST_CATEGORY_COLORS,
  type MarketRequest,
  type MarketRequestInterest,
} from "../types";
import { ExpressInterestDialog } from "./express-interest-dialog";
import { formatBudget } from "./requests-list-client";

type Org = { id: string; name: string; slug: string; logo_url: string | null };

type Props = {
  request: MarketRequest;
  myInterest: MarketRequestInterest | null;
  isOwner: boolean;
  organizations: Org[];
};

export function RequestDetailsClient({ request, myInterest, isOwner, organizations }: Props) {
  const t = useTranslations("requestsMarket");
  const [showDialog, setShowDialog] = useState(false);
  const [sent, setSent] = useState(false);

  const color = REQUEST_CATEGORY_COLORS[request.category];
  const budget = formatBudget(request, t);
  const posterName = request.organizations
    ? request.organizations.name
    : (request.profiles?.full_name ?? request.profiles?.username ?? t("unknown"));
  const posterUrl = request.organizations
    ? `/companies/${request.organizations.slug}`
    : request.profiles?.username
      ? `/profiles/${request.profiles.username}`
      : null;
  const posterLogo = request.organizations?.logo_url ?? request.profiles?.avatar_url ?? null;

  const interested = sent || !!myInterest;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 flex-shrink-0 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
            {posterLogo ? (
              <Image
                src={posterLogo}
                alt={posterName}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : request.organizations ? (
              <Building2 className="h-6 w-6 text-gray-500" />
            ) : (
              <User className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-white">{request.title}</h1>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {t(`categories.${request.category}`)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
              {posterUrl ? (
                <Link href={posterUrl} className="hover:text-[var(--brand)] transition-colors">
                  {posterName}
                </Link>
              ) : (
                <span>{posterName}</span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {request.is_remote ? t("remote") : request.location || t("unspecified")}
              </span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Facts */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm border-y border-white/10 py-3">
          {budget && (
            <div>
              <span className="text-gray-500">{t("budget")}: </span>
              <span className="text-[var(--brand)] font-medium">{budget}</span>
            </div>
          )}
          {request.deadline && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <CalendarClock className="h-4 w-4 text-gray-500" />
              {t("neededByDate", { date: format(new Date(request.deadline), "PP") })}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-300">
            <Users className="h-4 w-4 text-gray-500" />
            {t("interestCount", { count: request.interest_count })}
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        )}

        {/* Skills */}
        {request.skills && request.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {request.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          {isOwner ? (
            <Link href={`/requests/manage/${request.id}`}>
              <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium">
                <Users className="h-4 w-4 mr-1.5" />
                {t("viewInterests")}
              </Button>
            </Link>
          ) : request.status !== "open" ? (
            <p className="text-sm text-gray-500">{t("requestClosed")}</p>
          ) : interested ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-[#10b981]">
                <CheckCircle2 className="h-4 w-4" />
                {t("alreadyInterested")}
              </span>
              {myInterest && (
                <span
                  className="text-xs px-2 py-0.5 rounded border"
                  style={{
                    color: INTEREST_STATUS_COLORS[myInterest.status],
                    borderColor: `${INTEREST_STATUS_COLORS[myInterest.status]}40`,
                    backgroundColor: `${INTEREST_STATUS_COLORS[myInterest.status]}1a`,
                  }}
                >
                  {t(`interestStatuses.${myInterest.status}`)}
                </span>
              )}
              {myInterest?.conversation_id && (
                <Link href={`/messages?id=${myInterest.conversation_id}`}>
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/10 text-white hover:bg-white/10"
                  >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    {t("openConversation")}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              {t("expressInterest")}
            </Button>
          )}
        </div>
      </div>

      {showDialog && (
        <ExpressInterestDialog
          requestId={request.id}
          requestTitle={request.title}
          organizations={organizations.filter((o) => o.id !== request.organization_id)}
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            setSent(true);
          }}
        />
      )}
    </div>
  );
}
