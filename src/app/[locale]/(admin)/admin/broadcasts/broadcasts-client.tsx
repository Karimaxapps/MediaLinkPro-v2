"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Send,
    Trash2,
    Upload,
    Loader2,
    X,
    ImageIcon,
    ExternalLink,
    Users,
    Smartphone,
    AlertTriangle,
    Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
    adminCreateBroadcast,
    adminDeleteBroadcast,
    adminUploadBroadcastImage,
    type Broadcast,
} from "@/features/admin/server/broadcasts";

export function AdminBroadcastsClient({ broadcasts }: { broadcasts: Broadcast[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
        title: "",
        message: "",
        image_url: "",
        link_url: "",
    });

    const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
            toast.error("Only JPG, PNG, WebP, or GIF files are supported");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5 MB");
            return;
        }

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const result = await adminUploadBroadcastImage(fd);
            if (result.success && result.url) {
                update("image_url", result.url);
                toast.success("Image uploaded");
            } else {
                toast.error(result.error ?? "Upload failed");
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            toast.error("Title and message are required");
            return;
        }
        if (
            !confirm(
                `Send this notification to every user on the platform? This cannot be undone.`
            )
        ) {
            return;
        }
        startTransition(async () => {
            const result = await adminCreateBroadcast({
                title: form.title,
                message: form.message,
                image_url: form.image_url || null,
                link_url: form.link_url || null,
            });
            if (result.success) {
                toast.success("Broadcast sent");
                setForm({ title: "", message: "", image_url: "", link_url: "" });
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to send");
            }
        });
    };

    const handleDelete = (b: Broadcast) => {
        if (
            !confirm(
                `Delete broadcast "${b.title}"? This will also remove it from every user's notification list.`
            )
        ) {
            return;
        }
        startTransition(async () => {
            const result = await adminDeleteBroadcast(b.id);
            if (result.success) {
                toast.success("Broadcast deleted");
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to delete");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Push Notifications</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Send a broadcast to every user. Delivered to the in-app notification
                    list and to mobile push tokens registered with Expo.
                </p>
            </div>

            {/* Composer */}
            <form
                onSubmit={handleSend}
                className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
            >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[var(--brand)]" />
                    Compose broadcast
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* Left: fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Title *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => update("title", e.target.value)}
                                placeholder="New feature: bookmarks"
                                className="bg-black/20 border-white/10 text-white"
                                maxLength={120}
                            />
                            <p className="text-[11px] text-gray-500">
                                Shown as the headline in-app and as the push title on mobile.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Description *</Label>
                            <Textarea
                                value={form.message}
                                onChange={(e) => update("message", e.target.value)}
                                rows={4}
                                placeholder="You can now bookmark products from any page…"
                                className="bg-black/20 border-white/10 text-white"
                                maxLength={500}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Link (optional)</Label>
                            <Input
                                type="url"
                                value={form.link_url}
                                onChange={(e) => update("link_url", e.target.value)}
                                placeholder="https://medialinkpro.com/bookmarks"
                                className="bg-black/20 border-white/10 text-white"
                            />
                            <p className="text-[11px] text-gray-500">
                                Tapping the notification opens this URL.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Image (optional)</Label>
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
                                    <img
                                        src={form.image_url}
                                        alt="Broadcast preview"
                                        className="w-full h-40 object-cover"
                                    />
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
                                            onClick={() => update("image_url", "")}
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
                                    className="w-full h-32 rounded-lg border-2 border-dashed border-white/15 bg-black/20 hover:bg-black/30 hover:border-[var(--brand)]/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 disabled:opacity-50"
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
                                                <span className="text-[var(--brand)] font-medium">
                                                    Click to upload
                                                </span>{" "}
                                                or drag an image
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                JPG, PNG, WebP, GIF · max 5 MB
                                            </span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: preview */}
                    <div className="space-y-3">
                        <Label className="text-gray-300">Preview</Label>
                        <NotificationPreview
                            title={form.title}
                            message={form.message}
                            imageUrl={form.image_url}
                            linkUrl={form.link_url}
                        />
                    </div>
                </div>

                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Broadcasts are sent to every user immediately. Double-check the title,
                    description, and link before sending.
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-[var(--brand)] hover:bg-[#b5975a] text-black font-medium"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                Sending…
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-1.5" />
                                Send broadcast
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* History */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Recent broadcasts</h2>
                {broadcasts.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-gray-400">
                        No broadcasts sent yet.
                    </div>
                ) : (
                    broadcasts.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                            {b.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={b.image_url}
                                    alt={b.title}
                                    className="h-16 w-24 shrink-0 rounded object-cover"
                                />
                            ) : (
                                <div className="h-16 w-24 shrink-0 rounded bg-black/20 border border-white/10 flex items-center justify-center text-[10px] text-gray-500">
                                    No image
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold truncate">{b.title}</h3>
                                    <span className="text-[10px] text-gray-500">
                                        {format(new Date(b.created_at), "MMM d, yyyy h:mm a")}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {b.message}
                                </p>
                                {b.link_url && (
                                    <a
                                        href={b.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[var(--brand)] hover:underline inline-flex items-center gap-1 mt-1 break-all"
                                    >
                                        {b.link_url}
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                )}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
                                        <Users className="h-3 w-3 text-gray-400" />
                                        {b.recipient_count.toLocaleString()} in-app
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-[var(--brand)] bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-md px-2 py-0.5">
                                        <Smartphone className="h-3 w-3" />
                                        {b.push_sent_count.toLocaleString()} push
                                    </span>
                                    {b.push_failed_count > 0 && (
                                        <span className="text-xs text-red-400">
                                            {b.push_failed_count} failed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(b)}
                                disabled={isPending}
                                className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function NotificationPreview({
    title,
    message,
    imageUrl,
    linkUrl,
}: {
    title: string;
    message: string;
    imageUrl: string;
    linkUrl: string;
}) {
    const displayTitle = title || "Notification title";
    const displayMessage = message || "Notification description goes here.";

    return (
        <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-[#1F1F1F] overflow-hidden">
                {imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imageUrl} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                    <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-full bg-[var(--brand)]/10 shrink-0">
                            <Bell className="h-3 w-3 text-[var(--brand)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                                {displayTitle}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-3 mt-0.5">
                                {displayMessage}
                            </p>
                            {linkUrl && (
                                <p className="text-[11px] text-[var(--brand)] mt-1 truncate">
                                    Tap to open →
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-[11px] text-gray-500 text-center">
                In-app preview · mobile push uses the OS notification style
            </p>
        </div>
    );
}
