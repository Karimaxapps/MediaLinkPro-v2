/**
 * Email dispatcher. Swaps to Resend (or any provider) at runtime if an
 * API key is configured; otherwise logs to the console so local dev still
 * exercises the code path without requiring credentials.
 */

export type EmailMessage = {
    to: string;
    subject: string;
    html: string;
    text?: string;
};

export async function sendEmail(msg: EmailMessage): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "MediaLinkPro <noreply@medialinkpro.app>";

    if (!apiKey) {
        // Dev/unconfigured fallback
        console.log("[email:dev]", { from, ...msg });
        return { success: true };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                to: msg.to,
                subject: msg.subject,
                html: msg.html,
                text: msg.text,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: `Resend error: ${response.status} ${text}` };
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Unknown email error" };
    }
}
