"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles, Wand2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/features/products/components/product-card";
import { formatCurrency } from "@/lib/utils";
import { SetupDiagram, type DiagramNode } from "./setup-diagram";
import { SetupHistory } from "./setup-history";
import type { Product } from "@/features/products/types";
import type { HydratedSetup, SetupHistoryItem } from "../types";

import { setupRequestSchema, type SetupFormInput, type SetupRequestInput } from "../schema";
import {
  PROJECT_TYPES,
  ENVIRONMENTS,
  SUPPORTED_CURRENCIES,
} from "../constants";
import { generateSetup, confirmSetup, getSetupById } from "../server/actions";

// Infrastructure-style categories that make a good central hub in the diagram.
const HUB_PATTERN =
  /(router|switch|matrix|infrastructure|transmission|signal|mixing console|orchestration|asset management|workflow|interface|playout)/i;

function isHub(p: Product): boolean {
  return HUB_PATTERN.test(`${p.main_category} ${p.sub_category ?? ""} ${p.product_type}`);
}

function productImage(p: Product): string | null {
  return p.gallery_urls?.[0] || p.logo_url || null;
}

/** Build center + radial nodes for the diagram from a hydrated setup. */
function buildDiagram(setup: HydratedSetup): {
  centerLabel: string;
  centerSublabel?: string;
  centerImageUrl?: string | null;
  centerCompanyLogoUrl?: string | null;
  centerCompanyName?: string | null;
  nodes: DiagramNode[];
} {
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const step of setup.steps) {
    for (const p of step.products) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        products.push(p);
      }
    }
  }

  const hub = products.find(isHub);

  function orgLogo(p: Product): string | null {
    return (p.organizations as { logo_url?: string } | null)?.logo_url ?? null;
  }
  function orgName(p: Product): string | null {
    return (p.organizations as { name?: string } | null)?.name ?? null;
  }

  if (hub) {
    return {
      centerLabel: hub.name,
      centerSublabel: hub.main_category,
      centerImageUrl: productImage(hub),
      centerCompanyLogoUrl: orgLogo(hub),
      centerCompanyName: orgName(hub),
      nodes: products
        .filter((p) => p.id !== hub.id)
        .map((p) => ({
          id: p.id,
          label: p.name,
          sublabel: p.main_category,
          imageUrl: productImage(p),
          companyLogoUrl: orgLogo(p),
          companyName: orgName(p),
          linkToCard: true,
        })),
    };
  }

  return {
    centerLabel: "Your Setup",
    centerSublabel: "Signal hub",
    centerImageUrl: null,
    centerCompanyLogoUrl: null,
    centerCompanyName: null,
    nodes: products.map((p) => ({
      id: p.id,
      label: p.name,
      sublabel: p.main_category,
      imageUrl: productImage(p),
      companyLogoUrl: orgLogo(p),
      companyName: orgName(p),
      linkToCard: true,
    })),
  };
}

export function SetupBuilder({
  initialHistory = [],
}: {
  initialHistory?: SetupHistoryItem[];
}) {
  const [isGenerating, startGenerating] = useTransition();
  const [isConfirming, startConfirming] = useTransition();
  const [setup, setSetup] = useState<HydratedSetup | null>(null);
  const [decided, setDecided] = useState(false);
  const [history, setHistory] = useState<SetupHistoryItem[]>(initialHistory);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const form = useForm<SetupFormInput, unknown, SetupRequestInput>({
    resolver: zodResolver(setupRequestSchema),
    defaultValues: {
      projectType: "Home Studio",
      environment: "Home / Personal",
      goals: "",
      requirements: "",
      budgetAmount: 1500,
      budgetCurrency: "USD",
    },
  });

  const onSubmit = (values: SetupRequestInput) => {
    startGenerating(async () => {
      const res = await generateSetup(values);
      if (res.success && res.setup) {
        const next = res.setup as HydratedSetup;
        setSetup(next);
        setDecided(false);
        setActiveId(next.requestId);
        // Prepend to history so the new run shows up immediately.
        setHistory((prev) => [
          {
            id: next.requestId,
            projectType: values.projectType,
            goals: values.goals,
            budgetAmount: values.budgetAmount,
            budgetCurrency: values.budgetCurrency,
            status: "generated",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        toast.error(res.error ?? "Something went wrong.");
      }
    });
  };

  const onSelectHistory = (id: string) => {
    if (id === activeId || loadingId) return;
    setLoadingId(id);
    startGenerating(async () => {
      const res = await getSetupById(id);
      if (res.success && res.setup) {
        setSetup(res.setup as HydratedSetup);
        setDecided(false);
        setActiveId(id);
      } else {
        toast.error(res.error ?? "Could not load that setup.");
      }
      setLoadingId(null);
    });
  };

  const onNewSetup = () => {
    setSetup(null);
    setDecided(false);
    setActiveId(null);
  };

  const onDecision = (satisfied: boolean) => {
    if (!setup) return;
    startConfirming(async () => {
      const res = await confirmSetup(setup.requestId, satisfied);
      if (res.success) {
        setDecided(true);
        toast.success(res.message ?? "Saved.");
        setHistory((prev) =>
          prev.map((h) =>
            h.id === setup.requestId
              ? { ...h, status: satisfied ? "confirmed" : "dismissed" }
              : h
          )
        );
        if (!satisfied) {
          setSetup(null);
        }
      } else {
        toast.error(res.error ?? "Could not save your response.");
      }
    });
  };

  const overBudget = setup ? setup.totalEstimate > setup.budgetAmount : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
      <SetupHistory
        items={history}
        activeId={activeId}
        loadingId={loadingId}
        onSelect={onSelectHistory}
        onNew={onNewSetup}
      />

      <div className="space-y-10 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-[#C6A85E]" />
          AI Setup Builder
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Describe your project and budget. We&apos;ll design a step-by-step setup using real
          products from the MediaLinkPro catalog, then connect you with the vendors.
        </p>
      </div>

      {/* Example — shown until the user generates (or starts generating) their own setup */}
      {!setup && !isGenerating && <SetupExample />}

      {/* Brief form */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Project type</Label>
            <Select
              value={form.watch("projectType")}
              onValueChange={(v) =>
                form.setValue("projectType", v as SetupRequestInput["projectType"])
              }
            >
              <SelectTrigger className="bg-transparent border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Environment</Label>
            <Select
              value={form.watch("environment")}
              onValueChange={(v) =>
                form.setValue("environment", v as SetupRequestInput["environment"])
              }
            >
              <SelectTrigger className="bg-transparent border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Main goals</Label>
          <Input
            {...form.register("goals")}
            placeholder="e.g. Record a weekly two-person podcast with broadcast-quality audio"
            className="bg-transparent border-white/15 text-white"
          />
          {form.formState.errors.goals && (
            <p className="text-sm text-red-400">{form.formState.errors.goals.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Technical details &amp; requirements (optional)</Label>
          <Textarea
            {...form.register("requirements")}
            rows={4}
            placeholder="Room size, existing gear, must-have software, connectivity, future plans…"
            className="bg-transparent border-white/15 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Budget</Label>
            <Input
              type="number"
              min={1}
              {...form.register("budgetAmount")}
              className="bg-transparent border-white/15 text-white"
            />
            {form.formState.errors.budgetAmount && (
              <p className="text-sm text-red-400">
                {form.formState.errors.budgetAmount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Currency</Label>
            <Select
              value={form.watch("budgetCurrency")}
              onValueChange={(v) =>
                form.setValue("budgetCurrency", v as SetupRequestInput["budgetCurrency"])
              }
            >
              <SelectTrigger className="bg-transparent border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <div className={`ai-glow w-full max-w-md ${isGenerating ? "ai-glow--active" : ""}`}>
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full h-12 rounded-full bg-[#C6A85E] hover:bg-[#b59750] text-black font-semibold text-base"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Designing your setup…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate setup
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Result */}
      {setup && (
        <div className="space-y-8">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-white">Recommended setup</h2>
            {setup.summary && <p className="text-gray-300">{setup.summary}</p>}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge className="bg-black/40 border border-white/10 text-gray-200">
                Estimated total: {formatCurrency(setup.totalEstimate, setup.budgetCurrency)}
              </Badge>
              <Badge className="bg-black/40 border border-white/10 text-gray-200">
                Your budget: {formatCurrency(setup.budgetAmount, setup.budgetCurrency)}
              </Badge>
              {overBudget ? (
                <Badge className="bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Over budget
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Within budget
                </Badge>
              )}
            </div>
          </div>

          {/* Schema diagram: hub + connected products */}
          {(() => {
            const diagram = buildDiagram(setup);
            return (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Connection schema
                </h3>
                <SetupDiagram
                centerLabel={diagram.centerLabel}
                centerSublabel={diagram.centerSublabel}
                centerImageUrl={diagram.centerImageUrl}
                centerCompanyLogoUrl={diagram.centerCompanyLogoUrl}
                centerCompanyName={diagram.centerCompanyName}
                nodes={diagram.nodes}
              />
                <p className="text-xs text-gray-500">
                  Each node is a recommended product wired to the central hub. Click a node to jump
                  to its details below.
                </p>
              </div>
            );
          })()}

          {/* Text explanation + product cards */}
          <div className="space-y-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Step-by-step explanation
            </h3>
            {setup.steps.map((step) => (
              <section key={step.order} className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Step {step.order}: {step.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">{step.rationale}</p>
                </div>
                {step.products.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {step.products.map((p) => (
                      <div key={p.id} id={`product-${p.id}`} className="scroll-mt-24">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {setup.unmatchedNeeds.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-2">
              <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Not yet covered by the catalog
              </h3>
              <ul className="list-disc list-inside text-amber-100/80 text-sm space-y-1">
                {setup.unmatchedNeeds.map((need, i) => (
                  <li key={i}>{need}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Satisfaction prompt */}
          {!decided && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Are you satisfied with this setup and budget?
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={isConfirming}
                  onClick={() => onDecision(true)}
                  className="bg-[#C6A85E] hover:bg-[#b59750] text-black font-semibold"
                >
                  Yes, connect me with these vendors
                </Button>
                <Button
                  disabled={isConfirming}
                  variant="outline"
                  onClick={() => onDecision(false)}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Not quite — refine my brief
                </Button>
              </div>
            </div>
          )}

          {decided && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="text-emerald-100">
                The product owners have been notified and will reach out to collaborate.
              </p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

/** A static, illustrative example of a request and the structured output. */
function SetupExample() {
  const exampleSteps = [
    {
      order: 1,
      title: "Multi-mic audio capture & mixing",
      rationale:
        "A broadcast-grade console routes multiple mic sources with low-latency monitoring — the signal spine of the entire production.",
      products: ["Lawo mc²96 Grand Production Console", "Shure SM7B", "Sennheiser MKH 416", "Neumann U 87 Ai"],
    },
    {
      order: 2,
      title: "Camera acquisition",
      rationale:
        "A 360° camera captures the full studio environment for immersive replay and highlight clips alongside the main broadcast feed.",
      products: ["Insta360 ONE RS 1-Inch 360 Edition"],
    },
    {
      order: 3,
      title: "Live encode & stream",
      rationale:
        "A hardware encoder compresses the mixed A/V signal for reliable low-latency contribution over IP to the distribution chain.",
      products: ["Haivision Makito X4"],
    },
    {
      order: 4,
      title: "Post-production & edit",
      rationale:
        "An industry-standard DAW handles multi-track editing, colour and finishing for packaged segments and replays.",
      products: ["Avid Pro Tools"],
    },
  ];

  // Real products from the MediaLinkPro catalog
  const exampleNodes: DiagramNode[] = [
    {
      id: "dbe299ba-89de-414a-b6b2-1ec8ad6b75a6",
      label: "SM7B",
      sublabel: "Microphone",
      imageUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/products/shure-sm7b/logo_1779308848298_0.jpg",
      companyLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shure_Logo_2024.svg/500px-Shure_Logo_2024.svg.png",
      companyName: "Shure",
    },
    {
      id: "1132e2bb-b4c3-42e9-bb32-150fb3ca410d",
      label: "MKH 416",
      sublabel: "Shotgun Mic",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Sennheiser_MKH416.jpg",
      companyLogoUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779403311174_sux3mu32jto.png",
      companyName: "Sennheiser",
    },
    {
      id: "c388f0e4-22e5-4d0f-a2db-474f34c9442c",
      label: "U 87 Ai",
      sublabel: "Studio Mic",
      imageUrl: "https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg",
      companyLogoUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779308845855_neumann_oeqrici4.png",
      companyName: "Neumann",
    },
    {
      id: "f8ef3ea6-4643-4763-9434-5acb451c75f2",
      label: "Insta360 ONE RS",
      sublabel: "360° Camera",
      imageUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/products/insta360-one-rs-1inch-360/g_1779120004958_0.png",
      companyLogoUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779006964290_92rks4rg1kh.jpg",
      companyName: "Insta360",
    },
    {
      id: "c7616d51-2345-4360-aea8-a4fd0d88ad7e",
      label: "Makito X4",
      sublabel: "Live Encoder",
      imageUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/products/b713cc88-78fa-472a-bb8a-46eef3c1d5ea/product-gallery/product-gallery_1779275769295.jpg",
      companyLogoUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779135304505_haivision_j050vz6k.png",
      companyName: "Haivision",
    },
    {
      id: "c0416cdc-bfb8-4e57-a307-a6692b6b281c",
      label: "Pro Tools",
      sublabel: "DAW",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop",
      companyLogoUrl: "https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779007709299_2xsr9pj7px3.png",
      companyName: "Avid",
    },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#C6A85E]" />
        <h2 className="text-lg font-semibold text-white">See how it works — example</h2>
      </div>

      {/* Example request */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Example request
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["Project type", "Broadcast Studio"],
            ["Environment", "Professional Facility"],
            ["Budget", "$25,000 USD"],
            ["Main goals", "Live news production with multi-mic capture and encoding"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
              <p className="text-sm text-gray-200 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example structured output */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Example structured output
        </h3>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-2">
          <p className="text-gray-300 text-sm">
            A professional broadcast studio setup covering audio capture, live encoding, and
            post-production — within a $25,000 budget.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className="bg-black/40 border border-white/10 text-gray-200">
              Estimated total: $22,400
            </Badge>
            <Badge className="bg-black/40 border border-white/10 text-gray-200">
              Your budget: $25,000
            </Badge>
            <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Within budget
            </Badge>
          </div>
        </div>

        <SetupDiagram
          centerLabel="mc²96 Console"
          centerSublabel="Broadcast audio hub"
          centerImageUrl="https://lawo.com/wp-content/uploads/2024/09/mc2-96_2024_BIG_web.jpg"
          centerCompanyLogoUrl="https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779135338746_lawo_haiw3va7.png"
          centerCompanyName="Lawo"
          nodes={exampleNodes}
        />

        <ol className="space-y-3">
          {exampleSteps.map((step) => (
            <li
              key={step.order}
              className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-2"
            >
              <p className="font-semibold text-white">
                Step {step.order}: {step.title}
              </p>
              <p className="text-sm text-gray-400">{step.rationale}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {step.products.map((p) => (
                  <Badge
                    key={p}
                    className="bg-[#C6A85E]/10 border border-[#C6A85E]/30 text-[#C6A85E]"
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Not yet covered by the catalog
          </p>
          <p className="text-amber-100/80 text-sm mt-1">
            Studio monitoring speakers and a video production switcher — consider vendors from the Live &amp; Post Production category.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          Illustrative only. Your generated setup uses real products from the MediaLinkPro catalog
          with live pricing.
        </p>
      </div>
    </div>
  );
}
