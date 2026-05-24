import Link from "next/link";
import { Box, Briefcase, Calendar, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsagePill } from "@/components/subscription/usage-pill";
import type { OrgUsage } from "@/features/billing/server/usage";
import type { PlanId } from "@/lib/stripe/plans";
import { getPlanById } from "@/lib/stripe/plans";

type Props = {
  usage: OrgUsage;
  plan: PlanId;
  orgSlug: string;
};

export function PlanUsageCard({ usage, plan, orgSlug }: Props) {
  const planName = getPlanById(plan).name;

  const rows: Array<{
    icon: typeof Box;
    label: string;
    noun: string;
    quota: OrgUsage[keyof OrgUsage];
  }> = [
    { icon: Box, label: "Products", noun: "product", quota: usage.products },
    { icon: Briefcase, label: "Jobs", noun: "job", quota: usage.jobsThisMonth },
    { icon: Calendar, label: "Events", noun: "event", quota: usage.eventsThisMonth },
    { icon: FileText, label: "Blog posts", noun: "post", quota: usage.blogPostsThisMonth },
  ];

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">Plan usage</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            On the <span className="text-[var(--brand)] font-medium">{planName}</span> plan
          </p>
        </div>
        <Link
          href={`/companies/${orgSlug}/billing`}
          className="inline-flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
        >
          Manage plan
          <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="size-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-200 truncate">{row.label}</span>
              </div>
              <UsagePill quota={row.quota} noun={row.noun} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
