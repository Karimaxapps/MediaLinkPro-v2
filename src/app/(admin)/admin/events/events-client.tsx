"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, Users } from "lucide-react";
import { deleteEventAsAdmin } from "@/features/admin/server/actions";

type Event = {
    id: string;
    title: string;
    slug: string;
    status: string;
    event_type: string;
    start_date: string | null;
    end_date: string | null;
    registration_count: number;
    organization_id: string | null;
    created_at: string | null;
};

const STATUS_COLORS: Record<string, string> = {
    published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function EventRow({ event }: { event: Event }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Delete event "${event.title}"? This cannot be undone.`)) return;
        startTransition(async () => {
            const result = await deleteEventAsAdmin(event.id);
            if (!result.success) toast.error(result.error ?? "Failed to delete");
            else {
                toast.success("Event deleted");
                router.refresh();
            }
        });
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/[0.02]">
            <td className="p-4">
                <div className="text-sm font-medium text-white">{event.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 capitalize">{event.event_type.replace("_", " ")}</div>
            </td>
            <td className="p-4">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[event.status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                    {event.status}
                </span>
            </td>
            <td className="p-4 text-sm text-gray-400">
                {event.start_date ? new Date(event.start_date).toLocaleDateString() : "—"}
            </td>
            <td className="p-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                    {event.registration_count.toLocaleString()}
                </div>
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/events/${event.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        disabled={isPending}
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export function AdminEventsClient({ events }: { events: Event[] }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Events</h1>
                <p className="text-sm text-gray-400 mt-1">{events.length} most recent</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                            <th className="text-left p-4 font-medium">Event</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-left p-4 font-medium">Registrations</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No events found</td>
                            </tr>
                        ) : (
                            events.map((e) => <EventRow key={e.id} event={e} />)
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
