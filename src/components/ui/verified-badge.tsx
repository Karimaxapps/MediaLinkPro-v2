import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  plan: string | null | undefined;
  /**
   * Required for individual members: the badge only shows when their identity
   * has been verified (`"verified"`), not merely because they pay. Org plans
   * ignore this — being a paying company is itself the verification.
   */
  verificationStatus?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const BLUE = "var(--brand-secondary)";
const GOLD = "var(--brand)";

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const checkmarkWhite = "[&>path:last-child]:stroke-white [&>path:last-child]:fill-none";

export function VerifiedBadge({
  plan,
  verificationStatus,
  className,
  size = "md",
}: VerifiedBadgeProps) {
  // Individual members must complete identity verification — paying alone
  // does not display the badge.
  if (plan === "individual_pro") {
    if (verificationStatus !== "verified") return null;
    return (
      <BadgeCheck
        className={cn(sizeClass[size], "shrink-0", checkmarkWhite, className)}
        style={{ color: BLUE, fill: BLUE }}
        aria-label="Verified"
      />
    );
  }

  if (plan === "org_growth") {
    return (
      <BadgeCheck
        className={cn(sizeClass[size], "shrink-0", checkmarkWhite, className)}
        style={{ color: BLUE, fill: BLUE }}
        aria-label="Verified"
      />
    );
  }

  if (plan === "org_enterprise") {
    return (
      <BadgeCheck
        className={cn(sizeClass[size], "shrink-0", checkmarkWhite, className)}
        style={{ color: GOLD, fill: GOLD }}
        aria-label="Verified"
      />
    );
  }

  return null;
}
