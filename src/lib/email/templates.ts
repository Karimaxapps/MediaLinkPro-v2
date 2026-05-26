/**
 * Plain HTML email templates — minimal, dark-themed, dependency-free.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://medialinkpro.net";

const wrap = (title: string, body: string, cta?: { url: string; label: string }, footer?: string) =>
  `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0B0F14;color:#e5e7eb;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F14;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;max-width:560px;">
        <!-- Header -->
        <tr><td style="padding:28px 32px 0;border-bottom:1px solid rgba(198,168,94,0.25);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#C6A85E;font-size:18px;font-weight:700;letter-spacing:0.02em;">MediaLink<span style="color:#ffffff;">Pro</span></td>
              <td align="right" style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">The Media Network</td>
            </tr>
          </table>
          <div style="height:18px;"></div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">${title}</h1>
          <div style="color:#d1d5db;font-size:15px;line-height:1.7;">${body}</div>
          ${cta ? `<div style="margin-top:28px;"><a href="${cta.url}" style="display:inline-block;background:#C6A85E;color:#000000;padding:13px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">${cta.label}</a></div>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);color:#6b7280;font-size:12px;line-height:1.6;">
          ${footer ?? `You received this email because of your account on <a href="${APP_URL}" style="color:#C6A85E;text-decoration:none;">MediaLinkPro</a>.`}
          &nbsp;·&nbsp;<a href="${APP_URL}/settings/notifications" style="color:#C6A85E;text-decoration:none;">Manage preferences</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

export const emailTemplates = {
  welcome: (firstName: string) => ({
    subject: "Welcome to MediaLinkPro — you're in!",
    html: wrap(
      `Welcome, ${firstName}!`,
      `Your profile is live and you're officially part of the MediaLinkPro network — the go-to place for media professionals, products, and organisations.<br/><br/>
Here's what you can do right now:<br/>
<ul style="margin:12px 0;padding-left:20px;color:#d1d5db;">
  <li style="margin-bottom:8px;">Explore products and bookmark ones you love</li>
  <li style="margin-bottom:8px;">Connect with media professionals in your field</li>
  <li style="margin-bottom:8px;">Add or claim your company page</li>
  <li style="margin-bottom:8px;">Request demos from vendors</li>
</ul>
Your journey starts on the dashboard.`,
      { url: `${APP_URL}/dashboard`, label: "Go to my dashboard" },
      `You're receiving this because you just joined <a href="${APP_URL}" style="color:#C6A85E;text-decoration:none;">MediaLinkPro</a>. Welcome aboard!`
    ),
  }),

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
    html: wrap("Event invitation", `You've been invited to <strong>${eventTitle}</strong>.`, {
      url: eventUrl,
      label: "View event",
    }),
  }),
  newMessage: (senderName: string, messageUrl: string) => ({
    subject: `New message from ${senderName}`,
    html: wrap("New direct message", `<strong>${senderName}</strong> sent you a message.`, {
      url: messageUrl,
      label: "Open conversation",
    }),
  }),
  jobApplication: (applicantName: string, jobTitle: string, reviewUrl: string) => ({
    subject: `New application: ${jobTitle}`,
    html: wrap(
      "New job application",
      `<strong>${applicantName}</strong> just applied to <strong>${jobTitle}</strong>.`,
      { url: reviewUrl, label: "Review application" }
    ),
  }),
  jobReply: (
    companyName: string,
    jobTitle: string,
    statusLabel: string,
    body: string,
    jobUrl: string
  ) => ({
    subject: `${companyName} responded to your application`,
    html: wrap(
      `Update on ${jobTitle}`,
      `<strong>${companyName}</strong> marked your application as <strong>${statusLabel}</strong>.<br/><br/>${body ? body.replace(/\n/g, "<br/>") : "Open MediaLinkPro for the full message."}`,
      { url: jobUrl, label: "Open application" }
    ),
  }),
  claimDecision: (
    companyName: string,
    approved: boolean,
    note: string,
    companyUrl: string
  ) => ({
    subject: approved
      ? `Your claim for ${companyName} was approved`
      : `Update on your claim for ${companyName}`,
    html: wrap(
      approved ? "Claim approved" : "Claim not approved",
      approved
        ? `Good news — your request to claim <strong>${companyName}</strong> has been approved. You can now manage the company page, add products, and connect with media pros.${
            note ? `<br/><br/><strong>Note from our team:</strong><br/>${note.replace(/\n/g, "<br/>")}` : ""
          }`
        : `Your request to claim <strong>${companyName}</strong> was not approved.${
            note ? `<br/><br/><strong>Reason:</strong><br/>${note.replace(/\n/g, "<br/>")}` : ""
          }`,
      { url: companyUrl, label: approved ? "Manage your company" : "View company" }
    ),
  }),
  interviewScheduled: (
    companyName: string,
    jobTitle: string,
    when: string,
    where: string,
    jobUrl: string
  ) => ({
    subject: `Interview scheduled: ${jobTitle}`,
    html: wrap(
      "Interview scheduled",
      `<strong>${companyName}</strong> has scheduled an interview for <strong>${jobTitle}</strong>.<br/><br/><strong>When:</strong> ${when}<br/><strong>Where:</strong> ${where || "See application"}`,
      { url: jobUrl, label: "Open application" }
    ),
  }),
};
