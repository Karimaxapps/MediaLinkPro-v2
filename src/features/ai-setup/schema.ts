import { z } from "zod";
import { PROJECT_TYPES, ENVIRONMENTS, SUPPORTED_CURRENCIES } from "./constants";

export const setupRequestSchema = z.object({
  projectType: z.enum(PROJECT_TYPES),
  environment: z.enum(ENVIRONMENTS),
  goals: z.string().trim().min(3, "Tell us your main goals").max(500),
  requirements: z.string().trim().max(2000).optional(),
  budgetAmount: z.coerce.number().positive("Budget must be greater than zero"),
  budgetCurrency: z.enum(SUPPORTED_CURRENCIES),
});

export type SetupFormInput = z.input<typeof setupRequestSchema>;
export type SetupRequestInput = z.output<typeof setupRequestSchema>;
