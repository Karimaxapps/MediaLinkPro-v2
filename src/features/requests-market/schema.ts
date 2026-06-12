import { z } from "zod";

export const createRequestSchema = z
  .object({
    organization_id: z.string().uuid().optional(),
    title: z.string().min(3).max(160),
    category: z.enum(["solution", "technology", "crew", "other"]),
    description: z.string().max(10000).optional(),
    budget_min: z.number().nonnegative().optional(),
    budget_max: z.number().nonnegative().optional(),
    currency: z.string().max(8).optional(),
    location: z.string().max(160).optional(),
    is_remote: z.boolean().optional(),
    skills: z.array(z.string().max(60)).max(20).optional(),
    deadline: z.string().optional(),
    expires_at: z.string().optional(),
    status: z.enum(["draft", "open"]).optional(),
  })
  .refine(
    (v) => v.budget_min === undefined || v.budget_max === undefined || v.budget_min <= v.budget_max,
    { message: "Minimum budget must not exceed maximum budget.", path: ["budget_min"] }
  );

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export const expressInterestSchema = z.object({
  request_id: z.string().uuid(),
  pitch: z.string().min(10).max(2000),
  organization_id: z.string().uuid().optional(),
});

export type ExpressInterestInput = z.infer<typeof expressInterestSchema>;
