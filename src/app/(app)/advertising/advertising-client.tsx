"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Plus,
    Megaphone,
    Eye,
    MousePointerClick,
    Play,
    Pause,
    Trash2,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    createCampaign,
    setCampaignStatus,
    deleteCampaign,
    type AdCampaign,
} from "@/features/advertising/server/actions";

export function AdvertisingClient({ campaigns }: { campaigns: AdCampaign[] }) {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [ctaLabel, setCtaLabel] = useState("Learn more");
    const [ctaUrl, setCtaUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [placement, setPlacement] = useState<"feed" | "sidebar" | "marketplace">("feed");
    const [targetCategory, setTargetCategory] = useState("");

    const resetForm = () => {
        setName("");
        setTitle("");
        setBody("");
        setCtaLabel("Learn more");
        setCtaUrl("");
        setImageUrl("");
        setPlacement("feed");
        setTargetCategory("");
    };

    const handleCreate = () => {
        startTransition(async () => {
            const result = await createCampaign({
                name,
                title,
                body: body || undefined,
                cta_label: ctaLabel || undefined,
                cta_url: ctaUrl,
                image_url: imageUrl || undefined,
                placement,
                target_category: targetCategory || undefined,
            });
            if (!result.success) {
                toast.error(result.error ?? "Failed");
                return;
            }
            toast.success("Campaign created as draft");
            resetForm();
            setShowForm(false);
            router.refresh();
        });
    };

    const handleStatus = (id: string, status: AdCampaign["status"]) => {
        startTransition(async () => {
            const result = await setCampaignStatus(id, status);
            if (!result.success) toast.error(result.error ?? "Failed");
            else {
                toast.success("Updated");
                router.refresh();
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this campaign?")) return;
        startTransition(async () => {
            const result = await deleteCampaign(id);
            if (!result.success) toast.error(result.error ?? "Failed");
            else {
                toast.success("Deleted");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-[#C6A85E]" />
                        Advertising
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Create and manage sponsored placements.
                    </p>
                </div>
                {!showForm && (
                    <Button
                        className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Campaign
                    </Button>
                )}
            </div>

            {showForm && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">New Campaign</h2>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Internal name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Q2 2026 product launch"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Placement</Label>
                            <select
                                value={placement}
                                onChange={(e) => setPlacement(e.target.value as "feed" | "sidebar" | "marketplace")}
                                className="w-full h-9 rounded-md bg-white/5 border border-white/10 px-3 text-sm text-white"
                            >
                                <option value="feed">Feed</option>
                                <option value="sidebar">Sidebar</option>
                                <option value="marketplace">Marketplace</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Shown to users"
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Body (optional)</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Brief description shown under the headline"
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>CTA label</Label>
                            <Input
                                value={ctaLabel}
                                onChange={(e) => setCtaLabel(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA URL</Label>
                            <Input
                                value={ctaUrl}
                                onChange={(e) => setCtaUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Target category (optional)</Label>
                            <Input
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                                placeholder="e.g. Broadcast"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="border-white/10"
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#C6A85E] hover:bg-[#b5975a] text-black"
                            disabled={isPending || !name.trim() || !title.trim() || !ctaUrl.trim()}
                            onClick={handleCreate}
                        >
                            Create draft
                        </Button>
                    </div>
                </div>
            )}

            {campaigns.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <Megaphone className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No campaigns yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((c) => {
                        const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : "0.00";
                        return (
                            <div
                                key={c.id}
                                className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start justify-between gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                c.status === "active"
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : c.status === "paused"
                                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                                    : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                            }`}
                                        >
                                            {c.status}
                                        </span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                                            {c.placement}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-white">{c.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{c.title}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {c.impressions.toLocaleString()} impressions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MousePointerClick className="h-3 w-3" />
                                            {c.clicks.toLocaleString()} clicks
                                        </span>
                                        <span>CTR {ctr}%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                    {c.status === "draft" || c.status === "paused" ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                            disabled={isPending}
                                            onClick={() => handleStatus(c.id, "active")}
                                        >
                                            <Play className="h-4 w-4 mr-1" /> Activate
                                        </Button>
                                    ) : c.status === "active" ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                            disabled={isPending}
                                            onClick={() => handleStatus(c.id, "paused")}
                                        >
                                            <Pause className="h-4 w-4 mr-1" /> Pause
                                        </Button>
                                    ) : null}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        disabled={isPending}
                                        onClick={() => handleDelete(c.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
