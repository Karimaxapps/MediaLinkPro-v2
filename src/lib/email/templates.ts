/**
 * Plain HTML email templates — minimal, dark-themed, dependency-free.
 */

const wrap = (title: string, body: string, cta?: { url: string; label: string }) => `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0B0F14;color:#e5e7eb;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F14;padding:40px 20px;">
        <tr><td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
                <tr><td style="padding:32px;">
                    <div style="color:#C6A85E;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px;">MediaLinkPro</div>
                    <h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">${title}</h1>
                    <div style="color:#d1d5db;font-size:15px;line-height:1.6;">${body}</div>
                    ${cta ? `<div style="margin-top:28px;"><a href="${cta.url}" style="display:inline-block;background:#C6A85E;color:#000000;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;">${cta.label}</a></div>` : ""}
                </td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);color:#6b7280;font-size:12px;">
                    You received this because your notification preferences allow it.
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/settings/notifications" style="color:#C6A85E;text-decoration:none;">Manage preferences</a>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`.trim();

export const emailTemplates = {
    connectionRequest: (actorName: string, profileUrl: string) => ({
        subject: `${actorName} wants to connect`,
        html: wrap(
            "New connection request",
            `<strong>${actorName}</strong> has sent you a connection request on MediaLinkPro.`,
            { url: profileUrl, label: "View request" }
        ),
    }),
    demoRequest: (actorName: string, productName: string, requestUrl: string) => ({
        subject: `New demo request for ${productName}`,
        html: wrap(
            "New demo request",
            `<strong>${actorName}</strong> requested a demo of <strong>${productName}</strong>.`,
            { url: requestUrl, label: "Review request" }
        ),
    }),
    eventInvite: (eventTitle: string, eventUrl: string) => ({
        subject: `You're invited: ${eventTitle}`,
        html: wrap(
            "Event invitation",
            `You've been invited to <strong>${eventTitle}</strong>.`,
            { url: eventUrl, label: "View event" }
        ),
    }),
    newMessage: (senderName: string, messageUrl: string) => ({
        subject: `New message from ${senderName}`,
        html: wrap(
            "New direct message",
            `<strong>${senderName}</strong> sent you a message.`,
            { url: messageUrl, label: "Open conversation" }
        ),
    }),
};
