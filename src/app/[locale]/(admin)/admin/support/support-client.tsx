"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    MessageSquare, Lightbulb, LifeBuoy, Clock, CheckCircle2,
    AlertCircle, XCircle, ChevronRight, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { replyTicketSchema, type ReplyTicketInput } from "@/features/support/schema";
import { adminReplyTicket } from "@/features/support/server/actions";
import {
    type SupportTicket, type TicketStatus, type TicketType,
    TICKET_TYPE_LABELS, TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS, TICKET_TYPE_COLORS,
} from "@/features/support/types";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

const TYPE_ICONS: Record<TicketType, React.ElementType> = {
    feedback: MessageSquare,
    suggestion: Lightbulb,
    support: LifeBuoy,
};

const STATUS_ICONS: Record<TicketStatus, React.ElementType> = {
    open: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle2,
    closed: XCircle,
};

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
];

const TYPE_FILTERS: { value: string; label: string }[] = [
    { value: "all", label: "All Types" },
    { value: "support", label: "Support" },
    { value: "feedback", label: "Feedback" },
    { value: "suggestion", label: "Suggestion" },
];

interface Stats {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

interface Props {
    tickets: SupportTicket[];
    stats: Stats;
    initialStatus: string;
    initialType: string;
}

export function AdminSupportClient({ tickets, stats, initialStatus, initialType }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selected, setSelected] = useState<SupportTicket | null>(null);

    const setFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") params.delete(key);
        else params.set(key, value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                <p className="mt-1 text-sm text-gray-400">User-submitted feedback, suggestions, and support requests.</p>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3">
                {[
                    { label: "Total", value: stats.total, color: "text-white" },
                    { label: "Open", value: stats.open, color: "text-blue-400" },
                    { label: "In Progress", value: stats.in_progress, color: "text-yellow-400" },
                    { label: "Resolved", value: stats.resolved, color: "text-green-400" },
                    { label: "Closed", value: stats.closed, color: "text-gray-400" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center min-w-[80px]">
                        <p className={cn("text-xl font-bold", color)}>{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setFilter("status", value)}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                initialStatus === value || (value === "all" && initialStatus === "all")
                                    ? "bg-[var(--brand)] text-black"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setFilter("type", value)}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                initialType === value || (value === "all" && initialType === "all")
                                    ? "bg-white/20 text-white"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {tickets.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500">No tickets found.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 hidden sm:table-cell">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 hidden md:table-cell">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tickets.map((ticket) => {
                                const TypeIcon = TYPE_ICONS[ticket.type];
                                const StatusIcon = STATUS_ICONS[ticket.status];
                                return (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => setSelected(ticket)}
                                        className="cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {ticket.profiles?.avatar_url ? (
                                                    <img
                                                        src={ticket.profiles.avatar_url}
                                                        alt=""
                                                        className="h-7 w-7 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
                                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-300 hidden sm:block">
                                                    {ticket.profiles?.full_name ?? ticket.profiles?.username ?? "Unknown"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{ticket.subject}</p>
                                            {ticket.admin_reply && (
                                                <p className="text-xs text-[var(--brand)]">Replied</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TICKET_TYPE_COLORS[ticket.type])}>
                                                <TypeIcon className="h-3 w-3" />
                                                {TICKET_TYPE_LABELS[ticket.type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                                            {new Date(ticket.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TICKET_STATUS_COLORS[ticket.status])}>
                                                <StatusIcon className="h-3 w-3" />
                                                {TICKET_STATUS_LABELS[ticket.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Ticket detail sheet */}
            <TicketSheet
                ticket={selected}
                onClose={() => setSelected(null)}
                onReplied={(updated) => setSelected(updated)}
            />
        </div>
    );
}

function TicketSheet({
    ticket,
    onClose,
    onReplied,
}: {
    ticket: SupportTicket | null;
    onClose: () => void;
    onReplied: (t: SupportTicket) => void;
}) {
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ReplyTicketInput>({
        resolver: zodResolver(replyTicketSchema),
        values: ticket
            ? { ticketId: ticket.id, reply: ticket.admin_reply ?? "", status: ticket.status }
            : { ticketId: "", reply: "", status: "open" },
    });

    const onSubmit = (data: ReplyTicketInput) => {
        startTransition(async () => {
            const result = await adminReplyTicket(data);
            if (result.success) {
                toast.success("Reply sent.");
                if (ticket) onReplied({ ...ticket, admin_reply: data.reply, status: data.status });
            } else {
                toast.error(result.error ?? "Something went wrong.");
            }
        });
    };

    return (
        <Sheet open={!!ticket} onOpenChange={(open) => { if (!open) { onClose(); reset(); } }}>
            <SheetContent className="bg-[#0B0F14] border-white/10 text-white w-full sm:max-w-lg overflow-y-auto">
                {ticket && (
                    <>
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-white">{ticket.subject}</SheetTitle>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TICKET_TYPE_COLORS[ticket.type])}>
                                    {TICKET_TYPE_LABELS[ticket.type]}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {ticket.profiles?.full_name ?? ticket.profiles?.username ?? "Unknown user"}
                                </span>
                                <span className="text-xs text-gray-600">
                                    {new Date(ticket.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                                </span>
                            </div>
                        </SheetHeader>

                        {/* Message */}
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-6">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {/* Reply form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <input type="hidden" {...register("ticketId")} />

                            <div className="space-y-1.5">
                                <label className="text-sm text-gray-400">Reply</label>
                                <textarea
                                    {...register("reply")}
                                    rows={5}
                                    placeholder="Write your reply to the user…"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/30 transition-colors resize-none"
                                />
                                {errors.reply && <p className="text-xs text-red-400">{errors.reply.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm text-gray-400">Update Status</label>
                                <select
                                    {...register("status")}
                                    className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3 py-2 text-sm text-white outline-none focus:border-[var(--brand)]/50"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#b8973e] disabled:opacity-50 transition-colors"
                            >
                                {isPending ? "Sending…" : "Send Reply"}
                            </button>
                        </form>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
