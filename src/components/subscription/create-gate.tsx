"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsagePill } from "@/components/subscription/usage-pill";
import type { Quota } from "@/features/billing/server/usage";

export type CreateGateProps = {
  /**
   * Singular noun describing the resource ("event", "blog post", "job", "product").
   * Used to phrase the no-org CTA.
   */
  noun: string;
  /** Plural form, used in the no-org hint text ("events", "blog posts"). */
  nounPlural: string;
  /** Where to go when the user can create (e.g. "/events/new"). */
  href: string;
  /** Button label when the user can create (e.g. "Create Event", "Post a job"). */
  label: string;
  /** True when the current user owns a company. */
  hasOrg: boolean;
  /** Per-month/total quota for this resource. Omitted if not applicable. */
  quota?: Quota | null;
  /** Compact rendering — shrinks the no-org CTA to fit small headers. */
  compact?: boolean;
};

/**
 * Unified "Add" CTA for org-scoped resources.
 *
 * Three states:
 *   1. User has no company    → "Create a company profile" link.
 *   2. Has company + has room → quota pill + Add button.
 *   3. Has company + at limit → quota pill (red) + disabled Add button.
 */
export function CreateGate({
  noun,
  nounPlural,
  href,
  label,
  hasOrg,
  quota,
  compact,
}: CreateGateProps) {
  // No company yet — redirect them to create one first.
  if (!hasOrg) {
    return (
      <Link
        href={`/companies/new?from=${encodeURIComponent(noun)}`}
        className="inline-flex items-center gap-2 rounded-full border border-[#C6A85E]/40 bg-[#C6A85E]/[0.07] px-3.5 py-2 text-xs font-medium text-[#C6A85E] hover:bg-[#C6A85E]/[0.15] transition-colors"
        title={`Create a company profile to add ${nounPlural}`}
      >
        <Building2 className="size-3.5 shrink-0" />
        {compact ? "Create company first" : `Create a company to add ${nounPlural}`}
      </Link>
    );
  }

  const atLimit = quota?.exhausted ?? false;

  return (
    <div className="flex items-center gap-2">
      {quota && <UsagePill quota={quota} noun={noun} />}
      {atLimit ? (
        <Button
          disabled
          className="bg-[#C6A85E] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {label}
        </Button>
      ) : (
        <Link href={href}>
          <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
            <Plus className="h-4 w-4 mr-1.5" />
            {label}
          </Button>
        </Link>
      )}
    </div>
  );
}
