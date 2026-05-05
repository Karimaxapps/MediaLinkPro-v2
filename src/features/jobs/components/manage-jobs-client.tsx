"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Building2, MapPin, Users } from "lucide-react";
import { deleteJob, updateJobStatus } from "../server/actions";
import {
  JOB_STATUS_LABELS,
  JOB_TYPE_COLORS,
  JOB_TYPE_LABELS,
  type Job,
  type JobStatus,
} from "../types";

export function ManageJobsClient({ jobs }: { jobs: Job[] }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Manage jobs</h1>
          <p className="text-sm text-gray-400">Your company postings and candidate submissions.</p>
        </div>
        <Link href="/jobs/new">
          <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium">
            Post a job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Publish your first opening to start receiving applications."
          actionLabel="Post a job"
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
  const [isPending, startTransition] = useTransition();
  const color = JOB_TYPE_COLORS[job.job_type];

  const onStatus = (status: JobStatus) => {
    startTransition(async () => {
      const result = await updateJobStatus(job.id, status);
      if (result.success) {
        toast.success(`Job marked as ${JOB_STATUS_LABELS[status].toLowerCase()}`);
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  const onDelete = () => {
    if (!confirm(`Delete "${job.title}"? This will also remove all applications to this job.`))
      return;
    startTransition(async () => {
      const result = await deleteJob(job.id);
      if (result.success) {
        toast.success("Job deleted");
      } else {
        toast.error(result.error ?? "Failed to delete");
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
              className="text-lg font-semibold text-white hover:text-[#C6A85E] transition-colors"
            >
              {job.title}
            </Link>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                job.status === "open"
                  ? "bg-[#10b981]/15 text-[#10b981]"
                  : job.status === "closed"
                    ? "bg-gray-500/15 text-gray-400"
                    : "bg-[#C6A85E]/15 text-[#C6A85E]"
              }`}
            >
              {JOB_STATUS_LABELS[job.status]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1.5">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.organizations?.name ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.is_remote ? "Remote" : job.location || "—"}
            </span>
            <span className="flex items-center gap-1 text-[#C6A85E]">
              <Users className="h-3.5 w-3.5" />
              {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
            </span>
            <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
        <Link href={`/jobs/manage/${job.id}`}>
          <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium text-sm">
            View applications ({job.application_count})
          </Button>
        </Link>
        {job.organizations && (
          <Link href={`/jobs/${job.organizations.slug}/${job.slug}`}>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-sm"
            >
              Preview posting
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
            Close job
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => onStatus("open")}
            disabled={isPending}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-sm"
          >
            Reopen
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onDelete}
          disabled={isPending}
          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm ml-auto"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
