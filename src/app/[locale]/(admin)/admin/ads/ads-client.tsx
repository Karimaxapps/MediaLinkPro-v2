"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Pause,
  Play,
  Pencil,
  ExternalLink,
  MousePointerClick,
  Eye,
  Upload,
  Loader2,
  X,
  ImageIcon,
} from "lucide-react";
import {
  adminCreateCampaign,
  adminUpdateCampaign,
  adminDeleteCampaign,
  adminUploadAdImage,
} from "@/features/admin/server/ads";
import type { AdCampaign } from "@/features/advertising/server/actions";

const PLACEMENTS: { value: AdCampaign["placement"]; label: string }[] = [
  { value: "dashboard_hero_banner", label: "Feed banner (below Latest Products)" },
  { value: "jobs_sidebar", label: "Jobs sidebar" },
  { value: "job_details_sidebar", label: "Job detail sidebar" },
  { value: "events_sidebar", label: "Events sidebar" },
  { value: "sidebar", label: "Dashboard sidebar" },
  { value: "feed", label: "Dashboard sidebar (below Event card)" },
  { value: "marketplace", label: "Marketplace" },
  { value: "mobile_top_feed_screen1", label: "📱 Mobile · Top feed (Screen 1)" },
  { value: "mobile_middle_feed_screen2", label: "📱 Mobile · Middle feed (Screen 2)" },
];

/** Curated CTA labels available across every placement. */
const CTA_OPTIONS = [
  "Learn more",
  "Buy",
  "Shop now",
  "Register",
  "Sign up",
  "Subscribe",
  "Apply",
  "Book now",
  "Download",
  "Get started",
  "Try it free",
  "Visit",
  "Contact us",
  "More",
] as const;

type CtaOption = (typeof CTA_OPTIONS)[number];

const isCtaOption = (v: string): v is CtaOption => (CTA_OPTIONS as readonly string[]).includes(v);

/**
 * Real rendered proportions for each placement.
 * `previewWidth` is the on-screen width used in the admin preview (NOT a recommendation).
 * `recommendedRes` is the image size advertisers should upload (2× the rendered size for retina).
 */
const PLACEMENT_SPECS: Record<
  AdCampaign["placement"],
  {
    previewWidth: number; // px — preview card width
    aspect: string; // CSS aspect-ratio, e.g. "5 / 1"
    recommendedRes: string; // displayed below the preview
    layout: "overlay" | "stacked";
    caption: string;
  }
> = {
  dashboard_hero_banner: {
    previewWidth: 560,
    aspect: "5 / 1",
    recommendedRes: "1600 × 320 px · 5:1",
    layout: "overlay",
    caption: "Wide hero banner shown below Latest Products in the web dashboard.",
  },
  sidebar: {
    previewWidth: 280,
    aspect: "5 / 2",
    recommendedRes: "800 × 320 px · 5:2 (image area only)",
    layout: "stacked",
    caption: "Sidebar card on the dashboard. Image on top, text + CTA below.",
  },
  jobs_sidebar: {
    previewWidth: 280,
    aspect: "5 / 2",
    recommendedRes: "800 × 320 px · 5:2 (image area only)",
    layout: "stacked",
    caption: "Sidebar card on the Jobs page.",
  },
  job_details_sidebar: {
    previewWidth: 280,
    aspect: "5 / 2",
    recommendedRes: "800 × 320 px · 5:2 (image area only)",
    layout: "stacked",
    caption: "Sidebar card on the Job Details page.",
  },
  events_sidebar: {
    previewWidth: 280,
    aspect: "5 / 2",
    recommendedRes: "800 × 320 px · 5:2 (image area only)",
    layout: "stacked",
    caption: "Sidebar card on the Events page.",
  },
  feed: {
    previewWidth: 280,
    aspect: "10 / 7",
    recommendedRes: "800 × 560 px · ~10:7",
    layout: "overlay",
    caption:
      "Sponsored card in the dashboard right column, below the Upcoming Event card. Image fills the card; text + CTA overlay it.",
  },
  marketplace: {
    previewWidth: 320,
    aspect: "5 / 2",
    recommendedRes: "1000 × 400 px · 5:2 (image area only)",
    layout: "stacked",
    caption: "Sponsored tile in the Marketplace grid.",
  },
  mobile_top_feed_screen1: {
    previewWidth: 360,
    aspect: "16 / 9",
    recommendedRes: "1280 × 720 px · 16:9",
    layout: "overlay",
    caption:
      "Mobile · pinned at the top of the home feed on Screen 1. Image fills the card; text + CTA overlay it.",
  },
  mobile_middle_feed_screen2: {
    previewWidth: 360,
    aspect: "16 / 9",
    recommendedRes: "1280 × 720 px · 16:9",
    layout: "overlay",
    caption: "Mobile · injected mid-feed on Screen 2. Same layout as the top placement.",
  },
};

const STATUS_COLORS: Record<AdCampaign["status"], string> = {
  active: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
  paused: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  ended: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function AdminAdsClient({ campaigns }: { campaigns: AdCampaign[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(campaigns.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emptyForm = {
    name: "",
    title: "",
    body: "",
    cta_label: "Learn more",
    cta_url: "",
    image_url: "",
    placement: "jobs_sidebar" as AdCampaign["placement"],
    status: "active" as AdCampaign["status"],
    starts_at: "",
    ends_at: "",
  };
  const [form, setForm] = useState(emptyForm);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_IMAGE_MB = 5;
  const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

  const formatMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setUploadError(null);

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      const msg = "Only JPG, PNG, WebP, or GIF files are supported.";
      setUploadError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const msg = `Image is ${formatMb(file.size)} MB — max allowed is ${MAX_IMAGE_MB} MB.`;
      setUploadError(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await adminUploadAdImage(fd);
      if (result.success && result.url) {
        update("image_url", result.url);
        toast.success("Image uploaded");
      } else {
        const msg = result.error ?? "Upload failed.";
        setUploadError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed — please try again.";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setUploadError(null);
  };

  const toLocalInput = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fromLocalInput = (v: string): string | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const startEdit = (c: AdCampaign) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      title: c.title,
      body: c.body ?? "",
      cta_label: c.cta_label ?? "Learn more",
      cta_url: c.cta_url,
      image_url: c.image_url ?? "",
      placement: c.placement,
      status: c.status === "ended" ? "paused" : c.status,
      starts_at: toLocalInput(c.starts_at),
      ends_at: toLocalInput(c.ends_at),
    });
    setShowForm(true);
    setUploadError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.cta_url.trim()) {
      toast.error("Name and CTA URL are required");
      return;
    }
    const startsIso = fromLocalInput(form.starts_at);
    const endsIso = fromLocalInput(form.ends_at);
    if (startsIso && endsIso && new Date(endsIso) <= new Date(startsIso)) {
      toast.error("End date must be after start date");
      return;
    }
    startTransition(async () => {
      if (editingId) {
        const result = await adminUpdateCampaign(editingId, {
          name: form.name,
          title: form.title,
          body: form.body || null,
          cta_label: form.cta_label || null,
          cta_url: form.cta_url,
          image_url: form.image_url || null,
          placement: form.placement,
          status: form.status,
          starts_at: startsIso,
          ends_at: endsIso,
        });
        if (result.success) {
          toast.success("Campaign updated");
          resetForm();
          setShowForm(false);
          router.refresh();
        } else {
          toast.error(result.error ?? "Failed to update");
        }
        return;
      }
      const result = await adminCreateCampaign({
        name: form.name,
        title: form.title,
        body: form.body || undefined,
        cta_label: form.cta_label || undefined,
        cta_url: form.cta_url,
        image_url: form.image_url || undefined,
        placement: form.placement,
        status: form.status,
        starts_at: startsIso,
        ends_at: endsIso,
      });
      if (result.success) {
        toast.success("Campaign created");
        resetForm();
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create");
      }
    });
  };

  const toggleStatus = (campaign: AdCampaign) => {
    const next: AdCampaign["status"] = campaign.status === "active" ? "paused" : "active";
    startTransition(async () => {
      const result = await adminUpdateCampaign(campaign.id, { status: next });
      if (result.success) {
        toast.success(next === "active" ? "Campaign activated" : "Campaign paused");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  const handleDelete = (campaign: AdCampaign) => {
    if (!confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await adminDeleteCampaign(campaign.id);
      if (result.success) {
        toast.success("Campaign deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ad Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage promoted content shown across the platform.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
          className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {showForm ? "Hide form" : "New campaign"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit campaign" : "New campaign"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Internal name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Q2 EventBrite promo"
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Placement *</Label>
              <select
                value={form.placement}
                onChange={(e) => update("placement", e.target.value as AdCampaign["placement"])}
                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm [&>option]:bg-[#1F1F1F] [&>option]:text-white"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Headline</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Hire faster with our talent network"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Body</Label>
            <Textarea
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              rows={3}
              placeholder="Optional supporting copy."
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">CTA button</Label>
              <select
                value={isCtaOption(form.cta_label) ? form.cta_label : "Learn more"}
                onChange={(e) => update("cta_label", e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm [&>option]:bg-[#1F1F1F] [&>option]:text-white"
              >
                {CTA_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-300">CTA URL *</Label>
              <Input
                type="url"
                value={form.cta_url}
                onChange={(e) => update("cta_url", e.target.value)}
                placeholder="https://example.com/landing"
                className="bg-black/20 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {form.image_url ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-black/30 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="Ad preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-[var(--brand)] hover:bg-[#b5975a] text-black text-xs"
                    >
                      {isUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          Replace
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        update("image_url", "");
                        setUploadError(null);
                      }}
                      disabled={isUploading}
                      className="bg-transparent border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-40 rounded-lg border-2 border-dashed border-white/15 bg-black/20 hover:bg-black/30 hover:border-[var(--brand)]/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                      <span className="text-xs">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-gray-500" />
                      <span className="text-xs">
                        <span className="text-[var(--brand)] font-medium">Click to upload</span> or drag
                        an image
                      </span>
                      <span className="text-[10px] text-gray-500">
                        JPG, PNG, WebP, GIF · max {MAX_IMAGE_MB} MB
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Inline upload error */}
              {uploadError && (
                <p
                  role="alert"
                  className="flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-2.5 py-2"
                >
                  <X className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as AdCampaign["status"])}
                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm [&>option]:bg-[#1F1F1F] [&>option]:text-white"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Running period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Start date</Label>
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => update("starts_at", e.target.value)}
                className="bg-black/20 border-white/10 text-white [color-scheme:dark]"
              />
              <p className="text-[10px] text-gray-500">
                Leave empty to start immediately.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">End date</Label>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => update("ends_at", e.target.value)}
                min={form.starts_at || undefined}
                className="bg-black/20 border-white/10 text-white [color-scheme:dark]"
              />
              <p className="text-[10px] text-gray-500">
                Leave empty for no end date.
              </p>
            </div>
          </div>

          {/* Live placement preview */}
          <PlacementPreview
            placement={form.placement}
            title={form.title}
            body={form.body}
            ctaLabel={form.cta_label}
            imageUrl={form.image_url}
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
            >
              {isPending
                ? editingId
                  ? "Saving..."
                  : "Creating..."
                : editingId
                  ? "Save changes"
                  : "Create campaign"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="bg-transparent border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-gray-400">
          No campaigns yet. Click <strong>New campaign</strong> to create the first one.
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              {c.image_url ? (
                <div className="relative h-16 w-24 shrink-0 rounded overflow-hidden bg-black/20">
                  <Image src={c.image_url} alt={c.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-16 w-24 shrink-0 rounded bg-black/20 border border-white/10 flex items-center justify-center text-[10px] text-gray-500">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{c.title}</h3>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[c.status]}`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                    {PLACEMENTS.find((p) => p.value === c.placement)?.label ?? c.placement}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.name}</p>
                <a
                  href={c.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--brand)] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  {c.cta_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {/* Stats */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
                    <Eye className="h-3 w-3 text-gray-400" />
                    {c.impressions.toLocaleString()} impressions
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-md px-2 py-0.5">
                    <MousePointerClick className="h-3 w-3" />
                    {c.clicks.toLocaleString()} clicks
                  </span>
                  {c.impressions > 0 && (
                    <span className="text-xs text-gray-500">
                      {((c.clicks / c.impressions) * 100).toFixed(1)}% CTR
                    </span>
                  )}
                </div>
                {(c.starts_at || c.ends_at) && (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    {c.starts_at
                      ? `From ${new Date(c.starts_at).toLocaleString()}`
                      : "From now"}
                    {" · "}
                    {c.ends_at
                      ? `until ${new Date(c.ends_at).toLocaleString()}`
                      : "no end date"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(c)}
                  disabled={isPending}
                  className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(c)}
                  disabled={isPending}
                  className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  {c.status === "active" ? (
                    <>
                      <Pause className="h-3.5 w-3.5 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(c)}
                  disabled={isPending}
                  className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlacementPreview({
  placement,
  title,
  body,
  ctaLabel,
  imageUrl,
}: {
  placement: AdCampaign["placement"];
  title: string;
  body: string;
  ctaLabel: string;
  imageUrl: string;
}) {
  const spec = PLACEMENT_SPECS[placement];
  if (!spec) return null;

  const label = PLACEMENTS.find((p) => p.value === placement)?.label ?? placement;
  const displayTitle = title || "Headline goes here";
  const displayCta = ctaLabel || "Learn more";

  return (
    <div className="space-y-3 pt-4 border-t border-white/10">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-gray-300">Real-size preview</Label>
        <span className="text-[11px] text-gray-500">{label}</span>
      </div>
      <p className="text-[11px] text-gray-500 -mt-1">{spec.caption}</p>

      <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 flex flex-col items-center gap-3">
        {/* Wrapper at the real on-screen width */}
        <div style={{ width: `${spec.previewWidth}px`, maxWidth: "100%" }}>
          {spec.layout === "overlay" ? (
            <OverlayPreview
              aspect={spec.aspect}
              title={displayTitle}
              body={body}
              cta={displayCta}
              imageUrl={imageUrl}
            />
          ) : (
            <StackedPreview
              aspect={spec.aspect}
              title={displayTitle}
              body={body}
              cta={displayCta}
              imageUrl={imageUrl}
            />
          )}
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          Rendered at <span className="font-mono">{spec.previewWidth}px</span> wide ·{" "}
          <span className="text-[var(--brand)] font-medium">
            Recommended image: {spec.recommendedRes}
          </span>
        </p>
      </div>
    </div>
  );
}

function OverlayPreview({
  aspect,
  title,
  body,
  cta,
  imageUrl,
}: {
  aspect: string;
  title: string;
  body: string;
  cta: string;
  imageUrl: string;
}) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden bg-black/40 border border-white/10"
      style={{ aspectRatio: aspect }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 bg-gradient-to-br from-white/5 to-white/[0.02]">
          Upload an image to preview
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <div className="min-w-0 flex-1 text-white drop-shadow">
          <h4 className="text-sm font-semibold truncate">{title}</h4>
          {body && <p className="text-[11px] text-white/85 mt-0.5 line-clamp-2">{body}</p>}
        </div>
        <button
          type="button"
          className="shrink-0 bg-[var(--brand)] hover:bg-[#b5975a] text-black text-xs font-semibold rounded-full px-4 py-1.5 shadow"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function StackedPreview({
  aspect,
  title,
  body,
  cta,
  imageUrl,
}: {
  aspect: string;
  title: string;
  body: string;
  cta: string;
  imageUrl: string;
}) {
  return (
    <div className="relative rounded-xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/5 to-white/5 overflow-hidden">
      <div className="relative w-full bg-black/40" style={{ aspectRatio: aspect }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500 bg-gradient-to-br from-white/5 to-white/[0.02]">
            Upload an image to preview
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
        {body && <p className="text-[11px] text-gray-400 line-clamp-2">{body}</p>}
        <span className="inline-block mt-1 text-xs font-medium text-[var(--brand)]">{cta} →</span>
      </div>
    </div>
  );
}
