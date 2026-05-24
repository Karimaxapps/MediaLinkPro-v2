"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { EVENT_TYPE_LABELS, type EventType } from "../types";
import { createEvent } from "../server/actions";

type Org = { id: string; name: string; slug: string };

const MAX_COVER_MB = 5;

export function NewEventClient({
    organizations,
    userId,
}: {
    organizations: Org[];
    userId: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        organization_id: organizations[0]?.id ?? "",
        title: "",
        description: "",
        event_type: "conference" as EventType,
        start_date: "",
        end_date: "",
        location: "",
        is_online: false,
        online_url: "",
        cover_image_url: "",
        max_attendees: "",
        registration_url: "",
    });

    const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isUploading } = useImageUpload({
        userId,
        bucket: "events",
        onSuccess: (url) => update("cover_image_url", url),
    });

    const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset input so re-selecting the same file still triggers onChange
        e.target.value = "";
        if (!file) return;
        await uploadImage(file, "covers");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title || !form.start_date || !form.end_date || !form.organization_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        startTransition(async () => {
            const result = await createEvent({
                organization_id: form.organization_id,
                title: form.title,
                description: form.description || undefined,
                event_type: form.event_type,
                start_date: new Date(form.start_date).toISOString(),
                end_date: new Date(form.end_date).toISOString(),
                location: form.location || undefined,
                is_online: form.is_online,
                online_url: form.online_url || undefined,
                cover_image_url: form.cover_image_url || undefined,
                max_attendees: form.max_attendees ? Number(form.max_attendees) : undefined,
                registration_url: form.registration_url.trim() || undefined,
            });

            if (result.success && result.slug) {
                toast.success("Event created!");
                router.push(`/events/${result.slug}`);
            } else {
                toast.error(result.error ?? "Failed to create event");
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link
                href="/events"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to events
            </Link>

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Event</h1>
                <p className="text-sm text-gray-400">Host a new event for the MediaLinkPro community.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6">
                {organizations.length > 1 && (
                    <div className="space-y-2">
                        <Label className="text-gray-300">Organization *</Label>
                        <select
                            value={form.organization_id}
                            onChange={(e) => update("organization_id", e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none"
                        >
                            {organizations.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-gray-300">Title *</Label>
                    <Input
                        value={form.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="Annual Broadcast Summit 2026"
                        className="bg-black/20 border-white/10 text-white"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">Description</Label>
                    <RichTextEditor
                        value={form.description}
                        onChange={(value) => update("description", value)}
                        placeholder="Tell attendees what to expect..."
                    />
                    <p className="text-xs text-gray-500">
                        Use the toolbar to format with headings, bold, italics, lists, and quotes.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">Event Type *</Label>
                    <select
                        value={form.event_type}
                        onChange={(e) => update("event_type", e.target.value as EventType)}
                        className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:border-[var(--brand)]/50 outline-none"
                    >
                        {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Start Date & Time *</Label>
                        <Input
                            type="datetime-local"
                            value={form.start_date}
                            onChange={(e) => update("start_date", e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-300">End Date & Time *</Label>
                        <Input
                            type="datetime-local"
                            value={form.end_date}
                            onChange={(e) => update("end_date", e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="is_online"
                        type="checkbox"
                        checked={form.is_online}
                        onChange={(e) => update("is_online", e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                    />
                    <Label htmlFor="is_online" className="text-gray-300 cursor-pointer">
                        This is an online event
                    </Label>
                </div>

                {form.is_online ? (
                    <div className="space-y-2">
                        <Label className="text-gray-300">Online URL</Label>
                        <Input
                            value={form.online_url}
                            onChange={(e) => update("online_url", e.target.value)}
                            placeholder="https://zoom.us/..."
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label className="text-gray-300">Location</Label>
                        <Input
                            value={form.location}
                            onChange={(e) => update("location", e.target.value)}
                            placeholder="Dubai World Trade Centre, UAE"
                            className="bg-black/20 border-white/10 text-white"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-gray-300">Cover Image</Label>
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
                            className="w-full aspect-[16/6] rounded-lg border-2 border-dashed border-white/10 bg-black/20 hover:border-[var(--brand)]/50 hover:bg-black/30 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                                    <span className="text-sm">Uploading…</span>
                                </>
                            ) : (
                                <>
                                    <ImagePlus className="h-6 w-6 text-[var(--brand)]" />
                                    <span className="text-sm font-medium">Upload cover image</span>
                                    <span className="text-xs text-gray-500">
                                        PNG, JPG, WEBP or GIF · max {MAX_COVER_MB} MB · 16:6 recommended
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">Max Attendees</Label>
                    <Input
                        type="number"
                        min="1"
                        value={form.max_attendees}
                        onChange={(e) => update("max_attendees", e.target.value)}
                        placeholder="Unlimited if blank"
                        className="bg-black/20 border-white/10 text-white md:max-w-xs"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-300">External Registration Link</Label>
                    <Input
                        type="url"
                        value={form.registration_url}
                        onChange={(e) => update("registration_url", e.target.value)}
                        placeholder="https://eventbrite.com/e/your-event"
                        className="bg-black/20 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500">
                        Optional. If provided, the &quot;Register Now&quot; button on the event page
                        will open this URL in a new tab instead of using in-app registration.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="submit"
                        disabled={isPending || isUploading}
                        className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                    >
                        {isPending ? "Creating..." : isUploading ? "Uploading image…" : "Create Event"}
                    </Button>
                    <Link href="/events">
                        <Button type="button" variant="outline" className="border-white/10 hover:bg-white/10">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
