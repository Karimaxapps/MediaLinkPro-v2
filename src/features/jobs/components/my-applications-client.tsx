"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Building2, CalendarClock, FileText, Link2, MessageSquare } from "lucide-react";
import { withdrawApplication } from "../server/actions";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  type JobApplication,
} from "../types";

export function MyApplicationsClient({ applications }: { applications: JobApplication[] }) {
  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Header />
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Browse open roles and submit your first application."
          actionLabel="Browse jobs"
          onAction={() => (window.location.href = "/jobs")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Header />
      <div className="space-y-3">
        {applications.map((app) => (
          <ApplicationRow key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white mb-1">My applications</h1>
      <p className="text-sm text-gray-400">Track the status of jobs you&apos;ve applied to.</p>
    </div>
  );
}

function ApplicationRow({ application }: { application: JobApplication }) {
  const [isPending, startTransition] = useTransition();
  const job = application.jobs;
  const org = job?.organizations;
  const status = application.status;
  const statusLabel = APPLICATION_STATUS_LABELS[status];
  const statusColor = APPLICATION_STATUS_COLORS[status];

  const onWithdraw = () => {
    if (!confirm("Withdraw your application? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await withdrawApplication(application.id);
      if (result.success) {
        toast.success("Application withdrawn");
      } else {
        toast.error(result.error ?? "Failed to withdraw");
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-md border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {org?.logo_url ? (
              <Image
                src={org.logo_url}
                alt={org.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <Building2 className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <div className="min-w-0">
            {job && org ? (
              <Link
                href={`/jobs/${org.slug}/${job.slug}`}
                className="font-semibold text-white hover:text-[#C6A85E] transition-colors truncate block"
              >
                {job.title}
              </Link>
            ) : (
              <div className="font-semibold text-white">Unknown role</div>
            )}
            <div className="text-xs text-gray-500">
              {org?.name ?? "Unknown"} · Applied{" "}
              {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <a
          href={application.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
        >
          {application.resume_type === "pdf" ? (
            <FileText className="h-4 w-4 text-[#C6A85E]" />
          ) : (
            <Link2 className="h-4 w-4 text-[#C6A85E]" />
          )}
          View your resume
        </a>
        {application.interview_scheduled_at && (
          <div className="flex items-center gap-2 rounded-md border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-2 text-gray-200">
            <CalendarClock className="h-4 w-4 text-[#8b5cf6]" />
            Interview: {format(new Date(application.interview_scheduled_at), "PPpp")}
          </div>
        )}
      </div>

      {application.interview_location && (
        <div className="text-sm text-gray-400">
          <span className="text-gray-500">Location:</span> {application.interview_location}
        </div>
      )}
      {application.interview_notes && (
        <div className="text-sm text-gray-400 whitespace-pre-line">
          <span className="text-gray-500">Instructions:</span> {application.interview_notes}
        </div>
      )}

      {application.reply_message && (
        <div className="rounded-md border border-white/10 bg-black/20 p-3 text-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Message from the company
          </div>
          <div className="text-gray-200 whitespace-pre-line">{application.reply_message}</div>
        </div>
      )}

      {status !== "withdrawn" && status !== "rejected" && status !== "accepted" && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onWithdraw}
            disabled={isPending}
            className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 text-xs"
          >
            {isPending ? "Withdrawing..." : "Withdraw application"}
          </Button>
        </div>
      )}
    </div>
  );
}
