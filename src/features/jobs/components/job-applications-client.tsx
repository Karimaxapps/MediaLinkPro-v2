"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Link2,
  Mail,
  MessageSquare,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { replyToApplication, scheduleInterview, updateApplicationStatus } from "../server/actions";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  type Job,
  type JobApplication,
  type JobApplicationStatus,
} from "../types";

type Props = {
  job: Job;
  applications: JobApplication[];
};

export function JobApplicationsClient({ job, applications }: Props) {
  const [filter, setFilter] = useState<JobApplicationStatus | "all">("all");

  const filtered =
    filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/jobs/manage"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to manage jobs
      </Link>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
        <p className="text-sm text-gray-400">
          {job.organizations?.name ?? "—"} ·{" "}
          <span className="text-[#C6A85E]">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </span>
        </p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {(Object.keys(APPLICATION_STATUS_LABELS) as JobApplicationStatus[]).map((key) => (
          <FilterChip
            key={key}
            active={filter === key}
            onClick={() => setFilter(key)}
            label={APPLICATION_STATUS_LABELS[key]}
            color={APPLICATION_STATUS_COLORS[key]}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applications here"
          description={
            filter === "all"
              ? "No one has applied yet. Share the posting to attract candidates."
              : "No applications match this filter."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
        active
          ? "text-black font-medium"
          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
      }`}
      style={
        active
          ? { backgroundColor: color ?? "#C6A85E", borderColor: color ?? "#C6A85E" }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function ApplicationCard({ application }: { application: JobApplication }) {
  const [isPending, startTransition] = useTransition();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const applicant = application.profiles;
  const statusColor = APPLICATION_STATUS_COLORS[application.status];

  const quickStatus = (status: JobApplicationStatus) => {
    startTransition(async () => {
      const result = await updateApplicationStatus(application.id, status);
      if (result.success) {
        toast.success(`Marked as ${APPLICATION_STATUS_LABELS[status].toLowerCase()}`);
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {applicant?.avatar_url ? (
              <Image
                src={applicant.avatar_url}
                alt={applicant.full_name ?? ""}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-sm text-gray-400">
                {(applicant?.full_name ?? applicant?.username ?? "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            {applicant?.username ? (
              <Link
                href={`/profiles/${applicant.username}`}
                className="font-semibold text-white hover:text-[#C6A85E] transition-colors"
              >
                {applicant.full_name ?? applicant.username}
              </Link>
            ) : (
              <div className="font-semibold text-white">{applicant?.full_name ?? "Anonymous"}</div>
            )}
            {applicant?.headline && (
              <div className="text-xs text-gray-500">{applicant.headline}</div>
            )}
            <div className="text-xs text-gray-500">
              Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {APPLICATION_STATUS_LABELS[application.status]}
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
          Open resume
        </a>
        {application.phone && (
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-gray-300">
            <Mail className="h-4 w-4 text-[#C6A85E]" />
            {application.phone}
          </div>
        )}
      </div>

      {application.cover_letter && (
        <div className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-gray-300 whitespace-pre-line">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Cover letter
          </div>
          {application.cover_letter}
        </div>
      )}

      {application.interview_scheduled_at && (
        <div className="rounded-md border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 p-3 text-sm text-gray-200">
          <div className="flex items-center gap-2 text-xs text-[#8b5cf6] mb-1.5 font-medium">
            <CalendarClock className="h-3.5 w-3.5" />
            Interview scheduled
          </div>
          <div>{format(new Date(application.interview_scheduled_at), "PPpp")}</div>
          {application.interview_location && (
            <div className="text-gray-400">Location: {application.interview_location}</div>
          )}
          {application.interview_notes && (
            <div className="text-gray-400 whitespace-pre-line mt-1">
              {application.interview_notes}
            </div>
          )}
        </div>
      )}

      {application.reply_message && (
        <div className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-gray-300 whitespace-pre-line">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Your reply
          </div>
          {application.reply_message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
        {application.status === "submitted" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => quickStatus("reviewed")}
            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
          >
            Mark reviewed
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInterviewOpen(true)}
          className="bg-transparent border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 text-xs"
        >
          <CalendarClock className="h-3.5 w-3.5 mr-1" />
          Schedule interview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReplyOpen(true)}
          className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => quickStatus("accepted")}
          className="bg-transparent border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/10 text-xs ml-auto"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => quickStatus("rejected")}
          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Reject
        </Button>
      </div>

      {interviewOpen && (
        <ScheduleInterviewDialog
          application={application}
          onClose={() => setInterviewOpen(false)}
        />
      )}
      {replyOpen && <ReplyDialog application={application} onClose={() => setReplyOpen(false)} />}
    </div>
  );
}

function ScheduleInterviewDialog({
  application,
  onClose,
}: {
  application: JobApplication;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const initialWhen = application.interview_scheduled_at
    ? new Date(application.interview_scheduled_at).toISOString().slice(0, 16)
    : "";
  const [when, setWhen] = useState(initialWhen);
  const [location, setLocation] = useState(application.interview_location ?? "");
  const [notes, setNotes] = useState(application.interview_notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!when) {
      toast.error("Please pick a date and time.");
      return;
    }
    startTransition(async () => {
      const result = await scheduleInterview({
        application_id: application.id,
        interview_scheduled_at: new Date(when).toISOString(),
        interview_location: location || undefined,
        interview_notes: notes || undefined,
      });
      if (result.success) {
        toast.success("Interview scheduled and candidate notified");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to schedule");
      }
    });
  };

  return (
    <ModalShell title="Schedule interview" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Date & time *</Label>
          <Input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="bg-black/20 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Location or meeting link</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Google Meet / Zoom / office address"
            className="bg-black/20 border-white/10 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Notes for the candidate</Label>
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What to bring, who they'll meet, agenda..."
            className="bg-black/20 border-white/10 text-white"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="bg-transparent border-white/10 text-white hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium"
          >
            {isPending ? "Saving..." : "Schedule & notify"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ReplyDialog({
  application,
  onClose,
}: {
  application: JobApplication;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<JobApplicationStatus>(
    application.status === "submitted" ? "reviewed" : application.status
  );
  const [message, setMessage] = useState(application.reply_message ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await replyToApplication({
        application_id: application.id,
        status,
        reply_message: message || undefined,
      });
      if (result.success) {
        toast.success("Reply sent");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to send reply");
      }
    });
  };

  return (
    <ModalShell title="Reply to candidate" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
            className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[#C6A85E]/50 outline-none"
          >
            {(Object.keys(APPLICATION_STATUS_LABELS) as JobApplicationStatus[])
              .filter((k) => k !== "withdrawn" && k !== "submitted")
              .map((key) => (
                <option key={key} value={key}>
                  {APPLICATION_STATUS_LABELS[key]}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Message to the applicant</Label>
          <Textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Thank you for your interest..."
            className="bg-black/20 border-white/10 text-white"
          />
          <p className="text-xs text-gray-500">
            The candidate will receive an in-app notification and email with this message.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="bg-transparent border-white/10 text-white hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
          >
            {isPending ? "Sending..." : "Send reply"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0B0F14] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
