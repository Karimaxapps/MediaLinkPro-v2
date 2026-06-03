import { z } from "zod";

export const verificationRequestSchema = z.object({
  proof_url: z
    .string()
    .trim()
    .url("Enter a valid URL — e.g. your LinkedIn, company page, or portfolio."),
  note: z.string().trim().max(500, "Keep it under 500 characters.").optional(),
});

export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;
