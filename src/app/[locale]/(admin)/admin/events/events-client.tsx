"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, ExternalLink, Pencil, Search, Star, Trash2, Users, Building2 } from "lucide-react";
import {
    deleteEventAsAdmin,
    setEventFeaturedAsAdmin,
    type AdminEventListItem,
} from "@/features/admin/server/actions";
import { ManageEventSheet, type OrgOption } from "./manage-event-sheet";

const STATUS_COLORS: Record<string, string> = {
    published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${
                STATUS_COLORS[status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
            }`}
        >
            {status}
        </span>
    );
}

export function AdminEventsClient({
    events: initial,
    organizations,
    userId,
}: {
    events: AdminEventListItem[];
    organizations: OrgOption[];
    userId: string;
}) {
    const router = useRouter();
    const [events, setEvents] = useState(initial);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState<AdminEventListItem | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [pendingId, setPendingId] = useState<string | null>(null);

    const filtered = useMemo(
        () =>
            events.filter((e) => {
                const q = query.trim().toLowerCase();
                const matchQ =
                    !q ||
                    e.title.toLowerCase().includes(q) ||
                    (e.organization_name ?? "").toLowerCase().includes(q) ||
                    (e.location ?? "").toLowerCase().includes(q);
                const matchStatus =
                    statusFilter === "all" ||
                    (statusFilter === "featured" ? e.is_featured : e.status === statusFilter);
                return matchQ && matchStatus;
            }),
        [events, query, statusFilter]
    );

    const counts = useMemo(() => {
        const by = (s: string) => events.filter((e) => e.status === s).length;
        return {
            all: events.length,
            published: by("published"),
            draft: by("draft"),
            cancelled: by("cancelled"),
            featured: events.filter((e) => e.is_featured).length,
        };
    }, [events]);

    const handleToggleFeatured = (e: AdminEventListItem) => {
        const next = !e.is_featured;
        startTransition(async () => {
            const result = await setEventFeaturedAsAdmin(e.id, next);
            if (!result.success) {
                toast.error(result.error ?? "Failed to update featured status");
                return;
            }
            setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, is_featured: next } : x)));
            toast.success(next ? "Event featured on the feed" : "Event removed from the feed");
        });
    };

    const handleDelete = (e: AdminEventListItem) => {
        if (!confirm(`Delete event "${e.title}"? This permanently removes it and its registrations. This cannot be undone.`))
            return;
        setPendingId(e.id);
        startTransition(async () => {
            const result = await deleteEventAsAdmin(e.id);
            setPendingId(null);
            if (!result.success) {
                toast.error(result.error ?? "Failed to delete");
                return;
            }
            setEvents((prev) => prev.filter((x) => x.id !== e.id));
            toast.success("Event deleted");
        });
    };

    const handleUpdated = (update: Partial<AdminEventListItem> & { id: string }) => {
        setEvents((prev) => prev.map((e) => (e.id === update.id ? { ...e, ...update } : e)));
        setSelected((prev) => (prev?.id === update.id ? { ...prev, ...update } : prev));
        // Pull fresh server data (e.g. revalidated slug) in the background
        router.refresh();
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-[var(--brand)]" />
                        Events
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {events.length} events · edit details and assign them to an organizing company
                    </p>
                </div>

                {/* Stat / status filter cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                        { key: "all", label: "Total", count: counts.all },
                        { key: "published", label: "Published", count: counts.published },
                        { key: "draft", label: "Draft", count: counts.draft },
                        { key: "cancelled", label: "Cancelled", count: counts.cancelled },
                        { key: "featured", label: "Featured on feed", count: counts.featured },
                    ].map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key)}
                            className={`rounded-xl border p-4 text-left transition-colors ${
                                statusFilter === s.key
                                    ? "border-[var(--brand)]/50 bg-[var(--brand)]/10"
                                    : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                            }`}
                        >
                            <p className="text-2xl font-bold text-white">{s.count}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by title, organizer or location..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)]/50"
                    />
                </div>

                {/* Table */}
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                                <th className="text-left p-4 font-medium">Event</th>
                                <th className="text-left p-4 font-medium">Organizer</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-left p-4 font-medium">Date</th>
                                <th className="text-left p-4 font-medium">Interest</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-500">
                                        <CalendarDays className="h-10 w-10 mx-auto mb-3 text-gray-700" />
                                        No events found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((e) => (
                                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        {/* Event */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-14 rounded-md overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                    { }
                                                    {e.logo_url ? (
                                                        <img
                                                            src={e.logo_url}
                                                            alt=""
                                                            className="h-full w-full object-contain p-0.5"
                                                        />
                                                    ) : e.cover_image_url ? (
                                                        <img
                                                            src={e.cover_image_url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-600">
                                                            <CalendarDays className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-white truncate max-w-[260px]">
                                                        {e.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5 capitalize">
                                                        {e.event_type.replace("_", " ")}
                                                        {e.is_online ? " · Online" : e.location ? ` · ${e.location}` : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Organizer */}
                                        <td className="p-4">
                                            {e.organization_name ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 rounded">
                                                        <AvatarImage src={e.organization_logo ?? undefined} />
                                                        <AvatarFallback className="bg-[var(--brand)]/20 text-[var(--brand)] text-[10px] rounded">
                                                            {e.organization_name[0]?.toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-300 truncate max-w-[160px]">
                                                        {e.organization_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                                    <Building2 className="h-3.5 w-3.5" /> Unassigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <StatusBadge status={e.status} />
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                                            {e.start_date ? new Date(e.start_date).toLocaleDateString() : "—"}
                                        </td>

                                        {/* Interest */}
                                        <td className="p-4 text-sm text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5 text-gray-500" />
                                                {(e.interest_count + e.registration_count).toLocaleString()}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleToggleFeatured(e)}
                                                    disabled={isPending}
                                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                                        e.is_featured
                                                            ? "text-[var(--brand)] hover:text-[var(--brand)] bg-[var(--brand)]/10"
                                                            : "text-gray-400 hover:text-[var(--brand)] hover:bg-[var(--brand)]/10"
                                                    }`}
                                                    title={
                                                        e.is_featured
                                                            ? "Remove from feed sidebar"
                                                            : "Feature in feed sidebar"
                                                    }
                                                >
                                                    <Star
                                                        className="h-4 w-4"
                                                        fill={e.is_featured ? "currentColor" : "none"}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelected(e);
                                                        setSheetOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--brand)] hover:bg-[var(--brand)]/10 transition-colors"
                                                    title="Edit event"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <Link href={`/events/${e.slug}`} target="_blank">
                                                    <button
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                        title="View event"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(e)}
                                                    disabled={isPending && pendingId === e.id}
                                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                                                    title="Delete event"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ManageEventSheet
                event={selected}
                organizations={organizations}
                userId={userId}
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onUpdated={handleUpdated}
            />
        </>
    );
}
