import type { Product } from "@/features/products/types";
import type { GeneratedSetup, SetupStep } from "@/lib/ai/types";

/** A setup step with its product IDs resolved to full product records. */
export type HydratedStep = Omit<SetupStep, "productIds"> & {
  products: Product[];
};

/** The recommendation as returned to the client: steps hydrated with products. */
export type HydratedSetup = {
  requestId: string;
  summary: string;
  steps: HydratedStep[];
  budgetBreakdown: {
    product: Product | null;
    estimatedCost: number;
    note?: string;
  }[];
  totalEstimate: number;
  unmatchedNeeds: string[];
  budgetAmount: number;
  budgetCurrency: string;
};

/** Compact past-request entry for the history panel. */
export type SetupHistoryItem = {
  id: string;
  projectType: string;
  goals: string;
  budgetAmount: number;
  budgetCurrency: string;
  status: "generated" | "confirmed" | "dismissed";
  createdAt: string;
};

export type { GeneratedSetup };
