"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { ApplyJobDialog } from "./apply-job-dialog";
import {
  APPLICATION_STATUS_COLORS,
  JOB_TYPE_COLORS,
  type Job,
  type JobApplication,
} from "../types";

type Props = {
  job: Job;
  currentUserId: string | null;
  myApplication: JobApplication | null;
  canManage: boolean;
};

export function JobDetailsClient({ job, currentUserId, myApplication, canManage }: Props) {
  const t = useTranslations("jobs");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(Boolean(myApplication));

  const color = JOB_TYPE_COLORS[job.job_type];
  const salary = formatSalary(job);
  const isOpen = job.status === "open";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 flex-shrink-0 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
              {job.organizations?.logo_url ? (
                <Image
                  src={job.organizations.logo_url}
                  alt={job.organizations.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Building2 className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              {job.organizations && (
                <Link
                  href={`/companies/${job.organizations.slug}`}
                  className="text-[var(--brand)] hover:underline text-sm"
                >
                  {job.organizations.name}
                </Link>
              )}
              {job.organizations?.tagline && (
                <p className="text-xs text-gray-500 mt-1">{job.organizations.tagline}</p>
              )}
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {t(`jobTypes.${job.job_type}`)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoTile
            icon={<MapPin className="h-4 w-4" />}
            label={t("location")}
            value={job.is_remote ? t("remote") : job.location || "—"}
          />
          <InfoTile
            icon={<Briefcase className="h-4 w-4" />}
            label={t("department")}
            value={job.department || "—"}
          />
          <InfoTile
            icon={<Globe className="h-4 w-4" />}
            label={t("salary")}
            value={salary || t("notSpecified")}
          />
          <InfoTile
            icon={<Users className="h-4 w-4" />}
            label={t("applicants")}
            value={`${job.application_count}`}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            {t("postedRelative", {
              time: formatDistanceToNow(new Date(job.created_at), { addSuffix: true }),
            })}
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <Link href={`/jobs/manage/${job.id}`}>
                <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium">
                  {t("manageApplications")}
                </Button>
              </Link>
            )}
            {!isOpen ? (
              <span className="text-sm text-gray-400">{t("roleClosed")}</span>
            ) : applied ? (
              <AppliedBadge application={myApplication} />
            ) : currentUserId ? (
              <Button
                onClick={() => setApplyOpen(true)}
                className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
              >
                {t("applyNow")}
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium">
                  {t("signInToApply")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">{t("requiredSkills")}</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {job.description && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">{t("aboutRole")}</h2>
          <div
            className="text-sm text-gray-300 leading-relaxed space-y-4
              [&_p]:my-3
              [&_strong]:text-white [&_strong]:font-semibold
              [&_em]:italic
              [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-5 [&_h3]:mb-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1
              [&_li]:marker:text-[var(--brand)]
              [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--brand)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-3
              [&_a]:text-[var(--brand)] [&_a]:underline [&_a]:underline-offset-2
              [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
          />
        </div>
      )}

      {applyOpen && currentUserId && (
        <ApplyJobDialog
          jobId={job.id}
          jobTitle={job.title}
          userId={currentUserId}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => {
            setApplyOpen(false);
            setApplied(true);
          }}
        />
      )}
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm text-white font-medium truncate">{value}</div>
    </div>
  );
}

function AppliedBadge({ application }: { application: JobApplication | null }) {
  const t = useTranslations("jobs");
  const status = application?.status ?? "submitted";
  const label = t(`appStatuses.${status}`);
  const color = APPLICATION_STATUS_COLORS[status];
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10">
      <Check className="h-4 w-4 text-[#10b981]" />
      <span className="text-sm text-gray-300">{t("youApplied")}</span>
      <span
        className="px-2 py-0.5 rounded text-xs font-medium"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </span>
    </div>
  );
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.currency ?? "USD";
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  if (job.salary_min && job.salary_max)
    return `${currency} ${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
  if (job.salary_min) return `${currency} ${fmt(job.salary_min)}+`;
  if (job.salary_max) return `Up to ${currency} ${fmt(job.salary_max)}`;
  return null;
}
