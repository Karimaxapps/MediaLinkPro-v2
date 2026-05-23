"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ActionState } from "@/features/types";
import { setupRequestSchema, type SetupRequestInput } from "../schema";
import { RELEVANT_CATEGORIES, MIN_CANDIDATES, MAX_CANDIDATES } from "../constants";
import { getAiProvider, AiNotConfiguredError } from "@/lib/ai/provider";
import { getFeatureAccess } from "@/features/admin/server/feature-flags";
import { GENERATED_SETUP_SCHEMA, type GeneratedSetup } from "@/lib/ai/types";
import type { Product } from "@/features/products/types";
import type { HydratedSetup, HydratedStep, SetupHistoryItem } from "../types";

const FULL_PRODUCT_SELECT = "*, organizations(id, name, slug, logo_url)";

const CANDIDATE_SELECT =
  "id, name, product_type, main_category, sub_category, price, currency, pricing_model, price_upon_request, short_description, organization_id";

type Candidate = {
  id: string;
  name: string;
  product_type: string;
  main_category: string;
  sub_category: string | null;
  price: number | null;
  currency: string | null;
  pricing_model: string | null;
  price_upon_request: boolean | null;
  short_description: string | null;
  organization_id: string;
};

/**
 * Generate a budget-aware, step-by-step setup grounded strictly in real
 * published products. Returns the recommendation with products hydrated.
 */
export async function generateSetup(rawInput: SetupRequestInput): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Please sign in to use the AI Setup Builder." };

  const { canAccess } = await getFeatureAccess("ai_setup_builder");
  if (!canAccess) return { success: false, error: "This feature is not available yet." };

  const parsed = setupRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const input = parsed.data;

  // 1. Retrieve a relevant candidate catalog (published + public only).
  const categories = RELEVANT_CATEGORIES[input.projectType];
  let candidates: Candidate[] = [];

  const { data: scoped, error: scopedErr } = await supabase
    .from("products")
    .select(CANDIDATE_SELECT)
    .eq("status", "published")
    .eq("is_public", true)
    .in("main_category", categories)
    .limit(MAX_CANDIDATES);

  if (scopedErr) return { success: false, error: scopedErr.message };
  candidates = (scoped ?? []) as Candidate[];

  // Broaden to all published products if the scoped set is too thin.
  if (candidates.length < MIN_CANDIDATES) {
    const { data: broad } = await supabase
      .from("products")
      .select(CANDIDATE_SELECT)
      .eq("status", "published")
      .eq("is_public", true)
      .limit(MAX_CANDIDATES);
    candidates = (broad ?? []) as Candidate[];
  }

  if (candidates.length === 0) {
    return {
      success: false,
      error: "No published products are available yet to build a setup from.",
    };
  }

  const candidateIds = new Set(candidates.map((c) => c.id));

  // 2. Ask the AI to compose a setup grounded only in these products.
  let generated: GeneratedSetup;
  try {
    const provider = getAiProvider();
    const catalogJson = JSON.stringify(
      candidates.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.product_type,
        category: c.main_category,
        subCategory: c.sub_category,
        price: c.price,
        currency: c.currency,
        pricingModel: c.pricing_model,
        priceUponRequest: c.price_upon_request,
        description: c.short_description,
      }))
    );

    const system =
      "You are a senior media-production systems architect for MediaLinkPro. " +
      "Design a practical, ordered setup using ONLY products from the supplied catalog. " +
      "Reference products strictly by their exact `id`. Never invent products or IDs. " +
      "Respect the user's budget: keep the total at or below it where feasible, and choose " +
      "cost-appropriate products. If the catalog cannot cover a genuine need, list it in " +
      "`unmatchedNeeds` instead of substituting an unrelated product.";

    const prompt =
      `Project type: ${input.projectType}\n` +
      `Environment: ${input.environment}\n` +
      `Budget: ${input.budgetAmount} ${input.budgetCurrency}\n` +
      `Main goals: ${input.goals}\n` +
      `Additional requirements: ${input.requirements || "(none)"}\n\n` +
      `Available product catalog (JSON):\n${catalogJson}\n\n` +
      `Build an ordered, step-by-step setup. Each step's productIds must be ids from the catalog.`;

    generated = await provider.generateStructured<GeneratedSetup>({
      system,
      prompt,
      schemaName: "media_setup",
      schema: GENERATED_SETUP_SCHEMA,
    });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return { success: false, error: err.message };
    }
    console.error("[generateSetup] AI generation failed:", err);
    return { success: false, error: "The AI could not generate a setup. Please try again." };
  }

  // 3. Enforce grounding: drop any product ID not in the candidate set.
  const steps = (generated.steps ?? [])
    .map((s) => ({
      ...s,
      productIds: (s.productIds ?? []).filter((id) => candidateIds.has(id)),
    }))
    .sort((a, b) => a.order - b.order);

  const budgetBreakdown = (generated.budgetBreakdown ?? []).filter((b) =>
    candidateIds.has(b.productId)
  );

  // Cleaned, grounded recommendation — this is what we persist and re-hydrate.
  const cleaned: GeneratedSetup = {
    summary: generated.summary ?? "",
    steps,
    budgetBreakdown,
    totalEstimate: generated.totalEstimate ?? 0,
    unmatchedNeeds: generated.unmatchedNeeds ?? [],
  };

  const usedIds = Array.from(
    new Set([
      ...steps.flatMap((s) => s.productIds),
      ...budgetBreakdown.map((b) => b.productId),
    ])
  );

  // 4. Persist the request.
  const { data: inserted, error: insertErr } = await supabase
    .from("ai_setup_requests")
    .insert({
      requester_id: user.id,
      brief: {
        projectType: input.projectType,
        environment: input.environment,
        goals: input.goals,
        requirements: input.requirements,
      },
      budget_amount: input.budgetAmount,
      budget_currency: input.budgetCurrency,
      recommendation: cleaned as unknown as Record<string, unknown>,
      product_ids: usedIds,
      status: "generated",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return { success: false, error: insertErr?.message ?? "Failed to save the request." };
  }

  // 5. Hydrate into rich product records for the client.
  const setup = await hydrateSetup(supabase, {
    requestId: (inserted as { id: string }).id,
    generated: cleaned,
    budgetAmount: input.budgetAmount,
    budgetCurrency: input.budgetCurrency,
  });

  return { success: true, setup };
}

/** Hydrate a cleaned GeneratedSetup into a HydratedSetup with full product records. */
async function hydrateSetup(
  supabase: ReturnType<typeof createClient>,
  opts: {
    requestId: string;
    generated: GeneratedSetup;
    budgetAmount: number;
    budgetCurrency: string;
  }
): Promise<HydratedSetup> {
  const { generated } = opts;
  const steps = [...(generated.steps ?? [])].sort((a, b) => a.order - b.order);
  const budgetBreakdown = generated.budgetBreakdown ?? [];

  const usedIds = Array.from(
    new Set([
      ...steps.flatMap((s) => s.productIds ?? []),
      ...budgetBreakdown.map((b) => b.productId),
    ])
  );

  const productMap = new Map<string, Product>();
  if (usedIds.length > 0) {
    const { data: full } = await supabase
      .from("products")
      .select(FULL_PRODUCT_SELECT)
      .in("id", usedIds);
    for (const p of (full ?? []) as Product[]) productMap.set(p.id, p);
  }

  const hydratedSteps: HydratedStep[] = steps.map((s) => ({
    order: s.order,
    title: s.title,
    rationale: s.rationale,
    products: (s.productIds ?? [])
      .map((id) => productMap.get(id))
      .filter((p): p is Product => !!p),
  }));

  return {
    requestId: opts.requestId,
    summary: generated.summary ?? "",
    steps: hydratedSteps,
    budgetBreakdown: budgetBreakdown.map((b) => ({
      product: productMap.get(b.productId) ?? null,
      estimatedCost: b.estimatedCost,
      note: b.note,
    })),
    totalEstimate: generated.totalEstimate ?? 0,
    unmatchedNeeds: generated.unmatchedNeeds ?? [],
    budgetAmount: opts.budgetAmount,
    budgetCurrency: opts.budgetCurrency,
  };
}

/**
 * Record the user's satisfaction. When satisfied, notify the owners of every
 * recommended product so they can reach out.
 */
export async function confirmSetup(
  requestId: string,
  satisfied: boolean
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error: updateErr } = await supabase
    .from("ai_setup_requests")
    .update({ satisfied, status: satisfied ? "confirmed" : "dismissed" })
    .eq("id", requestId)
    .eq("requester_id", user.id);

  if (updateErr) return { success: false, error: updateErr.message };

  if (satisfied) {
    const { error: rpcErr } = await supabase.rpc("notify_ai_setup_owners", {
      p_request_id: requestId,
    });
    if (rpcErr) {
      console.error("[confirmSetup] notify RPC failed:", rpcErr.message);
      // The request is saved; surface a soft failure.
      return {
        success: true,
        message: "Saved, but we couldn't notify every vendor. They can still see your request.",
      };
    }
  }

  return {
    success: true,
    message: satisfied
      ? "The product owners have been notified and will reach out to collaborate."
      : "Thanks for the feedback — adjust your brief and try again.",
  };
}

/** The current user's past setup requests, most recent first. */
export async function getSetupHistory(): Promise<SetupHistoryItem[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ai_setup_requests")
    .select("id, brief, budget_amount, budget_currency, status, satisfied, created_at")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching setup history:", error);
    return [];
  }

  return (data ?? []).map((r: Record<string, unknown>) => {
    const brief = (r.brief ?? {}) as Record<string, unknown>;
    return {
      id: r.id as string,
      projectType: (brief.projectType as string) ?? "Setup",
      goals: (brief.goals as string) ?? "",
      budgetAmount: (r.budget_amount as number) ?? 0,
      budgetCurrency: (r.budget_currency as string) ?? "USD",
      status: (r.status as SetupHistoryItem["status"]) ?? "generated",
      createdAt: r.created_at as string,
    };
  });
}

/** Re-hydrate a past request (owned by the caller) for display. */
export async function getSetupById(id: string): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: row, error } = await supabase
    .from("ai_setup_requests")
    .select("id, brief, budget_amount, budget_currency, recommendation")
    .eq("id", id)
    .eq("requester_id", user.id)
    .maybeSingle();

  if (error || !row) return { success: false, error: "Request not found." };

  const r = row as Record<string, unknown>;
  const setup = await hydrateSetup(supabase, {
    requestId: r.id as string,
    generated: (r.recommendation ?? {}) as GeneratedSetup,
    budgetAmount: (r.budget_amount as number) ?? 0,
    budgetCurrency: (r.budget_currency as string) ?? "USD",
  });

  return { success: true, setup };
}

/** Incoming AI-driven leads for an organization (parity with demo requests). */
export async function getOrganizationAiRequests(organizationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: orgProducts } = await supabase
    .from("products")
    .select("id")
    .eq("organization_id", organizationId);

  const ids = (orgProducts ?? []).map((p: { id: string }) => p.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("ai_setup_requests")
    .select("*")
    .eq("status", "confirmed")
    .overlaps("product_ids", ids)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching AI setup requests:", error);
    return [];
  }
  return data;
}
