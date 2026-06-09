"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ExternalLink, ImagePlus, Loader2, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useImageUpload } from "@/hooks/use-image-upload";
import { EVENT_TYPE_LABELS, type EventType } from "@/features/events/types";
import {
    getAdminEventById,
    updateEventAsAdmin,
    type AdminEventEditFields,
    type AdminEventListItem,
} from "@/features/admin/server/actions";

export type OrgOption = { id: string; name: string; slug: string; logo_url: string | null };

const EVENT_STATUSES = ["draft", "published", "cancelled", "completed"] as const;

const inputClass = "bg-black/20 border-white/10 text-white";
const selectClass =
    "w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none";

/** ISO → value for <input type="datetime-local"> in the viewer's local time. */
function toLocalInput(iso?: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
        d.getMinutes()
    )}`;
}

type FormState = {
    organization_id: string;
    title: string;
    description: string;
    event_type: EventType;
    status: string;
    start_date: string;
    end_date: string;
    is_online: boolean;
    location: string;
    online_url: string;
    cover_image_url: string;
    logo_url: string;
    promo_video_url: string;
    max_attendees: string;
    registration_url: string;
    website_url: string;
    linkedin_url: string;
    x_url: string;
    facebook_url: string;
    instagram_url: string;
    tiktok_url: string;
    youtube_url: string;
};

const EMPTY: FormState = {
    organization_id: "",
    title: "",
    description: "",
    event_type: "conference",
    status: "published",
    start_date: "",
    end_date: "",
    is_online: false,
    location: "",
    online_url: "",
    cover_image_url: "",
    logo_url: "",
    promo_video_url: "",
    max_attendees: "",
    registration_url: "",
    website_url: "",
    linkedin_url: "",
    x_url: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    youtube_url: "",
};

type Props = {
    event: AdminEventListItem | null;
    organizations: OrgOption[];
    userId: string;
    open: boolean;
    onClose: () => void;
    onUpdated: (update: Partial<AdminEventListItem> & { id: string }) => void;
};

export function ManageEventSheet({ event, organizations, userId, open, onClose, onUpdated }: Props) {
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY);

    const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isUploading } = useImageUpload({
        userId,
        bucket: "events",
        onSuccess: (url) => update("cover_image_url", url),
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage: uploadLogo, isUploading: isUploadingLogo } = useImageUpload({
        userId,
        bucket: "events",
        onSuccess: (url) => update("logo_url", url),
    });

    // Load the full event row whenever the sheet opens for a new event.
    useEffect(() => {
        if (!open || !event) return;
        let active = true;
        setLoading(true);
        (async () => {
            const full = (await getAdminEventById(event.id)) as Record<string, unknown> | null;
            if (!active) return;
            const get = (k: string) => (full?.[k] as string | null) ?? "";
            setForm({
                organization_id: (full?.organization_id as string) ?? event.organization_id ?? "",
                title: get("title") || event.title,
                description: get("description"),
                event_type: ((full?.event_type as EventType) ?? event.event_type) as EventType,
                status: (full?.status as string) ?? event.status,
                start_date: toLocalInput((full?.start_date as string) ?? event.start_date),
                end_date: toLocalInput((full?.end_date as string) ?? event.end_date),
                is_online: Boolean(full?.is_online ?? event.is_online),
                location: get("location"),
                online_url: get("online_url"),
                cover_image_url: get("cover_image_url"),
                logo_url: get("logo_url"),
                promo_video_url: get("promo_video_url"),
                max_attendees:
                    full?.max_attendees != null ? String(full.max_attendees as number) : "",
                registration_url: get("registration_url"),
                website_url: get("website_url"),
                linkedin_url: get("linkedin_url"),
                x_url: get("x_url"),
                facebook_url: get("facebook_url"),
                instagram_url: get("instagram_url"),
                tiktok_url: get("tiktok_url"),
                youtube_url: get("youtube_url"),
            });
            setLoading(false);
        })();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, event?.id]);

    if (!event) return null;

    const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        await uploadImage(file, "covers");
    };

    const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        await uploadLogo(file, "logos");
    };

    const handleSave = () => {
        if (!form.title.trim()) return toast.error("Title is required.");
        if (!form.organization_id) return toast.error("Please assign an organizing company.");
        if (!form.start_date || !form.end_date) return toast.error("Start and end dates are required.");

        const fields: AdminEventEditFields = {
            organization_id: form.organization_id,
            title: form.title.trim(),
            description: form.description || null,
            event_type: form.event_type,
            status: form.status,
            start_date: new Date(form.start_date).toISOString(),
            end_date: new Date(form.end_date).toISOString(),
            is_online: form.is_online,
            location: form.is_online ? null : form.location.trim() || null,
            online_url: form.is_online ? form.online_url.trim() || null : null,
            cover_image_url: form.cover_image_url || null,
            logo_url: form.logo_url || null,
            promo_video_url: form.promo_video_url.trim() || null,
            max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
            registration_url: form.registration_url.trim() || null,
            website_url: form.website_url.trim() || null,
            linkedin_url: form.linkedin_url.trim() || null,
            x_url: form.x_url.trim() || null,
            facebook_url: form.facebook_url.trim() || null,
            instagram_url: form.instagram_url.trim() || null,
            tiktok_url: form.tiktok_url.trim() || null,
            youtube_url: form.youtube_url.trim() || null,
        };

        startTransition(async () => {
            const result = await updateEventAsAdmin(event.id, fields);
            if (!result.success) {
                toast.error(result.error ?? "Failed to update event");
                return;
            }
            const org = organizations.find((o) => o.id === form.organization_id);
            onUpdated({
                id: event.id,
                title: fields.title!,
                status: fields.status!,
                event_type: fields.event_type!,
                start_date: fields.start_date!,
                end_date: fields.end_date!,
                location: fields.location ?? null,
                is_online: fields.is_online!,
                cover_image_url: fields.cover_image_url ?? null,
                logo_url: fields.logo_url ?? null,
                organization_id: form.organization_id,
                organization_name: org?.name ?? null,
                organization_logo: org?.logo_url ?? null,
            });
            toast.success("Event updated");
            onClose();
        });
    };

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent
                side="right"
                className="bg-[#121212] border-white/10 text-white w-full sm:max-w-lg overflow-y-auto"
            >
                <SheetHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <SheetTitle className="text-white truncate">Edit event</SheetTitle>
                            <SheetDescription className="text-gray-400 text-xs truncate">
                                /events/{event.slug}
                            </SheetDescription>
                        </div>
                        <a
                            href={`/events/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="px-4 py-5 space-y-5">
                        {/* Assign organizing company */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Organizing company</Label>
                            <select
                                value={form.organization_id}
                                onChange={(e) => update("organization_id", e.target.value)}
                                className={selectClass}
                            >
                                <option value="">— Select a company —</option>
                                {organizations.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">
                                Reassign which company organizes (owns) this event.
                            </p>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Title</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => update("title", e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Description</Label>
                            <RichTextEditor
                                value={form.description}
                                onChange={(value) => update("description", value)}
                                placeholder="Describe the event…"
                            />
                        </div>

                        {/* Type + status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Type</Label>
                                <select
                                    value={form.event_type}
                                    onChange={(e) => update("event_type", e.target.value as EventType)}
                                    className={selectClass}
                                >
                                    {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((key) => (
                                        <option key={key} value={key}>
                                            {EVENT_TYPE_LABELS[key]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">Status</Label>
                                <select
                                    value={form.status}
                                    onChange={(e) => update("status", e.target.value)}
                                    className={`${selectClass} capitalize`}
                                >
                                    {EVENT_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Start</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.start_date}
                                    onChange={(e) => update("start_date", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">End</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.end_date}
                                    onChange={(e) => update("end_date", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Online toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                id="evt-online"
                                type="checkbox"
                                checked={form.is_online}
                                onChange={(e) => update("is_online", e.target.checked)}
                                className="h-4 w-4 rounded border-white/20 bg-black/20"
                            />
                            <Label htmlFor="evt-online" className="text-gray-300 cursor-pointer">
                                This is an online event
                            </Label>
                        </div>

                        {form.is_online ? (
                            <div className="space-y-2">
                                <Label className="text-gray-300">Online URL</Label>
                                <Input
                                    value={form.online_url}
                                    onChange={(e) => update("online_url", e.target.value)}
                                    placeholder="https://…"
                                    className={inputClass}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-gray-300">Location</Label>
                                <Input
                                    value={form.location}
                                    onChange={(e) => update("location", e.target.value)}
                                    placeholder="Venue · City, Country"
                                    className={inputClass}
                                />
                            </div>
                        )}

                        {/* Event logo */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Event logo</Label>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                onChange={handleLogoFile}
                                disabled={isUploadingLogo}
                            />
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center">
                                    {form.logo_url ? (
                                        <Image
                                            src={form.logo_url}
                                            alt="Event logo"
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <ImagePlus className="h-6 w-6 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={isUploadingLogo}
                                        className="bg-transparent border-white/10 text-gray-200 hover:bg-white/10"
                                    >
                                        {isUploadingLogo ? (
                                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                        ) : (
                                            <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                                        )}
                                        {form.logo_url ? "Replace" : "Upload logo"}
                                    </Button>
                                    {form.logo_url && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => update("logo_url", "")}
                                            disabled={isUploadingLogo}
                                            className="bg-transparent border-white/10 hover:bg-red-500/10 hover:border-red-500/40 text-gray-300"
                                        >
                                            <X className="h-3.5 w-3.5 mr-1.5" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cover image */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Cover image</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={handleCoverFile}
                                disabled={isUploading}
                            />
                            {form.cover_image_url ? (
                                <div className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                    <div className="relative w-full aspect-[16/6]">
                                        <Image
                                            src={form.cover_image_url}
                                            alt="Event cover"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="bg-black/60 border-white/20 text-white hover:bg-black/80"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            ) : (
                                                <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            Replace
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => update("cover_image_url", "")}
                                            disabled={isUploading}
                                            className="bg-black/60 border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40"
                                        >
                                            <X className="h-3.5 w-3.5 mr-1.5" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full aspect-[16/6] rounded-lg border-2 border-dashed border-white/10 bg-black/20 hover:border-[var(--brand)]/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                                    ) : (
                                        <>
                                            <ImagePlus className="h-6 w-6 text-[var(--brand)]" />
                                            <span className="text-sm font-medium">Upload cover</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Capacity + links */}
                        <div className="space-y-2">
                            <Label className="text-gray-300">Max attendees</Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.max_attendees}
                                onChange={(e) => update("max_attendees", e.target.value)}
                                placeholder="Leave blank for unlimited"
                                className={`${inputClass} max-w-xs`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Registration URL</Label>
                            <Input
                                type="url"
                                value={form.registration_url}
                                onChange={(e) => update("registration_url", e.target.value)}
                                placeholder="https://…"
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Promo video (YouTube)</Label>
                            <Input
                                type="url"
                                value={form.promo_video_url}
                                onChange={(e) => update("promo_video_url", e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=…"
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-500">
                                Shown under the description on the event page.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Website URL</Label>
                            <Input
                                type="url"
                                value={form.website_url}
                                onChange={(e) => update("website_url", e.target.value)}
                                placeholder="https://…"
                                className={inputClass}
                            />
                        </div>

                        {/* Socials */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                            <Label className="text-gray-300">Event social pages</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(
                                    [
                                        ["linkedin_url", "LinkedIn"],
                                        ["x_url", "X (Twitter)"],
                                        ["facebook_url", "Facebook"],
                                        ["instagram_url", "Instagram"],
                                        ["tiktok_url", "TikTok"],
                                        ["youtube_url", "YouTube"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label className="text-gray-400 text-xs">{label}</Label>
                                        <Input
                                            type="url"
                                            value={form[key]}
                                            onChange={(e) => update(key, e.target.value)}
                                            placeholder="https://…"
                                            className={inputClass}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isPending || isUploading}
                                className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold"
                            >
                                {isPending ? "Saving…" : "Save changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="bg-transparent border-white/10 text-gray-200 hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
