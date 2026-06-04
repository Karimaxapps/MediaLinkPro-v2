"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Building2, MapPin, Users } from "lucide-react";
import { deleteJob, updateJobStatus } from "../server/actions";
import { JOB_TYPE_COLORS, type Job, type JobStatus } from "../types";

export function ManageJobsClient({ jobs }: { jobs: Job[] }) {
  const t = useTranslations("jobs");
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{t("manageTitle")}</h1>
          <p className="text-sm text-gray-400">{t("manageSubtitle")}</p>
        </div>
        <Link href="/jobs/new">
          <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium">
            {t("postAJob")}
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("noJobsPostedTitle")}
          description={t("noJobsPostedDesc")}
          actionLabel={t("postAJob")}
          onAction={() => (window.location.href = "/jobs/new")}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  const t = useTranslations("jobs");
  const [isPending, startTransition] = useTransition();
  const color = JOB_TYPE_COLORS[job.job_type];

  const onStatus = (status: JobStatus) => {
    startTransition(async () => {
      const result = await updateJobStatus(job.id, status);
      if (result.success) {
        toast.success(t("toastJobMarked", { status: t(`jobStatuses.${status}`).toLowerCase() }));
      } else {
        toast.error(result.error ?? t("toastUpdateFailed"));
      }
    });
  };

  const onDelete = () => {
    if (!confirm(t("confirmDelete", { title: job.title }))) return;
    startTransition(async () => {
      const result = await deleteJob(job.id);
      if (result.success) {
        toast.success(t("toastJobDeleted"));
      } else {
        toast.error(result.error ?? t("toastDeleteFailed"));
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/jobs/manage/${job.id}`}
              className="text-lg font-semibold text-white hover:text-[var(--brand)] transition-colors"
            >
              {job.title}
            </Link>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {t(`jobTypes.${job.job_type}`)}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                job.status === "open"
                  ? "bg-[#10b981]/15 text-[#10b981]"
                  : job.status === "closed"
                    ? "bg-gray-500/15 text-gray-400"
                    : "bg-[var(--brand)]/15 text-[var(--brand)]"
              }`}
            >
              {t(`jobStatuses.${job.status}`)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1.5">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.organizations?.name ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.is_remote ? t("remote") : job.location || "—"}
            </span>
            <span className="flex items-center gap-1 text-[var(--brand)]">
              <Users className="h-3.5 w-3.5" />
              {t("applicantCount", { count: job.application_count })}
            </span>
            <span>
              {t("postedRelative", {
                time: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
        <Link href={`/jobs/manage/${job.id}`}>
          <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium text-sm">
            {t("viewApplicationsCount", { count: job.application_count })}
          </Button>
        </Link>
        {job.organizations && (
          <Link href={`/jobs/${job.organizations.slug}/${job.slug}`}>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-sm"
            >
              {t("previewPosting")}
            </Button>
          </Link>
        )}
        {job.status === "open" ? (
          <Button
            variant="outline"
            onClick={() => onStatus("closed")}
            disabled={isPending}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-sm"
          >
            {t("closeJob")}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => onStatus("open")}
            disabled={isPending}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-sm"
          >
            {t("reopen")}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onDelete}
          disabled={isPending}
          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm ml-auto"
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
