"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { UsagePill } from "@/components/subscription/usage-pill";
import {
  Building2,
  Filter,
  Globe,
  MapPin,
  Megaphone,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import {
  REQUEST_CATEGORY_COLORS,
  type MarketRequest,
  type MarketRequestCategory,
} from "../types";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  requests: MarketRequest[];
  canManage: boolean;
  requestsQuota?: Quota | null;
};

const CATEGORY_KEYS: MarketRequestCategory[] = ["solution", "technology", "crew", "other"];

export function RequestsListClient({ requests, canManage, requestsQuota = null }: Props) {
  const t = useTranslations("requestsMarket");
  const [selectedCategories, setSelectedCategories] = useState<MarketRequestCategory[]>([]);
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  const toggleCategory = (c: MarketRequestCategory) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const clear = () => {
    setSelectedCategories([]);
    setRemoteFilter(null);
    setSearch("");
  };

  const hasFilters = selectedCategories.length > 0 || remoteFilter !== null || !!search.trim();

  const filtered = useMemo(() => {
    let result = [...requests];
    if (selectedCategories.length) {
      result = result.filter((r) => selectedCategories.includes(r.category));
    }
    if (remoteFilter !== null) {
      result = result.filter((r) => Boolean(r.is_remote) === remoteFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.skills ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [requests, selectedCategories, remoteFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("title")}</h1>
          <p className="text-sm text-gray-400">
            {t("listSubtitle")}
            <span className="text-gray-500 ml-2">
              {t("requestCount", { count: filtered.length })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link href="/requests/my-interests">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 whitespace-nowrap"
            >
              {t("myInterests")}
            </Button>
          </Link>
          {canManage && (
            <Link href="/requests/manage">
              <Button
                variant="outline"
                className="bg-transparent border-white/10 text-white hover:bg-white/10 whitespace-nowrap"
              >
                {t("manage")}
              </Button>
            </Link>
          )}
          {requestsQuota && <UsagePill quota={requestsQuota} noun="request" />}
          {requestsQuota?.exhausted ? (
            <Button
              disabled
              className="bg-[var(--brand)] text-black font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("postARequest")}
            </Button>
          ) : (
            <Link href="/requests/new">
              <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1.5" />
                {t("postARequest")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>{t("categoryFilter")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((key) => {
            const active = selectedCategories.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  active
                    ? "text-black font-medium"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: REQUEST_CATEGORY_COLORS[key],
                        borderColor: REQUEST_CATEGORY_COLORS[key],
                      }
                    : undefined
                }
              >
                {t(`categories.${key}`)}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex gap-2">
          <button
            onClick={() => setRemoteFilter(remoteFilter === true ? null : true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              remoteFilter === true
                ? "bg-[var(--brand-secondary)] text-white border-[var(--brand-secondary)]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            {t("remote")}
          </button>
          <button
            onClick={() => setRemoteFilter(remoteFilter === false ? null : false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              remoteFilter === false
                ? "bg-[#10b981] text-white border-[#10b981]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {t("onSite")}
          </button>
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-9 bg-black/20 border-white/10 text-white text-sm"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("clear")}
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title={t("noMatchTitle")}
          description={hasFilters ? t("noMatchFiltered") : t("noMatchEmpty")}
          actionLabel={hasFilters ? t("clearFilters") : undefined}
          onAction={hasFilters ? clear : undefined}
        />
      )}
    </div>
  );
}

export function RequestPosterBadge({ request }: { request: MarketRequest }) {
  const t = useTranslations("requestsMarket");
  if (request.organizations) {
    return (
      <span className="flex items-center gap-1">
        <Building2 className="h-3.5 w-3.5" />
        {request.organizations.name}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <User className="h-3.5 w-3.5" />
      {request.profiles?.full_name ?? request.profiles?.username ?? t("unknown")}
    </span>
  );
}

function RequestCard({ request }: { request: MarketRequest }) {
  const t = useTranslations("requestsMarket");
  const color = REQUEST_CATEGORY_COLORS[request.category];
  const budget = formatBudget(request, t);
  const posterLogo = request.organizations?.logo_url ?? request.profiles?.avatar_url ?? null;
  return (
    <Link
      href={`/requests/${request.slug}`}
      className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] p-5 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
          {posterLogo ? (
            <Image
              src={posterLogo}
              alt={request.organizations?.name ?? request.profiles?.full_name ?? ""}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : request.organizations ? (
            <Building2 className="h-5 w-5 text-gray-500" />
          ) : (
            <User className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-[var(--brand)] line-clamp-2 transition-colors">
              {request.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {t(`categories.${request.category}`)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <RequestPosterBadge request={request} />
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {request.is_remote ? t("remote") : request.location || t("unspecified")}
            </span>
            {budget && <span className="text-[var(--brand)]">{budget}</span>}
          </div>
          {request.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{stripHtml(request.description)}</p>
          )}
          <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
            <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
            <span>{t("interestCount", { count: request.interest_count })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function formatBudget(
  request: Pick<MarketRequest, "budget_min" | "budget_max" | "currency">,
  t: ReturnType<typeof useTranslations<"requestsMarket">>
): string | null {
  if (!request.budget_min && !request.budget_max) return null;
  const currency = request.currency ?? "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  if (request.budget_min && request.budget_max)
    return `${currency} ${fmt(request.budget_min)} – ${fmt(request.budget_max)}`;
  if (request.budget_min) return `${currency} ${fmt(request.budget_min)}+`;
  if (request.budget_max)
    return t("budgetUpTo", { value: `${currency} ${fmt(request.budget_max)}` });
  return null;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
