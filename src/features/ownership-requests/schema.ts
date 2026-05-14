import { z } from "zod";

export const submitClaimSchema = z.object({
  product_id: z.string().uuid(),
  requesting_org_id: z.string().uuid(),
  message: z.string().max(500).optional(),
});
