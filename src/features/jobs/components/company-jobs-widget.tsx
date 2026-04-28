import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, ExternalLink, Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  listJobsForOrg,
  listRecentApplicationsForOrg,
} from "@/features/jobs/server/actions";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  JOB_STATUS_LABELS,
} from "@/features/jobs/types";

type Props = {
  orgId: string;
  orgSlug: string;
};

export async function CompanyJobsWidget({ orgId, orgSlug }: Props) {
  const [jobs, applications] = await Promise.all([
    listJobsForOrg(orgId),
    listRecentApplicationsForOrg(orgId, 8),
  ]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const totalApplications = jobs.reduce((sum, j) => sum + (j.application_count ?? 0), 0);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#C6A85E]" />
            Jobs & Applications
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {jobs.length} posting{jobs.length !== 1 ? "s" : ""} · {openJobs.length} open ·{" "}
            {totalApplications} application{totalApplications !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/jobs/manage">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
            >
              Manage all
            </Button>
          </Link>
          <Link href="/jobs/new">
            <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Post a job
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recent jobs */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Recent postings
          </h3>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No job postings yet. Click &quot;Post a job&quot; to publish your first opening.
            </p>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/manage/${job.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate group-hover:text-[#C6A85E]">
                        {job.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
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
                    <p className="text-xs text-gray-500 mt-0.5">
                      Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                    <Users className="h-3.5 w-3.5" />
                    {job.application_count ?? 0}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Recent applications
          </h3>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No applications received yet.
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                const job = app.jobs;
                const profile = app.profiles;
                return (
                  <Link
                    key={app.id}
                    href={job ? `/jobs/manage/${job.id}` : "/jobs/manage"}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-black/20 hover:bg-white/5 transition-colors group"
                  >
                    <Avatar className="h-9 w-9 border border-white/10 shrink-0">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Applicant"} />
                      <AvatarFallback className="bg-[#135bec]/20 text-[#135bec] text-xs">
                        {(profile?.full_name ?? "?").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-[#C6A85E]">
                        {profile?.full_name ?? "Anonymous applicant"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {job?.title ?? "—"} ·{" "}
                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded shrink-0 border"
                      style={{
                        color: APPLICATION_STATUS_COLORS[app.status],
                        borderColor: `${APPLICATION_STATUS_COLORS[app.status]}40`,
                        backgroundColor: `${APPLICATION_STATUS_COLORS[app.status]}1a`,
                      }}
                    >
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
          {applications.length > 0 && (
            <div className="mt-3 text-right">
              <Link
                href={`/companies/${orgSlug}/dashboard`}
                className="text-xs text-gray-400 hover:text-[#C6A85E] inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open in jobs management
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
