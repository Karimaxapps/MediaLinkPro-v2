export type TicketType = "feedback" | "suggestion" | "support";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
    id: string;
    user_id: string;
    type: TicketType;
    subject: string;
    message: string;
    status: TicketStatus;
    admin_reply: string | null;
    replied_at: string | null;
    created_at: string;
    updated_at: string;
    profiles?: {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    } | null;
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
    feedback: "Feedback",
    suggestion: "Suggestion",
    support: "Support",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
    open: "bg-blue-500/10 text-blue-400",
    in_progress: "bg-yellow-500/10 text-yellow-400",
    resolved: "bg-green-500/10 text-green-400",
    closed: "bg-gray-500/10 text-gray-400",
};

export const TICKET_TYPE_COLORS: Record<TicketType, string> = {
    feedback: "bg-purple-500/10 text-purple-400",
    suggestion: "bg-[var(--brand)]/10 text-[var(--brand)]",
    support: "bg-red-500/10 text-red-400",
};
