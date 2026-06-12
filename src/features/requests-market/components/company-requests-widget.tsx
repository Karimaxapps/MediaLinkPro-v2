import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listRecentInterestsForOrg, listRequestsForOrg } from "../server/actions";
import { INTEREST_STATUS_COLORS } from "../types";
import { UsagePill } from "@/components/subscription/usage-pill";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  orgId: string;
  requestsQuota?: Quota;
};

export async function CompanyRequestsWidget({ orgId, requestsQuota }: Props) {
  const [t, requests, interests] = await Promise.all([
    getTranslations("requestsMarket"),
    listRequestsForOrg(orgId),
    listRecentInterestsForOrg(orgId, 8),
  ]);

  const openRequests = requests.filter((r) => r.status === "open");
  const totalInterests = requests.reduce((sum, r) => sum + (r.interest_count ?? 0), 0);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--brand)]" />
            {t("widgetTitle")}
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t("requestCount", { count: requests.length })} · {openRequests.length}{" "}
            {t("requestStatuses.open").toLowerCase()} ·{" "}
            {t("interestCount", { count: totalInterests })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/requests/manage">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
            >
              {t("manageAll")}
            </Button>
          </Link>
          {requestsQuota && <UsagePill quota={requestsQuota} noun="request" />}
          {requestsQuota?.exhausted ? (
            <Button
              disabled
              className="bg-[var(--brand)] text-black font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("postARequest")}
            </Button>
          ) : (
            <Link href="/requests/new">
              <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t("postARequest")}
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recent requests */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {t("recentRequests")}
          </h3>
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t("noRequestsPosted")}</p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 5).map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/manage/${request.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--brand)]">
                        {request.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          request.status === "open"
                            ? "bg-[#10b981]/15 text-[#10b981]"
                            : request.status === "fulfilled"
                              ? "bg-[var(--brand)]/15 text-[var(--brand)]"
                              : "bg-gray-500/15 text-gray-400"
                        }`}
                      >
                        {t(`requestStatuses.${request.status}`)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                    <Users className="h-3.5 w-3.5" />
                    {request.interest_count ?? 0}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent interests */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {t("recentInterests")}
          </h3>
          {interests.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">{t("noInterestsReceived")}</p>
          ) : (
            <div className="space-y-2">
              {interests.map((interest) => {
                const senderName = interest.organizations
                  ? interest.organizations.name
                  : (interest.profiles?.full_name ?? interest.profiles?.username ?? "?");
                const senderAvatar =
                  interest.organizations?.logo_url ?? interest.profiles?.avatar_url ?? null;
                const statusColor = INTEREST_STATUS_COLORS[interest.status];
                return (
                  <Link
                    key={interest.id}
                    href={`/requests/manage/${interest.request_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors group"
                  >
                    <Avatar className="h-9 w-9 border border-white/10 shrink-0">
                      <AvatarImage src={senderAvatar ?? undefined} alt={senderName} />
                      <AvatarFallback className="bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] text-xs">
                        {senderName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--brand)]">
                        {senderName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {interest.market_requests?.title ?? "—"} ·{" "}
                        {formatDistanceToNow(new Date(interest.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded shrink-0 border"
                      style={{
                        color: statusColor,
                        borderColor: `${statusColor}40`,
                        backgroundColor: `${statusColor}1a`,
                      }}
                    >
                      {t(`interestStatuses.${interest.status}`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
