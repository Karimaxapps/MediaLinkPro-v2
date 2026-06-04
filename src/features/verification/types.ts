export type ProfileVerificationStatus = "none" | "pending" | "verified" | "rejected";

export type VerificationRequest = {
  id: string;
  user_id: string;
  proof_url: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

export type MyVerification = {
  status: ProfileVerificationStatus;
  verified_at: string | null;
  latestRequest: VerificationRequest | null;
};

export type AdminVerificationRequest = VerificationRequest & {
  user_name: string;
  user_username: string | null;
  user_avatar: string | null;
  user_country: string | null;
  user_plan: string;
};
