import type { DocCategory } from "./schema";

export type DocArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: DocCategory;
  is_public: boolean;
  sort_order: number;
  version_tag: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export const CATEGORY_LABELS: Record<DocCategory, string> = {
  changelog:     "Changelog",
  "admin-guide": "Admin Guide",
  feature:       "Feature",
  "user-guide":  "User Guide",
  faq:           "FAQ",
};

export const PUBLIC_CATEGORY_LABELS: Partial<Record<DocCategory, string>> = {
  "user-guide": "User Guides",
  feature:      "Features",
  faq:          "FAQ",
};
