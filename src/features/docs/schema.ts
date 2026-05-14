import { z } from "zod";

export const DOC_CATEGORIES = [
  "changelog",
  "admin-guide",
  "feature",
  "user-guide",
  "faq",
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export const docArticleSchema = z.object({
  title:       z.string().min(2).max(200),
  slug:        z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens").optional(),
  content:     z.string().min(1),
  excerpt:     z.string().max(300).optional(),
  category:    z.enum(DOC_CATEGORIES),
  is_public:   z.boolean().default(false),
  sort_order:  z.number().int().default(0),
  version_tag: z.string().max(20).optional(),
});

export type DocArticleInput = z.infer<typeof docArticleSchema>;

export function buildSlug(title: string, existingSlugs: string[] = []): string {
  const base = slugify(title);
  if (!existingSlugs.includes(base)) return base;
  let i = 2;
  while (existingSlugs.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
