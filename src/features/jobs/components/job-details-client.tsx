"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
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
  APPLICATION_STATUS_LABELS,
  JOB_TYPE_COLORS,
  JOB_TYPE_LABELS,
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
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(Boolean(myApplication));

  const color = JOB_TYPE_COLORS[job.job_type];
  const salary = formatSalary(job);
  const isOpen = job.status === "open";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to jobs
      </Link>

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
                  className="text-[#C6A85E] hover:underline text-sm"
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
            {JOB_TYPE_LABELS[job.job_type]}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <InfoTile
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={job.is_remote ? "Remote" : job.location || "—"}
          />
          <InfoTile
            icon={<Briefcase className="h-4 w-4" />}
            label="Department"
            value={job.department || "—"}
          />
          <InfoTile
            icon={<Globe className="h-4 w-4" />}
            label="Salary"
            value={salary || "Not specified"}
          />
          <InfoTile
            icon={<Users className="h-4 w-4" />}
            label="Applicants"
            value={`${job.application_count}`}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <Link href={`/jobs/manage/${job.id}`}>
                <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium">
                  Manage applications
                </Button>
              </Link>
            )}
            {!isOpen ? (
              <span className="text-sm text-gray-400">
                This role is no longer accepting applications.
              </span>
            ) : applied ? (
              <AppliedBadge application={myApplication} />
            ) : currentUserId ? (
              <Button
                onClick={() => setApplyOpen(true)}
                className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
              >
                Apply now
              </Button>
            ) : (
              <Link href="/auth">
                <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium">
                  Sign in to apply
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Required skills</h2>
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
          <h2 className="text-lg font-semibold text-white mb-3">About this role</h2>
          <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
            {job.description}
          </div>
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
  const status = application?.status ?? "submitted";
  const label = APPLICATION_STATUS_LABELS[status];
  const color = APPLICATION_STATUS_COLORS[status];
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10">
      <Check className="h-4 w-4 text-[#10b981]" />
      <span className="text-sm text-gray-300">You applied</span>
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
