import { z } from "zod";

export const submitTicketSchema = z.object({
    type: z.enum(["feedback", "suggestion", "support"]),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(120, "Subject too long"),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
});

export type SubmitTicketInput = z.infer<typeof submitTicketSchema>;

export const replyTicketSchema = z.object({
    ticketId: z.string().uuid(),
    reply: z.string().min(1, "Reply cannot be empty").max(2000, "Reply too long"),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export type ReplyTicketInput = z.infer<typeof replyTicketSchema>;
