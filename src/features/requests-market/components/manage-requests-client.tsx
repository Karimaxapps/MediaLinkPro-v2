"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, ExternalLink, Megaphone, Trash2, User, Users } from "lucide-react";
import {
  REQUEST_CATEGORY_COLORS,
  type MarketRequest,
  type MarketRequestStatus,
} from "../types";
import { deleteRequest, updateRequestStatus } from "../server/actions";

type Props = {
  requests: MarketRequest[];
};

export function ManageRequestsClient({ requests }: Props) {
  const t = useTranslations("requestsMarket");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("manageTitle")}</h1>
          <p className="text-sm text-gray-400">{t("manageSubtitle")}</p>
        </div>
        <Link href="/requests/new">
          <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
            {t("postARequest")}
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t("noRequestsYet")}
          description={t("newSubtitle")}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <ManageRequestRow key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}

function ManageRequestRow({ request }: { request: MarketRequest }) {
  const t = useTranslations("requestsMarket");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const color = REQUEST_CATEGORY_COLORS[request.category];

  const setStatus = (status: MarketRequestStatus) => {
    startTransition(async () => {
      const result = await updateRequestStatus(request.id, status);
      if (result.success) {
        toast.success(t("toastUpdated"));
        router.refresh();
      } else {
        toast.error(result.error ?? t("toastUpdateFailed"));
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      const result = await deleteRequest(request.id);
      if (result.success) {
        toast.success(t("toastDeleted"));
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
          <Link
            href={`/requests/manage/${request.id}`}
            className="font-semibold text-white hover:text-[var(--brand)] transition-colors truncate"
          >
            {request.title}
          </Link>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {t(`categories.${request.category}`)}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
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
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
          {request.organizations ? (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {request.organizations.name}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {t("myself")}
            </span>
          )}
          <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
          <Link
            href={`/requests/manage/${request.id}`}
            className="flex items-center gap-1 text-gray-300 hover:text-[var(--brand)] transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            {t("interestCount", { count: request.interest_count })}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/requests/${request.slug}`}>
          <Button
            variant="outline"
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            {t("viewPublic")}
          </Button>
        </Link>
        <Link href={`/requests/manage/${request.id}`}>
          <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-xs h-8">
            <Users className="h-3.5 w-3.5 mr-1" />
            {t("viewInterests")}
          </Button>
        </Link>
        {request.status === "open" ? (
          <>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setStatus("closed")}
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
            >
              {t("close")}
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setStatus("fulfilled")}
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
            >
              {t("markFulfilled")}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => setStatus("open")}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8"
          >
            {t("reopen")}
          </Button>
        )}
        <Button
          variant="outline"
          disabled={isPending}
          onClick={handleDelete}
          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
