export type OwnershipRequestStatus = "pending" | "approved" | "rejected";
export type ContentType = "product" | "event" | "blog_post";

export type OwnershipRequest = {
  id: string;
  content_type: ContentType;
  content_id: string;
  requesting_org_id: string;
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
  product_name: string;
  product_slug: string;
};
