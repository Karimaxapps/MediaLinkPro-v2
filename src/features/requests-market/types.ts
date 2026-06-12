export type MarketRequestCategory = "solution" | "technology" | "crew" | "other";
export type MarketRequestStatus = "draft" | "open" | "closed" | "fulfilled";
export type MarketInterestStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type MarketRequest = {
  id: string;
  posted_by: string;
  organization_id: string | null;
  title: string;
  slug: string;
  category: MarketRequestCategory;
  description: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  location: string | null;
  is_remote: boolean;
  skills: string[] | null;
  deadline: string | null;
  expires_at: string | null;
  status: MarketRequestStatus;
  interest_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    headline?: string | null;
  };
  organizations?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    tagline?: string | null;
  };
};

export type MarketRequestInterest = {
  id: string;
  request_id: string;
  profile_id: string;
  organization_id: string | null;
  pitch: string;
  status: MarketInterestStatus;
  conversation_id: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    headline?: string | null;
  };
  organizations?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  market_requests?: {
    id: string;
    title: string;
    slug: string;
    posted_by: string;
    organization_id: string | null;
    status: MarketRequestStatus;
    organizations?: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
    };
  };
};

export const REQUEST_CATEGORY_LABELS: Record<MarketRequestCategory, string> = {
  solution: "Solution",
  technology: "Technology",
  crew: "Production crew",
  other: "Other",
};

export const REQUEST_CATEGORY_COLORS: Record<MarketRequestCategory, string> = {
  solution: "var(--brand)",
  technology: "var(--brand-secondary)",
  crew: "#8b5cf6",
  other: "#6b7280",
};

export const REQUEST_STATUS_LABELS: Record<MarketRequestStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  fulfilled: "Fulfilled",
};

export const INTEREST_STATUS_LABELS: Record<MarketInterestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export const INTEREST_STATUS_COLORS: Record<MarketInterestStatus, string> = {
  pending: "var(--brand-secondary)",
  accepted: "#10b981",
  declined: "#ef4444",
  withdrawn: "#6b7280",
};
