import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Briefcase } from "lucide-react";
import { listRecentApplicationsForMyOrgs } from "../server/actions";
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from "../types";

/**
 * Sidebar widget shown on the dashboard for users who administer at least
 * one organization. Lists the latest candidate submissions across all their
 * job postings. For non-admin users this renders nothing.
 */
export async function DashboardJobApplicationsWidget({ limit = 5 }: { limit?: number }) {
  const apps = await listRecentApplicationsForMyOrgs(limit);
  if (apps.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[#C6A85E]" />
          <h3 className="text-sm font-semibold text-white">Recent applications</h3>
        </div>
        <Link href="/jobs/manage" className="text-xs text-[#C6A85E] hover:underline">
          Manage
        </Link>
      </div>
      <div className="space-y-2">
        {apps.map((app) => {
          const applicant = app.profiles;
          const job = app.jobs;
          const color = APPLICATION_STATUS_COLORS[app.status];
          return (
            <Link
              key={app.id}
              href={job ? `/jobs/manage/${job.id}` : "/jobs/manage"}
              className="flex items-start gap-3 rounded-md p-2 hover:bg-white/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-full border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {applicant?.avatar_url ? (
                  <Image
                    src={applicant.avatar_url}
                    alt={applicant.full_name ?? ""}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    {(applicant?.full_name ?? applicant?.username ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">
                  {applicant?.full_name ?? applicant?.username ?? "Candidate"}
                </div>
                <div className="text-xs text-gray-500 truncate">{job?.title ?? "Application"}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
