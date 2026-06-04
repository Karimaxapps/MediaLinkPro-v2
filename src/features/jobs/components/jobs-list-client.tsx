"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Building2, MapPin, Filter, X, Globe } from "lucide-react";
import { JOB_TYPE_COLORS, JOB_TYPE_LABELS, type Job, type JobType } from "../types";
import { CreateGate } from "@/components/subscription/create-gate";
import type { Quota } from "@/features/billing/server/usage";

type Props = {
  jobs: Job[];
  canPost: boolean;
  hasOrg?: boolean;
  jobsQuota?: Quota | null;
};

export function JobsListClient({ jobs, canPost, hasOrg = false, jobsQuota = null }: Props) {
  const t = useTranslations("jobs");
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null);
  // `canPost` is kept for backward compat but the unified gate below drives
  // both the no-org and quota states.
  void canPost;

  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const clear = () => {
    setSelectedTypes([]);
    setRemoteFilter(null);
  };

  const hasFilters = selectedTypes.length > 0 || remoteFilter !== null;

  const filtered = useMemo(() => {
    let result = [...jobs];
    if (selectedTypes.length) {
      result = result.filter((j) => selectedTypes.includes(j.job_type));
    }
    if (remoteFilter !== null) {
      result = result.filter((j) => Boolean(j.is_remote) === remoteFilter);
    }
    return result;
  }, [jobs, selectedTypes, remoteFilter]);

  const jobTypeKeys = Object.keys(JOB_TYPE_LABELS) as JobType[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("title")}</h1>
          <p className="text-sm text-gray-400">
            {t("listSubtitle")}
            <span className="text-gray-500 ml-2">{t("roleCount", { count: filtered.length })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link href="/jobs/my-applications">
            <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
              {t("myApplications")}
            </Button>
          </Link>
          <CreateGate
            noun="job"
            nounPlural="jobs"
            href="/jobs/new"
            label={t("postAJob")}
            hasOrg={hasOrg}
            quota={jobsQuota}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>{t("typeFilter")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {jobTypeKeys.map((key) => {
            const active = selectedTypes.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  active
                    ? "text-black font-medium"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
                style={
                  active
                    ? { backgroundColor: JOB_TYPE_COLORS[key], borderColor: JOB_TYPE_COLORS[key] }
                    : undefined
                }
              >
                {t(`jobTypes.${key}`)}
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

        {hasFilters && (
          <button
            onClick={clear}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("clear")}
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title={t("noMatchTitle")}
          description={hasFilters ? t("noMatchFiltered") : t("noMatchEmpty")}
          actionLabel={hasFilters ? t("clearFilters") : undefined}
          onAction={hasFilters ? clear : undefined}
        />
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const t = useTranslations("jobs");
  const color = JOB_TYPE_COLORS[job.job_type];
  const salary = formatSalary(job, t);
  return (
    <Link
      href={`/jobs/${job.organizations?.slug ?? "co"}/${job.slug}`}
      className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] p-5 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
          {job.organizations?.logo_url ? (
            <Image
              src={job.organizations.logo_url}
              alt={job.organizations.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <Building2 className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-[var(--brand)] line-clamp-2 transition-colors">
              {job.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {t(`jobTypes.${job.job_type}`)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.organizations?.name ?? t("unknown")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.is_remote ? t("remote") : job.location || t("unspecified")}
            </span>
            {salary && <span className="text-[var(--brand)]">{salary}</span>}
          </div>
          {job.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{stripHtml(job.description)}</p>
          )}
          <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            <span>{t("applicantCount", { count: job.application_count })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatSalary(job: Job, t: ReturnType<typeof useTranslations<"jobs">>): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.currency ?? "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  if (job.salary_min && job.salary_max)
    return `${currency} ${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
  if (job.salary_min) return `${currency} ${fmt(job.salary_min)}+`;
  if (job.salary_max) return t("salaryUpTo", { value: `${currency} ${fmt(job.salary_max)}` });
  return null;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
