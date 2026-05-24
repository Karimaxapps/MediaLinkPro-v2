"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageSquare, Lightbulb, LifeBuoy, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitTicketSchema, type SubmitTicketInput } from "@/features/support/schema";
import { submitTicket } from "@/features/support/server/actions";
import {
    type SupportTicket,
    TICKET_TYPE_LABELS,
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    TICKET_TYPE_COLORS,
} from "@/features/support/types";

const TYPE_OPTIONS = [
    { value: "feedback" as const, label: "Feedback", icon: MessageSquare, description: "Share what you think about the platform" },
    { value: "suggestion" as const, label: "Suggestion", icon: Lightbulb, description: "Propose a new feature or improvement" },
    { value: "support" as const, label: "Support", icon: LifeBuoy, description: "Get help with an issue or question" },
];

const STATUS_ICONS = {
    open: AlertCircle,
    in_progress: Clock,
    resolved: CheckCircle2,
    closed: XCircle,
};

interface Props {
    tickets: SupportTicket[];
}

export function SupportPageClient({ tickets }: Props) {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<SubmitTicketInput>({
        resolver: zodResolver(submitTicketSchema),
        defaultValues: { type: "support", subject: "", message: "" },
    });

    const selectedType = watch("type");

    const onSubmit = (data: SubmitTicketInput) => {
        startTransition(async () => {
            const result = await submitTicket(data);
            if (result.success) {
                toast.success(result.message ?? "Ticket submitted!");
                reset();
                setSubmitted(true);
            } else {
                toast.error(result.error ?? "Something went wrong.");
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Support & Feedback</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Have a question, idea, or issue? We&apos;d love to hear from you.
                </p>
            </div>

            {/* Submission Form */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
                <h2 className="text-base font-semibold text-white">Submit a request</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Type Selector */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {TYPE_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setValue("type", value)}
                                    className={cn(
                                        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                                        selectedType === value
                                            ? "border-[var(--brand)] bg-[var(--brand)]/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("h-4 w-4", selectedType === value ? "text-[var(--brand)]" : "text-gray-400")} />
                                        <span className={cn("text-sm font-medium", selectedType === value ? "text-white" : "text-gray-300")}>
                                            {label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                        <label htmlFor="subject" className="text-sm text-gray-400">Subject</label>
                        <input
                            id="subject"
                            {...register("subject")}
                            placeholder="Brief summary of your request"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/30 transition-colors"
                        />
                        {errors.subject && <p className="text-xs text-red-400">{errors.subject.message}</p>}
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                        <label htmlFor="message" className="text-sm text-gray-400">Message</label>
                        <textarea
                            id="message"
                            {...register("message")}
                            rows={5}
                            placeholder="Describe your feedback, suggestion, or issue in detail..."
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/30 transition-colors resize-none"
                        />
                        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#b8973e] disabled:opacity-50 transition-colors"
                    >
                        {isPending ? "Submitting…" : "Submit Request"}
                    </button>
                </form>
            </div>

            {/* Past Submissions */}
            {tickets.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-base font-semibold text-white">My Submissions</h2>
                    <div className="space-y-3">
                        {tickets.map((ticket) => {
                            const StatusIcon = STATUS_ICONS[ticket.status];
                            return (
                                <div
                                    key={ticket.id}
                                    className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-white">{ticket.subject}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(ticket.created_at).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", TICKET_TYPE_COLORS[ticket.type])}>
                                                {TICKET_TYPE_LABELS[ticket.type]}
                                            </span>
                                            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TICKET_STATUS_COLORS[ticket.status])}>
                                                <StatusIcon className="h-3 w-3" />
                                                {TICKET_STATUS_LABELS[ticket.status]}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 line-clamp-2">{ticket.message}</p>

                                    {ticket.admin_reply && (
                                        <div className="rounded-lg border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-3 space-y-1">
                                            <p className="text-xs font-semibold text-[var(--brand)]">Admin Reply</p>
                                            <p className="text-xs text-gray-300">{ticket.admin_reply}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {submitted && tickets.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <p className="text-sm text-gray-400">Ticket submitted! Refresh to see it in your submissions.</p>
                </div>
            )}
        </div>
    );
}
