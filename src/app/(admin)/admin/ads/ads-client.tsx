"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pause, Play, ExternalLink } from "lucide-react";
import {
    adminCreateCampaign,
    adminUpdateCampaign,
    adminDeleteCampaign,
} from "@/features/admin/server/ads";
import type { AdCampaign } from "@/features/advertising/server/actions";

const PLACEMENTS: { value: AdCampaign["placement"]; label: string }[] = [
    { value: "dashboard_hero_banner", label: "Dashboard hero banner" },
    { value: "jobs_sidebar", label: "Jobs sidebar" },
    { value: "job_details_sidebar", label: "Job detail sidebar" },
    { value: "events_sidebar", label: "Events sidebar" },
    { value: "sidebar", label: "Dashboard sidebar" },
    { value: "feed", label: "Feed" },
    { value: "marketplace", label: "Marketplace" },
];

const STATUS_COLORS: Record<AdCampaign["status"], string> = {
    active: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
    paused: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    ended: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function AdminAdsClient({ campaigns }: { campaigns: AdCampaign[] }) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(campaigns.length === 0);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        name: "",
        title: "",
        body: "",
        cta_label: "Learn more",
        cta_url: "",
        image_url: "",
        placement: "jobs_sidebar" as AdCampaign["placement"],
        status: "active" as AdCampaign["status"],
    });

    const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.title.trim() || !form.cta_url.trim()) {
            toast.error("Name, title, and CTA URL are required");
            return;
        }
        startTransition(async () => {
            const result = await adminCreateCampaign({
                name: form.name,
                title: form.title,
                body: form.body || undefined,
                cta_label: form.cta_label || undefined,
                cta_url: form.cta_url,
                image_url: form.image_url || undefined,
                placement: form.placement,
                status: form.status,
            });
            if (result.success) {
                toast.success("Campaign created");
                setForm({
                    name: "",
                    title: "",
                    body: "",
                    cta_label: "Learn more",
                    cta_url: "",
                    image_url: "",
                    placement: "jobs_sidebar",
                    status: "active",
                });
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
                    onClick={() => setShowForm((s) => !s)}
                    className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    {showForm ? "Hide form" : "New campaign"}
                </Button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleCreate}
                    className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
                >
                    <h2 className="text-lg font-semibold">New campaign</h2>

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
                                onChange={(e) =>
                                    update("placement", e.target.value as AdCampaign["placement"])
                                }
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
                        <Label className="text-gray-300">Headline *</Label>
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
                            <Label className="text-gray-300">CTA label</Label>
                            <Input
                                value={form.cta_label}
                                onChange={(e) => update("cta_label", e.target.value)}
                                placeholder="Learn more"
                                className="bg-black/20 border-white/10 text-white"
                            />
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
                            <Label className="text-gray-300">Image URL</Label>
                            <Input
                                type="url"
                                value={form.image_url}
                                onChange={(e) => update("image_url", e.target.value)}
                                placeholder="https://..."
                                className="bg-black/20 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Status</Label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    update("status", e.target.value as AdCampaign["status"])
                                }
                                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm [&>option]:bg-[#1F1F1F] [&>option]:text-white"
                            >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
                        >
                            {isPending ? "Creating..." : "Create campaign"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
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
                                    <Image
                                        src={c.image_url}
                                        alt={c.title}
                                        fill
                                        className="object-cover"
                                    />
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
                                        {c.placement}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {c.name} · {c.impressions} impressions · {c.clicks} clicks
                                </p>
                                <a
                                    href={c.cta_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#C6A85E] hover:underline inline-flex items-center gap-1 mt-1"
                                >
                                    {c.cta_url}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
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
