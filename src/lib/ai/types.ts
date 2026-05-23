// Provider-agnostic AI types. The concrete SDK (Anthropic / OpenAI) is wired in
// provider.ts via env vars and dynamic import, so this module stays dependency-free.

export type StructuredRequest = {
  /** High-level instructions / role for the model. */
  system: string;
  /** The user-facing prompt containing the brief, budget and product catalog. */
  prompt: string;
  /** Name for the structured-output tool/schema (provider-specific labelling). */
  schemaName: string;
  /** JSON Schema describing the exact object shape the model must return. */
  schema: Record<string, unknown>;
};

export interface AiProvider {
  /** Returns a parsed object matching the supplied JSON schema. Throws on failure. */
  generateStructured<T>(req: StructuredRequest): Promise<T>;
}

// ---- Domain shapes for the AI Setup Builder ----

/** A single ordered step in the recommended setup, referencing real product IDs. */
export type SetupStep = {
  order: number;
  title: string;
  rationale: string;
  productIds: string[];
};

/** Per-line budget entry the model produces (productId must exist in the catalog). */
export type BudgetLine = {
  productId: string;
  estimatedCost: number;
  note?: string;
};

/** Raw structured output returned by the model (product IDs only, not hydrated). */
export type GeneratedSetup = {
  summary: string;
  steps: SetupStep[];
  budgetBreakdown: BudgetLine[];
  totalEstimate: number;
  /** Needs the catalog cannot cover, described in plain language. */
  unmatchedNeeds: string[];
};

/** JSON Schema for GeneratedSetup, passed to the provider's structured-output mode. */
export const GENERATED_SETUP_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "steps", "budgetBreakdown", "totalEstimate", "unmatchedNeeds"],
  properties: {
    summary: { type: "string", description: "1-3 sentence overview of the proposed setup." },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["order", "title", "rationale", "productIds"],
        properties: {
          order: { type: "integer" },
          title: { type: "string" },
          rationale: { type: "string" },
          productIds: {
            type: "array",
            items: { type: "string" },
            description: "IDs of products from the supplied catalog used in this step.",
          },
        },
      },
    },
    budgetBreakdown: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["productId", "estimatedCost"],
        properties: {
          productId: { type: "string" },
          estimatedCost: { type: "number" },
          note: { type: "string" },
        },
      },
    },
    totalEstimate: { type: "number" },
    unmatchedNeeds: { type: "array", items: { type: "string" } },
  },
};
