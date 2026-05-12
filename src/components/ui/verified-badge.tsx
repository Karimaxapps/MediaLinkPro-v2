import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  plan: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const BLUE = "#135bec";
const GOLD = "#C6A85E";

const sizeClass = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const checkmarkWhite = "[&>path:last-child]:stroke-white [&>path:last-child]:fill-none";

export function VerifiedBadge({ plan, className, size = "md" }: VerifiedBadgeProps) {
  if (plan === "individual_pro" || plan === "org_growth") {
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
