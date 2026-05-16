export type OwnershipRequestStatus = "pending" | "approved" | "rejected";
export type ContentType = "product" | "event" | "blog_post" | "organization";

export type OwnershipRequest = {
  id: string;
  content_type: ContentType;
  content_id: string;
  requesting_org_id: string | null;
  requesting_user_id: string | null;
  status: OwnershipRequestStatus;
  message: string | null;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

export type AdminOwnershipRequest = OwnershipRequest & {
  requesting_org_name: string;
  requesting_org_slug: string;
  // Populated for product claims (or stub name for org claims, for table reuse)
  product_name: string;
  product_slug: string;
  // Org-claim only
  stub_org_name?: string;
  stub_org_slug?: string;
  requesting_user_name?: string | null;
  requesting_user_email?: string | null;
};
