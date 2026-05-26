"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ActionState } from "@/features/types";
import { PRICING_MODELS, PRICING_MODEL_LABELS, PLATFORMS, RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "../constants";
import type { AiTool, AiToolCategory } from "../types";

type ResourceRow = { resource_type: string; title: string; url: string };

interface AiToolFormProps {
    categories: AiToolCategory[];
    organizations?: { id: string; name: string; slug: string; logo_url: string | null }[];
    createAction?: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
    updateAction?: (id: string, formData: FormData) => Promise<ActionState>;
    initialData?: AiTool;
    cancelHref?: string;
    afterSaveHref?: string;
}

export function AiToolForm({
    categories,
    organizations = [],
    createAction,
    updateAction,
    initialData,
    cancelHref = "/admin/ai-tools",
    afterSaveHref = "/admin/ai-tools",
}: AiToolFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(initialData?.name ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [tagline, setTagline] = useState(initialData?.tagline ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [logoUrl, setLogoUrl] = useState(initialData?.logo_url ?? "");
    const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? "");
    const [galleryText, setGalleryText] = useState((initialData?.gallery_urls ?? []).join("\n"));
    const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
    const [organizationId, setOrganizationId] = useState(initialData?.organization_id ?? "");
    const [mainLink, setMainLink] = useState(initialData?.main_link ?? "");
    const [pricingModel, setPricingModel] = useState(initialData?.pricing_model ?? "");
    const [pricingUrl, setPricingUrl] = useState(initialData?.pricing_url ?? "");
    const [platforms, setPlatforms] = useState<string[]>(initialData?.platforms ?? []);
    const [tagsText, setTagsText] = useState((initialData?.tags ?? []).join(", "));
    const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);
    const [status, setStatus] = useState(initialData?.status ?? "draft");
    const [resources, setResources] = useState<ResourceRow[]>(
        (initialData?.ai_tool_resources ?? []).map((r) => ({
            resource_type: r.resource_type,
            title: r.title,
            url: r.url,
        }))
    );

    const togglePlatform = (p: string) => {
        setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
    };

    const addResource = () =>
        setResources((prev) => [...prev, { resource_type: "documentation", title: "", url: "" }]);
    const updateResource = (i: number, field: keyof ResourceRow, value: string) =>
        setResources((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    const removeResource = (i: number) =>
        setResources((prev) => prev.filter((_, idx) => idx !== i));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("tagline", tagline);
        formData.set("description", description);
        formData.set("logo_url", logoUrl);
        formData.set("cover_image_url", coverImageUrl);
        galleryText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((url) => formData.append("gallery_urls", url));
        formData.set("category_id", categoryId);
        formData.set("organization_id", organizationId);
        formData.set("main_link", mainLink);
        formData.set("pricing_model", pricingModel);
        formData.set("pricing_url", pricingUrl);
        platforms.forEach((p) => formData.append("platforms", p));
        tagsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((tag) => formData.append("tags", tag));
        formData.set("is_featured", isFeatured ? "true" : "false");
        formData.set("status", status);
        formData.set(
            "resources",
            JSON.stringify(resources.filter((r) => r.title.trim() && r.url.trim()))
        );

        startTransition(async () => {
            const result =
                initialData && updateAction
                    ? await updateAction(initialData.id, formData)
                    : createAction
                      ? await createAction({}, formData)
                      : { success: false, error: "No action provided" };

            if (result.success) {
                toast.success(result.message ?? "Saved");
                router.push(afterSaveHref);
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to save");
            }
        });
    };

    const inputClass = "border-white/10 bg-black/20 text-white focus:border-[var(--brand)]/50";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic info */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase())}
                            placeholder="my-ai-tool"
                            required
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                        id="tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Short one-line summary"
                        maxLength={160}
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className={inputClass}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {organizations.length > 0 && (
                        <div className="space-y-2">
                            <Label>Company / Organization</Label>
                            <Select value={organizationId} onValueChange={setOrganizationId}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Link to a company profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">— None —</SelectItem>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </section>

            {/* Links & media */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Links & Media</h2>
                <div className="space-y-2">
                    <Label htmlFor="main_link">Main Link *</Label>
                    <Input
                        id="main_link"
                        value={mainLink}
                        onChange={(e) => setMainLink(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className={inputClass}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo URL</Label>
                        <Input id="logo_url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cover_image_url">Cover Image URL</Label>
                        <Input
                            id="cover_image_url"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery URLs (one per line)</Label>
                    <Textarea
                        id="gallery"
                        value={galleryText}
                        onChange={(e) => setGalleryText(e.target.value)}
                        rows={3}
                        className={inputClass}
                    />
                </div>
            </section>

            {/* Pricing & platforms */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Pricing & Platforms</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Pricing Model</Label>
                        <Select value={pricingModel} onValueChange={setPricingModel}>
                            <SelectTrigger className={inputClass}>
                                <SelectValue placeholder="Select pricing model" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRICING_MODELS.map((pm) => (
                                    <SelectItem key={pm} value={pm}>
                                        {PRICING_MODEL_LABELS[pm]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pricing_url">Pricing URL</Label>
                        <Input
                            id="pricing_url"
                            value={pricingUrl}
                            onChange={(e) => setPricingUrl(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => togglePlatform(p)}
                                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                    platforms.includes(p)
                                        ? "border-[var(--brand)] bg-[var(--brand)] font-medium text-black"
                                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                        id="tags"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="video, transcription, generative"
                        className={inputClass}
                    />
                </div>
            </section>

            {/* Community resources */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Community Resources</h2>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addResource}
                        className="gap-1 border-white/10 bg-transparent text-gray-300 hover:bg-white/10"
                    >
                        <Plus className="h-4 w-4" /> Add Resource
                    </Button>
                </div>
                {resources.length === 0 && (
                    <p className="text-sm text-gray-500">No resources added yet.</p>
                )}
                <div className="space-y-3">
                    {resources.map((r, i) => (
                        <div key={i} className="grid items-end gap-2 md:grid-cols-[160px_1fr_1fr_auto]">
                            <Select
                                value={r.resource_type}
                                onValueChange={(v) => updateResource(i, "resource_type", v)}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RESOURCE_TYPES.map((rt) => (
                                        <SelectItem key={rt} value={rt}>
                                            {RESOURCE_TYPE_LABELS[rt]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Title"
                                value={r.title}
                                onChange={(e) => updateResource(i, "title", e.target.value)}
                                className={inputClass}
                            />
                            <Input
                                placeholder="https://..."
                                value={r.url}
                                onChange={(e) => updateResource(i, "url", e.target.value)}
                                className={inputClass}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeResource(i)}
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Publishing */}
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold text-white">Publishing</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Featured</Label>
                        <p className="text-xs text-gray-500">Show this tool in the dashboard feed.</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as AiTool["status"])}>
                        <SelectTrigger className={inputClass}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(cancelHref)}
                    className="border-white/10 bg-transparent text-gray-300 hover:bg-white/10"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-[var(--brand)] font-semibold text-black hover:bg-[#B5964A]"
                >
                    {isPending ? "Saving..." : initialData ? "Update AI Tool" : "Create AI Tool"}
                </Button>
            </div>
        </form>
    );
}
