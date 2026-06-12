"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notify } from "@/features/notifications/server/notify";
import { emailTemplates } from "@/lib/email/templates";
import { checkOrgPlanLimit, blockedFeatureMessage } from "@/lib/subscription/gate";
import { getUserUsage } from "@/features/billing/server/usage";
import {
  APPLICATION_STATUS_LABELS,
  type Job,
  type JobApplication,
  type JobApplicationStatus,
  type JobStatus,
  type JobType,
  type ResumeType,
} from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}${path}`;
}

// ─── Reads ─────────────────────────────────────────────────────────────────

export type JobsFilter = {
  type?: JobType;
  isRemote?: boolean;
  search?: string;
  orgId?: string;
  limit?: number;
};

export async function listOpenJobs(filter: JobsFilter = {}): Promise<Job[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("jobs" as never)
    .select("*, organizations(id, name, slug, logo_url, tagline)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (filter.type) query = query.eq("job_type", filter.type);
  if (filter.isRemote !== undefined) query = query.eq("is_remote", filter.isRemote);
  if (filter.orgId) query = query.eq("organization_id", filter.orgId);
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim();
    query = query.ilike("title", `%${q}%`);
  }
  if (filter.limit) query = query.limit(filter.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[jobs] listOpenJobs error:", error.message);
    return [];
  }
  return (data as unknown as Job[]) ?? [];
}

export async function getJobBySlug(orgSlug: string, slug: string): Promise<Job | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  if (!org) return null;

  const { data, error } = await supabase
    .from("jobs" as never)
    .select("*, organizations(id, name, slug, logo_url, tagline)")
    .eq("organization_id", org.id)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as unknown as Job;
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("jobs" as never)
    .select("*, organizations(id, name, slug, logo_url, tagline)")
    .eq("id", jobId)
    .single();

  if (error) return null;
  return data as unknown as Job;
}

export async function listJobsForManagement(): Promise<Job[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // RLS allows org members to see their jobs.
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin", "editor"]);

  const orgIds = (memberships ?? []).map((m: { organization_id: string }) => m.organization_id);
  if (orgIds.length === 0) return [];

  const { data, error } = await supabase
    .from("jobs" as never)
    .select("*, organizations(id, name, slug, logo_url, tagline)")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[jobs] listJobsForManagement error:", error.message);
    return [];
  }
  return (data as unknown as Job[]) ?? [];
}

export async function listApplicationsForJob(jobId: string): Promise<JobApplication[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("job_applications" as never)
    .select("*, profiles(id, full_name, username, avatar_url, headline)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[jobs] listApplicationsForJob error:", error.message);
    return [];
  }
  return (data as unknown as JobApplication[]) ?? [];
}

export async function listMyApplications(): Promise<JobApplication[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("job_applications" as never)
    .select("*, jobs(id, title, slug, organization_id, organizations(id, name, slug, logo_url))")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[jobs] listMyApplications error:", error.message);
    return [];
  }
  return (data as unknown as JobApplication[]) ?? [];
}

export async function listRecentApplicationsForMyOrgs(
  limit: number = 8
): Promise<JobApplication[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin", "editor"]);

  const orgIds = (memberships ?? []).map((m: { organization_id: string }) => m.organization_id);
  if (orgIds.length === 0) return [];

  const { data: jobRows } = await supabase
    .from("jobs" as never)
    .select("id")
    .in("organization_id", orgIds);

  const jobIds = ((jobRows as unknown as { id: string }[]) ?? []).map((j) => j.id);
  if (jobIds.length === 0) return [];

  const { data, error } = await supabase
    .from("job_applications" as never)
    .select(
      "*, profiles(id, full_name, username, avatar_url, headline), jobs(id, title, slug, organization_id, organizations(id, name, slug, logo_url))"
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[jobs] listRecentApplicationsForMyOrgs error:", error.message);
    return [];
  }
  return (data as unknown as JobApplication[]) ?? [];
}

export async function listJobsForOrg(orgId: string): Promise<Job[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("jobs" as never)
    .select("*, organizations(id, name, slug, logo_url, tagline)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[jobs] listJobsForOrg error:", error.message);
    return [];
  }
  return (data as unknown as Job[]) ?? [];
}

export async function listRecentApplicationsForOrg(
  orgId: string,
  limit: number = 10
): Promise<JobApplication[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: jobRows } = await supabase
    .from("jobs" as never)
    .select("id")
    .eq("organization_id", orgId);

  const jobIds = ((jobRows as unknown as { id: string }[]) ?? []).map((j) => j.id);
  if (jobIds.length === 0) return [];

  const { data, error } = await supabase
    .from("job_applications" as never)
    .select(
      "*, profiles(id, full_name, username, avatar_url, headline), jobs(id, title, slug, organization_id, organizations(id, name, slug, logo_url))"
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[jobs] listRecentApplicationsForOrg error:", error.message);
    return [];
  }
  return (data as unknown as JobApplication[]) ?? [];
}

export async function getMyApplicationForJob(jobId: string): Promise<JobApplication | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("job_applications" as never)
    .select("*")
    .eq("job_id", jobId)
    .eq("applicant_id", user.id)
    .maybeSingle();

  if (error) return null;
  return (data as unknown as JobApplication) ?? null;
}

// ─── Writes ────────────────────────────────────────────────────────────────

export async function createJob(input: {
  organization_id: string;
  title: string;
  description?: string;
  department?: string;
  job_type: JobType;
  location?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  skills?: string[];
  expires_at?: string;
  status?: JobStatus;
}): Promise<{ success: boolean; error?: string; slug?: string; orgSlug?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  // Verify membership role
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", input.organization_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
    return { success: false, error: "Only company admins can post jobs." };
  }

  const gate = await checkOrgPlanLimit(input.organization_id, "post_job");
  if (!gate.allowed) {
    return {
      success: false,
      error: blockedFeatureMessage("post_job", gate.requiredPlan!),
    };
  }

  const base = slugify(input.title);
  const slug = `${base}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("jobs" as never)
    .insert({
      organization_id: input.organization_id,
      posted_by: user.id,
      title: input.title,
      slug,
      description: input.description ?? null,
      department: input.department ?? null,
      job_type: input.job_type,
      location: input.location ?? null,
      is_remote: input.is_remote ?? false,
      salary_min: input.salary_min ?? null,
      salary_max: input.salary_max ?? null,
      currency: input.currency ?? "USD",
      skills: input.skills ?? [],
      expires_at: input.expires_at ?? null,
      status: input.status ?? "open",
    } as never)
    .select("slug, organizations(slug)")
    .single();

  if (error || !data) {
    console.error("[jobs] createJob error:", error?.message);
    return { success: false, error: error?.message ?? "Failed to create job." };
  }

  revalidatePath("/jobs");
  revalidatePath("/jobs/manage");

  const row = data as unknown as { slug: string; organizations?: { slug: string } };
  return { success: true, slug: row.slug, orgSlug: row.organizations?.slug };
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("jobs" as never)
    .update({ status } as never)
    .eq("id", jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath("/jobs/manage");
  return { success: true };
}

export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("jobs" as never)
    .delete()
    .eq("id", jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath("/jobs/manage");
  return { success: true };
}

// ─── Applications ──────────────────────────────────────────────────────────

export async function submitApplication(input: {
  job_id: string;
  resume_url: string;
  resume_type: ResumeType;
  cover_letter?: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  if (!input.resume_url?.trim()) {
    return { success: false, error: "Please provide a resume link or upload a PDF." };
  }

  // Enforce the monthly job-application cap (Free 10 / Verified Pro 50).
  const { jobApplicationsThisMonth } = await getUserUsage(user.id);
  if (jobApplicationsThisMonth.exhausted) {
    return {
      success: false,
      error: `You've reached your ${jobApplicationsThisMonth.limit} job applications for this month. Upgrade to Verified Pro for 50 per month.`,
    };
  }

  // Load job + org for notification context
  const { data: jobRow } = await supabase
    .from("jobs" as never)
    .select("id, title, slug, status, organization_id, organizations(id, name, slug)")
    .eq("id", input.job_id)
    .single();

  const job = jobRow as unknown as {
    id: string;
    title: string;
    slug: string;
    status: JobStatus;
    organization_id: string;
    organizations?: { id: string; name: string; slug: string };
  } | null;

  if (!job) return { success: false, error: "Job not found." };
  if (job.status !== "open")
    return { success: false, error: "This job is no longer accepting applications." };

  const { error } = await supabase.from("job_applications" as never).insert({
    job_id: input.job_id,
    applicant_id: user.id,
    resume_url: input.resume_url,
    resume_type: input.resume_type,
    cover_letter: input.cover_letter ?? null,
    phone: input.phone ?? null,
    status: "submitted",
  } as never);

  if (error) {
    if (error.message?.includes("duplicate")) {
      return { success: false, error: "You have already applied to this job." };
    }
    console.error("[jobs] submitApplication error:", error.message);
    return { success: false, error: error.message };
  }

  // Build applicant display name for the notification
  const { data: applicantProfile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .single();

  const applicantName = applicantProfile?.full_name || applicantProfile?.username || "A candidate";

  // Notify organization owners, admins, and editors
  const { data: recipients } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", job.organization_id)
    .in("role", ["owner", "admin", "editor"]);

  const reviewUrl = appUrl(`/jobs/manage/${job.id}`);
  const tmpl = emailTemplates.jobApplication(applicantName, job.title, reviewUrl);

  await Promise.all(
    ((recipients ?? []) as { user_id: string }[]).map((r) =>
      notify({
        userId: r.user_id,
        type: "job_application",
        title: "New job application",
        message: `${applicantName} applied to ${job.title}.`,
        data: {
          job_id: job.id,
          job_slug: job.slug,
          organization_id: job.organization_id,
          applicant_id: user.id,
        },
        email: { subject: tmpl.subject, html: tmpl.html },
      })
    )
  );

  revalidatePath(`/jobs`);
  revalidatePath(`/jobs/my-applications`);
  return { success: true };
}

/**
 * Resolve a viewable URL for an application's resume. PDF resumes live in the
 * private `resumes` bucket, so they are served via short-lived signed URLs;
 * link resumes are returned as-is. RLS on job_applications (applicant or org
 * reviewer) and on storage.objects authorizes the caller.
 */
export async function getResumeViewUrl(
  applicationId: string
): Promise<{ url?: string; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data } = await supabase
    .from("job_applications" as never)
    .select("resume_url, resume_type")
    .eq("id", applicationId)
    .maybeSingle();

  const application = data as unknown as {
    resume_url: string;
    resume_type: ResumeType;
  } | null;
  if (!application?.resume_url) return { error: "Application not found." };

  if (application.resume_type !== "pdf") {
    return { url: application.resume_url };
  }

  const path = resumeStoragePath(application.resume_url);
  if (!path) return { url: application.resume_url };

  const { data: signed, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60 * 60);

  if (error || !signed?.signedUrl) {
    console.error("[jobs] getResumeViewUrl sign error:", error?.message);
    return { error: "Could not open this resume." };
  }
  return { url: signed.signedUrl };
}

/**
 * Stored resume_url values are full storage URLs (public-style, kept for
 * backwards compatibility with rows created before the bucket went private).
 * Extract the object path within the `resumes` bucket.
 */
function resumeStoragePath(value: string): string | null {
  for (const marker of [
    "/storage/v1/object/public/resumes/",
    "/storage/v1/object/sign/resumes/",
    "/storage/v1/object/resumes/",
  ]) {
    const index = value.indexOf(marker);
    if (index >= 0) {
      const path = value.slice(index + marker.length).split("?")[0];
      return decodeURIComponent(path);
    }
  }
  if (!/^https?:\/\//i.test(value)) {
    return value.replace(/^resumes\//, "");
  }
  return null;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplicationStatus
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("job_applications" as never)
    .update({ status } as never)
    .eq("id", applicationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/jobs/manage");
  revalidatePath("/jobs/my-applications");
  return { success: true };
}

export async function withdrawApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("job_applications" as never)
    .update({ status: "withdrawn" } as never)
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/jobs/my-applications");
  return { success: true };
}

export async function scheduleInterview(input: {
  application_id: string;
  interview_scheduled_at: string;
  interview_location?: string;
  interview_notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch application + job + org for notification context
  const { data: appRow } = await supabase
    .from("job_applications" as never)
    .select(
      "id, applicant_id, jobs(id, title, slug, organization_id, organizations(id, name, slug))"
    )
    .eq("id", input.application_id)
    .single();

  const application = appRow as unknown as {
    id: string;
    applicant_id: string;
    jobs?: {
      id: string;
      title: string;
      slug: string;
      organization_id: string;
      organizations?: { id: string; name: string; slug: string };
    };
  } | null;

  if (!application) return { success: false, error: "Application not found." };

  const { error } = await supabase
    .from("job_applications" as never)
    .update({
      status: "interview_scheduled",
      interview_scheduled_at: input.interview_scheduled_at,
      interview_location: input.interview_location ?? null,
      interview_notes: input.interview_notes ?? null,
    } as never)
    .eq("id", input.application_id);

  if (error) return { success: false, error: error.message };

  const companyName = application.jobs?.organizations?.name ?? "The company";
  const jobTitle = application.jobs?.title ?? "your application";
  const jobUrl = appUrl("/jobs/my-applications");

  const whenLabel = new Date(input.interview_scheduled_at).toLocaleString();
  const tmpl = emailTemplates.interviewScheduled(
    companyName,
    jobTitle,
    whenLabel,
    input.interview_location ?? "",
    jobUrl
  );

  await notify({
    userId: application.applicant_id,
    type: "job_interview_scheduled",
    title: "Interview scheduled",
    message: `${companyName} scheduled an interview for ${jobTitle}.`,
    data: {
      application_id: application.id,
      job_id: application.jobs?.id,
      interview_scheduled_at: input.interview_scheduled_at,
    },
    email: { subject: tmpl.subject, html: tmpl.html },
  });

  revalidatePath("/jobs/manage");
  revalidatePath("/jobs/my-applications");
  return { success: true };
}

export async function replyToApplication(input: {
  application_id: string;
  status: JobApplicationStatus;
  reply_message?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: appRow } = await supabase
    .from("job_applications" as never)
    .select(
      "id, applicant_id, jobs(id, title, slug, organization_id, organizations(id, name, slug))"
    )
    .eq("id", input.application_id)
    .single();

  const application = appRow as unknown as {
    id: string;
    applicant_id: string;
    jobs?: {
      id: string;
      title: string;
      slug: string;
      organization_id: string;
      organizations?: { id: string; name: string; slug: string };
    };
  } | null;

  if (!application) return { success: false, error: "Application not found." };

  const { error } = await supabase
    .from("job_applications" as never)
    .update({
      status: input.status,
      reply_message: input.reply_message ?? null,
      replied_at: new Date().toISOString(),
    } as never)
    .eq("id", input.application_id);

  if (error) return { success: false, error: error.message };

  const companyName = application.jobs?.organizations?.name ?? "The company";
  const jobTitle = application.jobs?.title ?? "your application";
  const jobUrl = appUrl("/jobs/my-applications");
  const statusLabel = APPLICATION_STATUS_LABELS[input.status];
  const tmpl = emailTemplates.jobReply(
    companyName,
    jobTitle,
    statusLabel,
    input.reply_message ?? "",
    jobUrl
  );

  await notify({
    userId: application.applicant_id,
    type: "job_application_reply",
    title: "Your application was updated",
    message: `${companyName} marked your application as ${statusLabel.toLowerCase()}.`,
    data: {
      application_id: application.id,
      job_id: application.jobs?.id,
      status: input.status,
    },
    email: { subject: tmpl.subject, html: tmpl.html },
  });

  revalidatePath("/jobs/manage");
  revalidatePath("/jobs/my-applications");
  return { success: true };
}
