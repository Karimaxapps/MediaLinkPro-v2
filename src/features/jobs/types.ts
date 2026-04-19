export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "freelance"
  | "internship"
  | "temporary";
export type JobStatus = "draft" | "open" | "closed";
export type JobApplicationStatus =
  | "submitted"
  | "reviewed"
  | "interview_scheduled"
  | "rejected"
  | "accepted"
  | "withdrawn";
export type ResumeType = "link" | "pdf";

export type Job = {
  id: string;
  organization_id: string;
  posted_by: string | null;
  title: string;
  slug: string;
  description: string | null;
  department: string | null;
  job_type: JobType;
  status: JobStatus;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  skills: string[] | null;
  application_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  organizations?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    tagline?: string | null;
  };
};

export type JobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string;
  resume_type: ResumeType;
  cover_letter: string | null;
  phone: string | null;
  status: JobApplicationStatus;
  interview_scheduled_at: string | null;
  interview_location: string | null;
  interview_notes: string | null;
  reply_message: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    headline?: string | null;
  };
  jobs?: {
    id: string;
    title: string;
    slug: string;
    organization_id: string;
    organizations?: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
    };
  };
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
  temporary: "Temporary",
};

export const JOB_TYPE_COLORS: Record<JobType, string> = {
  full_time: "#C6A85E",
  part_time: "#10b981",
  contract: "#135bec",
  freelance: "#8b5cf6",
  internship: "#f59e0b",
  temporary: "#ef4444",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

export const APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  interview_scheduled: "Interview scheduled",
  rejected: "Rejected",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_COLORS: Record<JobApplicationStatus, string> = {
  submitted: "#135bec",
  reviewed: "#C6A85E",
  interview_scheduled: "#8b5cf6",
  rejected: "#ef4444",
  accepted: "#10b981",
  withdrawn: "#6b7280",
};
