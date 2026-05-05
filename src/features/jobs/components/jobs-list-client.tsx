"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, Building2, MapPin, Search, Filter, X, Globe } from "lucide-react";
import { JOB_TYPE_COLORS, JOB_TYPE_LABELS, type Job, type JobType } from "../types";

type Props = {
  jobs: Job[];
  canPost: boolean;
};

export function JobsListClient({ jobs, canPost }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>([]);
  const [remoteFilter, setRemoteFilter] = useState<boolean | null>(null);
  const [needsCompanyOpen, setNeedsCompanyOpen] = useState(false);

  const toggleType = (t: JobType) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const clear = () => {
    setSearch("");
    setSelectedTypes([]);
    setRemoteFilter(null);
  };

  const hasFilters = Boolean(search) || selectedTypes.length > 0 || remoteFilter !== null;

  const filtered = useMemo(() => {
    let result = [...jobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.organizations?.name?.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length) {
      result = result.filter((j) => selectedTypes.includes(j.job_type));
    }
    if (remoteFilter !== null) {
      result = result.filter((j) => Boolean(j.is_remote) === remoteFilter);
    }
    return result;
  }, [jobs, search, selectedTypes, remoteFilter]);

  const jobTypes = Object.entries(JOB_TYPE_LABELS) as [JobType, string][];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Jobs</h1>
          <p className="text-sm text-gray-400">
            Openings from broadcasters, production companies, and solution providers.
            <span className="text-gray-500 ml-2">
              {filtered.length} role{filtered.length !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[320px]"
            />
          </div>
          <Link href="/jobs/my-applications">
            <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
              My applications
            </Button>
          </Link>
          {canPost ? (
            <Link href="/jobs/new">
              <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
                Post a job
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              onClick={() => setNeedsCompanyOpen(true)}
              className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap"
            >
              Post a job
            </Button>
          )}
        </div>
      </div>

      <Dialog open={needsCompanyOpen} onOpenChange={setNeedsCompanyOpen}>
        <DialogContent className="bg-[#1F1F1F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Company profile required</DialogTitle>
            <DialogDescription className="text-gray-400">
              Posting jobs is available only to companies. Create your company profile first,
              then come back to publish openings and review applications from your company
              dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
              onClick={() => setNeedsCompanyOpen(false)}
            >
              Not now
            </Button>
            <Link href="/companies/new">
              <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium">
                Create company profile
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map(([key, label]) => {
            const active = selectedTypes.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  active
                    ? "text-black font-medium"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
                style={
                  active
                    ? { backgroundColor: JOB_TYPE_COLORS[key], borderColor: JOB_TYPE_COLORS[key] }
                    : undefined
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex gap-2">
          <button
            onClick={() => setRemoteFilter(remoteFilter === true ? null : true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              remoteFilter === true
                ? "bg-[#135bec] text-white border-[#135bec]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Remote
          </button>
          <button
            onClick={() => setRemoteFilter(remoteFilter === false ? null : false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              remoteFilter === false
                ? "bg-[#10b981] text-white border-[#10b981]"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            On-site
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={clear}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs match your filters"
          description={
            hasFilters
              ? "Try clearing filters or broadening the search."
              : "No openings yet. Check back soon or post one yourself if you own a company profile."
          }
          actionLabel={hasFilters ? "Clear filters" : undefined}
          onAction={hasFilters ? clear : undefined}
        />
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const color = JOB_TYPE_COLORS[job.job_type];
  const salary = formatSalary(job);
  return (
    <Link
      href={`/jobs/${job.organizations?.slug ?? "co"}/${job.slug}`}
      className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] p-5 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
          {job.organizations?.logo_url ? (
            <Image
              src={job.organizations.logo_url}
              alt={job.organizations.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <Building2 className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-[#C6A85E] line-clamp-2 transition-colors">
              {job.title}
            </h3>
            <span
              className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.organizations?.name ?? "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.is_remote ? "Remote" : job.location || "Unspecified"}
            </span>
            {salary && <span className="text-[#C6A85E]">{salary}</span>}
          </div>
          {job.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{stripHtml(job.description)}</p>
          )}
          <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            <span>
              {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
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

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
